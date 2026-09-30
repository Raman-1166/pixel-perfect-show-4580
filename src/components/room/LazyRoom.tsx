import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { RoomCanvasProps } from "./RoomCanvas";

// The 3D scene is code-split and only loaded in the browser once it scrolls near view.
const RoomCanvas = lazy(() => import("./RoomCanvas"));

function Loading() {
  const [p, setP] = useState(8);
  useEffect(() => {
    const id = setInterval(() => setP((v) => Math.min(94, v + (100 - v) * 0.12)), 120);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 grid place-items-center bg-muted" role="status" aria-label="Loading 3D room">
      <div className="w-48">
        <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Preparing the room</p>
        <div className="h-0.5 w-full overflow-hidden bg-border">
          <div className="h-full bg-accent transition-all" style={{ width: `${p}%` }} />
        </div>
      </div>
    </div>
  );
}

export function LazyRoom(props: RoomCanvasProps & { className?: string }) {
  const { className, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {show ? (
        <Suspense fallback={<Loading />}>
          <RoomCanvas {...rest} />
        </Suspense>
      ) : (
        <Loading />
      )}
    </div>
  );
}
