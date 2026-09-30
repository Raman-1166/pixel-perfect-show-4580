import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { RoomCanvasProps } from "./RoomCanvas";
import livingRoomFallback from "@/assets/living-room.jpg";

// The 3D scene is code-split and only loaded in the browser once it scrolls near view.
const RoomCanvas = lazy(() => import("./RoomCanvas"));

function Loading() {
  const [p, setP] = useState(15);
  useEffect(() => {
    const id = setInterval(() => setP((v) => Math.min(96, v + (100 - v) * 0.16)), 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center bg-[#151D1A]" role="status" aria-label="Loading 3D room">
      <div className="w-56 text-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#E8CA6E] font-medium">
          Ganesh Dream House
        </p>
        <p className="mb-3 text-xs tracking-wider text-white/70">
          Preparing 3D Architectural Scene
        </p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C59B27] via-[#E8CA6E] to-[#FFF1C5] transition-all duration-300 shadow-[0_0_8px_rgba(232,202,110,0.8)]"
            style={{ width: `${p}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function WebGLFallback({ grey }: { grey?: boolean | undefined }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <img
        src={livingRoomFallback}
        alt="Living Room Makeover"
        className={`h-full w-full object-cover ${grey ? "grayscale contrast-90 brightness-75" : ""}`}
      />
    </div>
  );
}

export function LazyRoom(props: RoomCanvasProps & { className?: string }) {
  const { className, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) setShow(true);
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ?? "relative"}>
      {!hasWebGL ? (
        <WebGLFallback grey={rest.grey} />
      ) : show ? (
        <Suspense fallback={<Loading />}>
          <RoomCanvas {...rest} />
        </Suspense>
      ) : (
        <Loading />
      )}
    </div>
  );
}
