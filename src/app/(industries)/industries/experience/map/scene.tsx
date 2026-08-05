import { useEffect, useLayoutEffect, useRef } from "react";
import {
  Matrix4,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type PerspectiveCamera,
} from "three";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { shallow } from "zustand/shallow";
import Globe from "./globe";
import FlatCountry from "./flatCountry";
import { lonLatToVector3, northTangent } from "./countryShapes";
import {
  atmosphereMaterial,
  BORDER_OPACITY,
  borderMaterial,
  flatOutlineMaterial,
  flatSideMaterial,
  flatTopMaterial,
  LAND_OPACITY,
  innerShadowMaterial,
  landMaterial,
  oceanMaterial,
  rimMaterial,
  selectedMaterial,
  upgradeEarthTextureTo4k,
} from "./materials";
import { getCountryCentroid } from "../data/world";
import { useIndustriesStore } from "../stores";

const CAM_INTRO = new Vector3(0, 1.6, 8.6);
const CAM_HOME = new Vector3(0, 0.3, 3.8);
// The globe-level camera is LOCKED on this ray (the user asked for a fixed
// stage: only the planet moves, so the static lights keep their angles).
// Wheel-zoom just dollies along it.
const CAM_HOME_DIR = CAM_HOME.clone().normalize();
const CAM_HOME_DIST = CAM_HOME.length();
const GLOBE_ZOOM_MIN = 2.2;
const GLOBE_ZOOM_MAX = 3.85;
const WORLD_X = new Vector3(1, 0, 0);
const WORLD_Y = new Vector3(0, 1, 0);
const SPIN_SPEED = 0.005; // rad per dragged px
// Where the zoom ends while the picked country still faces the camera…
const CAM_FACE = new Vector3(0, 0, 2.7);
// …and the Demo0-style elevated view once the country lies flat.
const CAM_LEVEL3 = new Vector3(0, 1.35, 2.25);

const FLAT_HOME = { x: 0, y: -0.04, scale: 1.13 };
// Level-4 parking spot: the country moves from screen center to the CENTER
// OF THE RIGHT HALF of the viewport (the Cover/pages column reads on the
// left) and stays there for the whole dashboard. x is aspect-dependent, so
// toDataBackground computes it per hop; the scale is sized to keep the
// country contained inside that right half instead of spanning the screen.
const FLAT_BACK = { y: -0.02, scale: 1.2 };
// Final recline of the flat country. Face-on to the CAM_LEVEL3 camera would
// be -0.54 rad; this leans just a bit past it so the prism still reads as 3D.
const FLAT_TILT = -0.8;
// User drag rotation on the flat map is clamped to ±15° per axis…
const FLAT_MAX_TURN = Math.PI / 12;
// …and eases back to the rest pose after this much idle time (seconds).
const FLAT_RETURN_DELAY = 3;

const flatMaterials = [flatTopMaterial, flatSideMaterial];

function spinnableNow() {
  const s = useIndustriesStore.getState();
  return s.introDone && s.level <= 2 && !s.transitioning;
}

// Levels 3–4 are a fixed stage too: dragging rotates the flat country map,
// never the camera.
function flatSpinnableNow() {
  const s = useIndustriesStore.getState();
  return s.introDone && s.level >= 3 && !s.transitioning;
}

