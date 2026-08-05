"use client";

import { useEffect, useRef, useState } from "react";

export default function Placeholder({
  className = "",
  text = "Image",
  originalFile,
  lazy = true,
}: {
  className?: string;
  text?: string;
  originalFile?: string;
  lazy?: boolean;
}) {
  const [showTip, setShowTip] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Above-the-fold images can fail BEFORE hydration attaches onError (the
  // browser already fired the event on the server-rendered <img>), leaving a
  // broken-image icon instead of the fallback box. Catch that case on mount.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (!originalFile || failed) {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#0a2748] border border-dashed border-[#0f3160] rounded-lg text-[#94959b] text-xs font-medium select-none ${className}`}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <span>{text}</span>
        {originalFile && showTip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#030f1c] border border-[#0f3160] rounded-md shadow-lg whitespace-nowrap z-50">
            <span className="text-[11px] text-[#67a6ff] font-mono">{originalFile}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f3160]" />
          </div>
        )}
      </div>
    );
  }

  const normalizedPath = /^(https?:)?\/\//.test(originalFile) || originalFile.startsWith("/")
    ? originalFile
    : `/${originalFile.replace(/^(\.\.\/)+/, "")}`;

  return (
    <img
      ref={imgRef}
      src={normalizedPath}
      alt={text}
      className={className}
      onError={() => setFailed(true)}
      loading={lazy ? "lazy" : "eager"}
    />
  );
}
