import Image from "next/image";
import { COUNTRIES } from "../datasets";

/** Small flag image using next/image. Flags are local SVGs, so `unoptimized`
 *  is used (Next's optimizer rejects SVG by default). Falls back to the emoji
 *  when a country has no flag asset. */
export default function FlagImg({ code, size }: { code: string; size: number }) {
  const c = COUNTRIES[code];
  if (!c) return null;
  const src = c.flag ? (c.flag.startsWith("/") ? c.flag : `/${c.flag}`) : "";
  if (!src) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{c.emoji}</span>;
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className="rounded-full object-cover"
    />
  );
}
