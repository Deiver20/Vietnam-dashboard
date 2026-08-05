// Final scene lighting, hand-tuned by the user in the live editor and baked
// in from their exported config (July 2026). Lights live outside the globe
// group on purpose: the camera is locked and only the planet rotates, so
// these angles never change. Directional lights only care about direction —
// the two keys sit behind-left so the limb catches the cyan glow while the
// front stays lit by the soft white fill + ambient.
export default function Lights() {
  return (
    <>
      <ambientLight color="#f2f2f2" intensity={4} />
      <directionalLight
        color="#00a6ff"
        intensity={6.85}
        position={[-1.27, 1.87, -3.9135]}
      />
      <directionalLight
        color="#97d6f7"
        intensity={12.5}
        position={[-2.284, 2.601, -2.18]}
      />
      <directionalLight
        color="#ffffff"
        intensity={1.25}
        position={[0.0104, 0.0736, 0.85]}
      />
    </>
  );
}