export default function Scene() {
  const camera = useThree((s) => s.camera);
  const globeRef = useRef<Group>(null);
  const flatRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const flatSpinRef = useRef<Group>(null);
  const zoomTl = useRef<gsap.core.Timeline | null>(null);
  const selectedMesh = useRef<Mesh | null>(null);
  const spinDrag = useRef({ active: false, x: 0, y: 0 });
  const flatDrag = useRef({ active: false, x: 0, y: 0 });
  // Accumulated (clamped) drag rotation of the flat map, and its idle-return
  // choreography.
  const flatPose = useRef({ yaw: 0, pitch: 0 });
  const flatReturnTween = useRef<gsap.core.Tween | null>(null);
  const flatReturnTimer = useRef<gsap.core.Tween | null>(null);
  const uprightTween = useRef<gsap.core.Tween | null>(null);
  const uprightTimer = useRef<gsap.core.Tween | null>(null);
  const zoomHomeTween = useRef<gsap.core.Tween | null>(null);
  const zoomHomeTimer = useRef<gsap.core.Tween | null>(null);
  const zoomDist = useRef(CAM_HOME_DIST);

  // Drag-to-spin: the user grabs the planet itself; the camera never orbits
  // at globe levels.
  const onSpinStart = (e: ThreeEvent<PointerEvent>) => {
    if (!spinnableNow()) return;
    // Full freedom while interacting: cancel any pending/running righting
    // and any pending/running zoom-home glide.
    uprightTimer.current?.kill();
    uprightTimer.current = null;
    uprightTween.current?.kill();
    uprightTween.current = null;
    zoomHomeTimer.current?.kill();
    zoomHomeTimer.current = null;
    zoomHomeTween.current?.kill();
    zoomHomeTween.current = null;
    spinDrag.current = { active: true, x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    // Smoothly restore the vertical axis (north up) after a drag leaves the
    // globe tilted or upside down, keeping the heading.
    const rightGlobe = () => {
      const globe = globeRef.current;
      if (!globe) return;
      const up = WORLD_Y.clone().applyQuaternion(globe.quaternion);
      if (up.angleTo(WORLD_Y) < 0.001) return;
      const qStart = globe.quaternion.clone();
      const qEnd = new Quaternion()
        .setFromUnitVectors(up.normalize(), WORLD_Y)
        .multiply(qStart);
      const proxy = { t: 0 };
      uprightTween.current = gsap.to(proxy, {
        t: 1,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          globe.quaternion.slerpQuaternions(qStart, qEnd, proxy.t);
        },
      });
    };

    // Total freedom for 5s of idle, then gently restore the vertical axis.
    // Shared by drag-release AND the return from a country dive: if the 5s
    // fire while the dive has spinnableNow() false, the righting is skipped
    // and the timer is spent — so coming back to the globe must re-arm it,
    // or an exaggerated pose would stick forever.
    const scheduleUpright = () => {
      uprightTimer.current?.kill();
      uprightTimer.current = gsap.delayedCall(5, () => {
        uprightTimer.current = null;
        if (spinnableNow() && !spinDrag.current.active) rightGlobe();
      });
    };

    // Same 5s-afk contract for the wheel zoom: glide the dolly back to the
    // resting distance. Only zoomDist is tweened — the camera itself keeps
    // chasing it through the usual smoothing, so the glide stays gentle.
    const scheduleZoomHome = () => {
      zoomHomeTimer.current?.kill();
      zoomHomeTimer.current = gsap.delayedCall(5, () => {
        zoomHomeTimer.current = null;
        if (!spinnableNow() || spinDrag.current.active) return;
        if (Math.abs(zoomDist.current - CAM_HOME_DIST) < 0.01) return;
        zoomHomeTween.current = gsap.to(zoomDist, {
          current: CAM_HOME_DIST,
          duration: 1.2,
          ease: "power2.inOut",
        });
      });
    };

    // After the drag ends, ease the flat map back to its rest pose.
    const scheduleFlatReturn = () => {
      flatReturnTimer.current?.kill();
      flatReturnTimer.current = gsap.delayedCall(FLAT_RETURN_DELAY, () => {
        flatReturnTimer.current = null;
        const spin = flatSpinRef.current;
        if (!spin || flatDrag.current.active) return;
        flatReturnTween.current = gsap.to(flatPose.current, {
          yaw: 0,
          pitch: 0,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            spin.rotation.set(flatPose.current.pitch, flatPose.current.yaw, 0);
          },
        });
      });
    };

    // Flat-country drag starts on the bare canvas (DOM overlays — buttons,
    // tabs, cards — keep their own pointer events and never reach it).
    const onFlatDown = (ev: PointerEvent) => {
      if (!flatSpinnableNow()) return;
      if (!(ev.target instanceof HTMLCanvasElement)) return;
      flatReturnTimer.current?.kill();
      flatReturnTimer.current = null;
      flatReturnTween.current?.kill();
      flatReturnTween.current = null;
      flatDrag.current = { active: true, x: ev.clientX, y: ev.clientY };
    };

    const onMove = (ev: PointerEvent) => {
      const d = spinDrag.current;
      if (d.active) {
        if (!spinnableNow()) {
          d.active = false;
          return;
        }
        const globe = globeRef.current;
        if (!globe) return;
        const dx = ev.clientX - d.x;
        const dy = ev.clientY - d.y;
        d.x = ev.clientX;
        d.y = ev.clientY;
        globe.rotateOnWorldAxis(WORLD_Y, dx * SPIN_SPEED);
        globe.rotateOnWorldAxis(WORLD_X, dy * SPIN_SPEED);
        return;
      }
      const f = flatDrag.current;
      if (!f.active) return;
      if (!flatSpinnableNow()) {
        f.active = false;
        return;
      }
      const spin = flatSpinRef.current;
      if (!spin) return;
      const dx = ev.clientX - f.x;
      const dy = ev.clientY - f.y;
      f.x = ev.clientX;
      f.y = ev.clientY;
      // The map only turns a limited amount (±FLAT_MAX_TURN per axis) around
      // its rest pose: horizontal drag yaws it, vertical drag tips it.
      const clamp = gsap.utils.clamp(-FLAT_MAX_TURN, FLAT_MAX_TURN);
      const pose = flatPose.current;
      pose.yaw = clamp(pose.yaw + dx * SPIN_SPEED);
      pose.pitch = clamp(pose.pitch + dy * SPIN_SPEED);
      spin.rotation.set(pose.pitch, pose.yaw, 0);
    };

    const onUp = () => {
      if (flatDrag.current.active) {
        flatDrag.current.active = false;
        scheduleFlatReturn();
      }
      if (!spinDrag.current.active) return;
      spinDrag.current.active = false;
      scheduleUpright();
      // A drag also counts as activity for the zoom's afk clock.
      scheduleZoomHome();
    };

    // Wheel dollies the camera along its fixed ray (angle never changes).
    const onWheel = (e: WheelEvent) => {
      if (!spinnableNow()) return;
      // A running zoom-home glide yields to the user immediately.
      zoomHomeTween.current?.kill();
      zoomHomeTween.current = null;
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 800 : 1;
      zoomDist.current = Math.min(
        GLOBE_ZOOM_MAX,
        Math.max(GLOBE_ZOOM_MIN, zoomDist.current + e.deltaY * scale * 0.0012)
      );
      scheduleZoomHome();
    };

    // Back to world view (3 → 1/2): re-arm the auto-righting. The 5s delay
    // comfortably outlasts the ~2.4s zoom-out, so spinnableNow() is true
    // again by the time it fires.
    const unsubUpright = useIndustriesStore.subscribe(
      (s) => s.level,
      (level, prev) => {
        if (prev >= 3 && level <= 2) scheduleUpright();
      }
    );

    window.addEventListener("pointerdown", onFlatDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      unsubUpright();
      window.removeEventListener("pointerdown", onFlatDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      uprightTimer.current?.kill();
      uprightTimer.current = null;
      uprightTween.current?.kill();
      uprightTween.current = null;
      zoomHomeTimer.current?.kill();
      zoomHomeTimer.current = null;
      zoomHomeTween.current?.kill();
      zoomHomeTween.current = null;
      flatReturnTimer.current?.kill();
      flatReturnTimer.current = null;
      flatReturnTween.current?.kill();
      flatReturnTween.current = null;
    };
  }, []);

  // Camera intro (Demo2 base.tsx pattern) — releases the global lock when done.
  useLayoutEffect(() => {
    camera.position.copy(CAM_INTRO);
    camera.lookAt(0, 0, 0);

    const tl = gsap.timeline();
    tl.to(camera.position, {
      x: CAM_HOME.x,
      y: CAM_HOME.y,
      z: CAM_HOME.z,
      duration: 2.4,
      ease: "circ.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
    });
    tl.fromTo(oceanMaterial, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.2);
    tl.fromTo(
      landMaterial,
      { opacity: 0 },
      { opacity: LAND_OPACITY, duration: 1.6 },
      0.5
    );
    tl.fromTo(
      borderMaterial,
      { opacity: 0 },
      { opacity: BORDER_OPACITY, duration: 1.6 },
      0.7
    );
    tl.fromTo(
      [atmosphereMaterial, rimMaterial, innerShadowMaterial],
      { opacity: 0 },
      { opacity: 1, duration: 1.6 },
      0.7
    );
    tl.add(() => {
      useIndustriesStore.setState({ introDone: true, transitioning: false });
      // Intro is done — trade the fast 2048 color map for the full 4096 one
      // so zoomed-in terrain stays crisp (deliberately after the intro to
      // keep the first paint off this ~630 KB download).
      upgradeEarthTextureTo4k();
    });

    return () => {
      tl.kill();
    };
  }, [camera]);

  useFrame((_, delta) => {
    const s = useIndustriesStore.getState();
    const spinnable = s.introDone && s.level <= 2 && !s.transitioning;

    // Idle spin while browsing the globe (paused during drags/righting).
    if (
      globeRef.current &&
      spinnable &&
      !s.hoveredCountryId &&
      !spinDrag.current.active &&
      !uprightTween.current?.isActive()
    ) {
      globeRef.current.rotateOnWorldAxis(WORLD_Y, delta * 0.05);
    }

    // Camera lock + smooth dolly zoom on the fixed home ray.
    if (spinnable) {
      const cur = camera.position.length();
      const next = cur + (zoomDist.current - cur) * Math.min(1, delta * 8);
      camera.position.copy(CAM_HOME_DIR).multiplyScalar(next);
      camera.lookAt(0, 0, 0);
    } else {
      // Timelines own the camera: keep the zoom target in sync so control
      // resumes exactly where they left it.
      zoomDist.current = camera.position.length();
    }
  });

  useEffect(() => {
    const playZoomIn = () => {
      const globe = globeRef.current;
      const flat = flatRef.current;
      const tilt = tiltRef.current;
      const s = useIndustriesStore.getState();
      if (!globe || !flat || !tilt || !s.selectedCountryId) {
        useIndustriesStore.setState({ transitioning: false });
        return;
      }

      // The zoom timeline owns the globe quaternion from here.
      uprightTimer.current?.kill();
      uprightTimer.current = null;
      uprightTween.current?.kill();
      uprightTween.current = null;

      const mesh = globe.getObjectByName(s.selectedCountryId) as Mesh | null;
      if (mesh) mesh.material = selectedMaterial;
      selectedMesh.current = mesh;

      // End orientation: country centroid faces the camera, north up.
      const [lon, lat] = getCountryCentroid(s.selectedCountryId);
      const e3 = lonLatToVector3(lon, lat, 1).normalize();
      const e2 = northTangent(lon, lat)
        .sub(e3.clone().multiplyScalar(northTangent(lon, lat).dot(e3)))
        .normalize();
      const e1 = new Vector3().crossVectors(e2, e3);
      const qStart = globe.quaternion.clone();
      const qEnd = new Quaternion()
        .setFromRotationMatrix(new Matrix4().makeBasis(e1, e2, e3))
        .invert();
      const camStart = camera.position.clone();
      const proxy = { t: 0 };

      // Size-match the flat country to its on-globe footprint so the
      // in-place crossfade reads as one continuous object. The globe country
      // sits ~1 unit closer to the camera than the flat plane, hence the
      // perspective correction.
      let s0 = 0.62;
      if (mesh) {
        mesh.geometry.computeBoundingBox();
        const size = mesh.geometry.boundingBox!.getSize(new Vector3());
        const globeSpan = Math.max(size.x, size.y, size.z);
        const flatSpan: number = flat.userData.span || 1.2;
        const perspective = CAM_FACE.z / (CAM_FACE.z - 1);
        s0 = gsap.utils.clamp(0.3, 1.5, (globeSpan / flatSpan) * perspective);
      }

      const tl = gsap.timeline({
        onComplete: () => useIndustriesStore.setState({ transitioning: false }),
        onReverseComplete: () => {
          if (selectedMesh.current) {
            selectedMesh.current.material = landMaterial;
            selectedMesh.current = null;
          }
          zoomTl.current = null;
          useIndustriesStore.setState({ transitioning: false });
        },
      });

      // Phase A — rotate the picked country to face the camera while
      // gliding in.
      tl.to(
        proxy,
        {
          t: 1,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            globe.quaternion.slerpQuaternions(qStart, qEnd, proxy.t);
            camera.position.lerpVectors(camStart, CAM_FACE, proxy.t);
            camera.lookAt(0, 0, 0);
          },
        },
        0
      );

      // Dim everything that isn't the picked country.
      tl.to(landMaterial, { opacity: 0.06, duration: 0.9, ease: "power1.inOut" }, 0.45);
      tl.to(borderMaterial, { opacity: 0.08, duration: 0.9 }, 0.45);
      tl.to([atmosphereMaterial, rimMaterial, innerShadowMaterial], { opacity: 0.35, duration: 0.9 }, 0.45);

      // Phase B — crossfade globe country → flat country in place: the flat
      // prism appears centered, face-on and size-matched over the globe
      // country, so nothing jumps while the layers swap.
      tl.set(flat.position, { x: 0, y: -0.02, z: 0 }, 1.45);
      tl.set(flat.scale, { x: s0, y: s0, z: s0 }, 1.45);
      tl.set(tilt.rotation, { x: 0, y: 0, z: 0 }, 1.45);

      tl.to([landMaterial, borderMaterial], { opacity: 0, duration: 0.55 }, 1.5);
      tl.to(oceanMaterial, { opacity: 0, duration: 0.55 }, 1.5);
      tl.to([atmosphereMaterial, rimMaterial, innerShadowMaterial], { opacity: 0, duration: 0.5 }, 1.45);
      tl.to(selectedMaterial, { opacity: 0, duration: 0.55 }, 1.55);

      tl.fromTo(flatTopMaterial, { opacity: 0 }, { opacity: 1, duration: 0.65 }, 1.5);
      tl.fromTo(flatSideMaterial, { opacity: 0 }, { opacity: 1, duration: 0.65 }, 1.5);
      tl.fromTo(
        flatOutlineMaterial,
        { opacity: 0 },
        { opacity: 0.9, duration: 0.65 },
        1.5
      );

      // Globe fully faded: drop it and give the flat prism real depth.
      tl.set(globe, { visible: false }, 2.2);
      tl.set(flatMaterials, { depthTest: true, depthWrite: true }, 2.2);

      // Phase C — one continuous move: the camera rises to the Demo0-style
      // elevated view while the country lies down, glides to its home spot
      // and reaches full size.
      const settle = { duration: 1.0, ease: "power2.inOut" } as const;
      tl.to(
        camera.position,
        {
          x: CAM_LEVEL3.x,
          y: CAM_LEVEL3.y,
          z: CAM_LEVEL3.z,
          ...settle,
          onUpdate: () => camera.lookAt(0, 0, 0),
        },
        2.25
      );
      tl.to(tilt.rotation, { x: FLAT_TILT, ...settle }, 2.25);
      tl.to(flat.position, { x: FLAT_HOME.x, y: FLAT_HOME.y, ...settle }, 2.25);
      tl.to(
        flat.scale,
        {
          x: FLAT_HOME.scale,
          y: FLAT_HOME.scale,
          z: FLAT_HOME.scale,
          ...settle,
        },
        2.25
      );

      zoomTl.current = tl;
    };

    const playZoomOut = () => {
      const tl = zoomTl.current;
      if (!tl) {
        restoreGlobe();
        return;
      }
      // The user may have rotated the map away at Level 3 — settle it back to
      // the timeline's recorded pose first, so reversing never snaps. (The
      // camera itself never moves at these levels.)
      flatReturnTimer.current?.kill();
      flatReturnTimer.current = null;
      flatReturnTween.current?.kill();
      flatReturnTween.current = null;
      const spin = flatSpinRef.current;
      if (spin) {
        gsap.to(flatPose.current, {
          yaw: 0,
          pitch: 0,
          duration: 0.35,
          ease: "power1.out",
          onUpdate: () => {
            spin.rotation.set(flatPose.current.pitch, flatPose.current.yaw, 0);
          },
          onComplete: () => {
            tl.timeScale(1.3).reverse();
          },
        });
      } else {
        tl.timeScale(1.3).reverse();
      }
    };

    // Y that parks the country fully above the screen top at the Level-3/4
    // camera: half the visible height at the origin plane plus the
    // country's own footprint, with margin.
    const flatOffTopY = () => {
      const cam = camera as PerspectiveCamera;
      return Math.tan((cam.fov * Math.PI) / 360) * CAM_LEVEL3.length() + 1.4;
    };

    const toDataBackground = (enter: boolean) => {
      const flat = flatRef.current;
      if (!flat) return;
      // Center of the right half of the viewport at the country's depth:
      // half the visible width at the origin plane (depends on the window's
      // aspect — recomputed on every 3↔4 hop so it tracks resizes), halved
      // again. The camera sits at CAM_LEVEL3 looking at the origin here.
      const cam = camera as PerspectiveCamera;
      const halfW =
        Math.tan((cam.fov * Math.PI) / 360) * CAM_LEVEL3.length() * cam.aspect;
      const target = enter ? { ...FLAT_BACK, x: halfW / 2 } : FLAT_HOME;
      // The showcase belongs to the Cover only (page 0): entering Level 4
      // straight into a data page parks the country above the screen top —
      // the page↔page subscription below floats it in/out from there.
      const offTop = enter && useIndustriesStore.getState().pageIndex > 0;
      gsap.killTweensOf(flat.position);
      gsap.to(flat.position, {
        x: target.x,
        y: offTop ? flatOffTopY() : target.y,
        duration: 0.9,
        ease: "power2.inOut",
      });
      gsap.to(flat.scale, {
        x: target.scale,
        y: target.scale,
        z: target.scale,
        duration: 0.9,
        ease: "power2.inOut",
      });
      // No opacity fade either way: the country is a showcase on the right
      // half of the dashboard, not a dimmed backdrop — it keeps the full
      // Level-3 opacities (top/side 1, outline 0.9) for the whole Level 4.
    };

    const restoreGlobe = () => {
      // Safety net when no zoom timeline exists to reverse: snap the scene
      // back to its Level-2 state so the lock can never wedge.
      const globe = globeRef.current;
      if (globe) globe.visible = true;
      gsap.set(landMaterial, { opacity: LAND_OPACITY });
      gsap.set(borderMaterial, { opacity: BORDER_OPACITY });
      gsap.set(oceanMaterial, { opacity: 1 });
      gsap.set([atmosphereMaterial, rimMaterial, innerShadowMaterial], { opacity: 1 });
      gsap.set([...flatMaterials, flatOutlineMaterial], { opacity: 0 });
      flatTopMaterial.depthTest = flatTopMaterial.depthWrite = false;
      flatSideMaterial.depthTest = flatSideMaterial.depthWrite = false;
      if (tiltRef.current) tiltRef.current.rotation.set(0, 0, 0);
      if (flatSpinRef.current) flatSpinRef.current.rotation.set(0, 0, 0);
      flatPose.current = { yaw: 0, pitch: 0 };
      if (selectedMesh.current) {
        selectedMesh.current.material = landMaterial;
        selectedMesh.current = null;
      }
      gsap.to(camera.position, {
        x: CAM_HOME.x,
        y: CAM_HOME.y,
        z: CAM_HOME.z,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => camera.lookAt(0, 0, 0),
        // Released here so the camera-lock frame loop never fights the tween.
        onComplete: () => useIndustriesStore.setState({ transitioning: false }),
      });
    };

    const unsubLevel = useIndustriesStore.subscribe(
      (s) => s.level,
      (level, prev) => {
        // Both entry paths (industry globe L2, or plain globe L1 on the
        // country-first flow) share the same zoom choreography.
        if (prev <= 2 && level === 3) playZoomIn();
        else if (prev === 3 && level <= 2) playZoomOut();
        else if (prev === 3 && level === 4) toDataBackground(true);
        else if (prev === 4 && level === 3) toDataBackground(false);
      }
    );

    // The 3D country is a Cover-only showcase inside Level 4: leaving the
    // cover floats it gently off through the screen top; coming back floats
    // it down again. Level hops are handled by the subscription above —
    // this one only reacts to page↔page moves within Level 4.
    const unsubPage = useIndustriesStore.subscribe(
      (s) => [s.level, s.pageIndex] as const,
      ([level, page], [prevLevel, prevPage]) => {
        if (level !== 4 || prevLevel !== 4 || page === prevPage) return;
        const flat = flatRef.current;
        if (!flat) return;
        if (prevPage === 0 && page > 0) {
          gsap.killTweensOf(flat.position);
          gsap.to(flat.position, {
            y: flatOffTopY(),
            duration: 1.1,
            ease: "power2.inOut",
          });
        } else if (page === 0 && prevPage > 0) {
          gsap.killTweensOf(flat.position);
          gsap.to(flat.position, {
            y: FLAT_BACK.y,
            duration: 1.1,
            ease: "power2.inOut",
          });
        }
      },
      { equalityFn: shallow }
    );

    return () => {
      unsubLevel();
      unsubPage();
      zoomTl.current?.kill();
      zoomTl.current = null;
    };
  }, [camera]);

  return (
    <>
      <Globe groupRef={globeRef} onSpinStart={onSpinStart} />
      <FlatCountry groupRef={flatRef} tiltRef={tiltRef} spinRef={flatSpinRef} />
    </>
  );
}
