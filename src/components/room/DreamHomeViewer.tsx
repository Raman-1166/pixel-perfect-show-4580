import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

export type PaletteKey = "green" | "navy" | "terra" | "grey";
export type RoomKey = "living" | "dining" | "kitchen" | "bed";

export interface PaletteDef {
  n: string;
  main: number;
  acc: number;
  wood: number;
}

export const PAL: Record<PaletteKey, PaletteDef> = {
  green: { n: "Emerald", main: 0x1f4a3c, acc: 0xd9a83f, wood: 0xb9793f },
  navy: { n: "Navy", main: 0x1c2b4d, acc: 0xd4af5a, wood: 0x8a5a3a },
  terra: { n: "Terracotta", main: 0xb4593a, acc: 0x8a5a2b, wood: 0x9a6035 },
  grey: { n: "Grey", main: 0x5b6068, acc: 0xb9b9b6, wood: 0xc9a97c },
};

export const ROOMS_META: Record<RoomKey, string> = {
  living: "Living Room",
  dining: "Dining Room",
  kitchen: "Kitchen",
  bed: "Bedroom",
};

export function DreamHomeViewer() {
  const stRef = useRef<HTMLDivElement>(null);
  const hdRef = useRef<HTMLDivElement>(null);

  const [activeRoom, setActiveRoom] = useState<RoomKey>("living");
  const [activePal, setActivePal] = useState<PaletteKey>("green");

  // Ref to hold mutable runtime states across animations and renders
  const stateRef = useRef({
    room: activeRoom,
    palKey: activePal,
    split: 0.5,
    dragging: false,
    autoSweep: true,
    tx: 0,
    mx: 0,
    t0: performance.now(),
  });

  const rebuildRef = useRef<() => void>(() => {});

  const setSplit = useCallback((p: number) => {
    const val = Math.max(0, Math.min(1, p));
    stateRef.current.split = val;
    if (hdRef.current) {
      hdRef.current.style.left = `${val * 100}%`;
    }
  }, []);

  useEffect(() => {
    stateRef.current.room = activeRoom;
    stateRef.current.palKey = activePal;
    rebuildRef.current();
  }, [activeRoom, activePal]);

  useEffect(() => {
    const st = stRef.current;
    if (!st) return;

    // Initialize WebGLRenderer with exact scissor testing & shadow mapping
    const R = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    R.shadowMap.enabled = true;
    R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.setScissorTest(true);
    st.prepend(R.domElement);

    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0xe8e5de);

    const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    sc.add(new THREE.HemisphereLight(0xffffff, 0xc9b89a, 0.75));

    const sun = new THREE.DirectionalLight(0xfff1d6, 0.9);
    sun.position.set(-8, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
    sc.add(sun);

    const shell = new THREE.Group();
    const fur = new THREE.Group();
    sc.add(shell, fur);

    const M = (c: number | string, r = 0.6, m = 0) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

    function B(
      w: number,
      h: number,
      d: number,
      c: number | string,
      x: number,
      y: number,
      z: number,
      g: THREE.Group = fur,
      mat?: THREE.Material
    ) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || M(c));
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }

    function C(
      rt: number,
      rb: number,
      h: number,
      c: number | string,
      x: number,
      y: number,
      z: number,
      g: THREE.Group = fur,
      mat?: THREE.Material
    ) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32), mat || M(c));
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }

    function L(x: number, y: number, z: number, r = 0.28) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 20, 16),
        new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd98a, emissiveIntensity: 0.9 })
      );
      mesh.position.set(x, y, z);
      fur.add(mesh);
      const p = new THREE.PointLight(0xffd9a0, 0.55, 9);
      p.position.set(x, y - 0.2, z);
      fur.add(p);
    }

    function pend(x: number, y: number, z: number, P: PaletteDef) {
      C(0.02, 0.02, 4 - y, P.acc, x, (4 + y) / 2, z, fur, M(P.acc, 0.3, 0.8));
      L(x, y, z);
    }

    function plant(x: number, z: number, s = 1) {
      C(0.4 * s, 0.32 * s, 0.8 * s, 0xe0946a, x, 0.4 * s, z);
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.42 * s, 14, 12),
          M(i % 2 ? 0x2f6544 : 0x3e7a52)
        );
        leaf.scale.set(0.5, 1.5, 0.5);
        const a = i * 1.26;
        leaf.position.set(x + Math.cos(a) * 0.22 * s, 1.3 * s, z + Math.sin(a) * 0.22 * s);
        leaf.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4);
        leaf.castShadow = true;
        fur.add(leaf);
      }
    }

    function art(x: number, y: number, w: number, h: number, P: PaletteDef, c = P.main) {
      B(w + 0.16, h + 0.16, 0.08, 0, x, y, -3.93, fur, M(P.acc, 0.3, 0.8));
      B(w, h, 0.1, c, x, y, -3.9);
      const circleMesh = C(w * 0.25, w * 0.25, 0.12, P.acc, x, y, -3.85);
      circleMesh.rotation.x = Math.PI / 2;
    }

    function rug(x: number, z: number, w: number, d: number, c = 0xcfd3b4) {
      B(w, 0.04, d, c, x, 0.02, z, fur, M(c, 1));
    }

    function chair(x: number, z: number, ry: number, P: PaletteDef) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      fur.add(g);
      B(0.8, 0.12, 0.8, P.main, 0, 0.85, 0, g);
      B(0.8, 0.9, 0.1, P.main, 0, 1.3, -0.4, g);
      [
        [-0.35, -0.35],
        [0.35, -0.35],
        [-0.35, 0.35],
        [0.35, 0.35],
      ].forEach((p) => B(0.07, 0.8, 0.07, 0, p[0]!, 0.4, p[1]!, g, M(P.acc, 0.3, 0.8)));
    }

    function stool(x: number, z: number, P: PaletteDef) {
      C(0.4, 0.4, 0.12, P.main, x, 1.6, z);
      C(0.05, 0.05, 1.5, 0, x, 0.8, z, fur, M(P.acc, 0.3, 0.8));
    }

    function sofa(x: number, z: number, P: PaletteDef) {
      B(4, 0.6, 1.5, P.main, x, 0.5, z);
      B(4, 1, 0.4, P.main, x, 1.15, z - 0.6);
      B(0.4, 1, 1.5, P.main, x - 2, 0.8, z);
      B(0.4, 1, 1.5, P.main, x + 2, 0.8, z);
      for (let i = -1; i < 2; i++) {
        B(1.15, 0.3, 1.1, P.main, x + i * 1.2, 0.95, z + 0.1, fur, M(P.main, 0.9));
      }
      const cushion = B(0.55, 0.55, 0.2, P.acc, x - 1.3, 1.35, z - 0.25, fur);
      cushion.rotation.z = 0.3;
      B(0.55, 0.55, 0.2, 0xf3efe6, x + 1.4, 1.35, z - 0.25);
    }

    function lamp(x: number, z: number, P: PaletteDef) {
      C(0.03, 0.03, 3, P.acc, x, 1.5, z, fur, M(P.acc, 0.3, 0.8));
      C(
        0.3,
        0.45,
        0.6,
        0xfff6e0,
        x,
        3,
        z,
        fur,
        new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd98a, emissiveIntensity: 0.6 })
      );
      const p = new THREE.PointLight(0xffd9a0, 0.5, 8);
      p.position.set(x, 2.8, z);
      fur.add(p);
    }

    function lamp2(x: number, z: number) {
      C(
        0.2,
        0.28,
        0.4,
        0xfff6e0,
        x,
        1.3,
        z,
        fur,
        new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd98a, emissiveIntensity: 0.8 })
      );
      const p = new THREE.PointLight(0xffd9a0, 0.5, 7);
      p.position.set(x, 1.5, z);
      fur.add(p);
    }

    function side(x: number, z: number, P: PaletteDef, w = 3.2) {
      B(w, 0.9, 0.9, P.wood, x, 0.65, z);
      [-1, 1].forEach((s) => B(0.06, 0.25, 0.06, P.acc, x + s * (w / 2 - 0.2), 0.12, z + 0.3));
    }

    const ROOMS: Record<RoomKey, (P: PaletteDef) => void> = {
      living(P) {
        rug(0, 0.3, 6, 4);
        sofa(-0.3, -2.6, P);
        C(1, 1, 0.1, 0, 0, 0.75, 0.4, fur, M(P.wood, 0.4)).castShadow = true;
        C(0.08, 0.08, 0.7, P.wood, 0, 0.35, 0.4);
        B(0.6, 0.1, 0.45, P.main, -0.3, 0.85, 0.4);
        B(1.3, 0.35, 1.3, 0xf3efe6, -1.2, 0.6, 2).rotation.y = 0.4;
        C(0.6, 0.6, 0.7, 0xf3efe6, 1.4, 0.35, 1.6);

        const c = new THREE.Group();
        c.position.set(3.4, 0, 0.5);
        c.rotation.y = -0.9;
        fur.add(c);
        B(1.3, 0.5, 1.3, 0xf3efe6, 0, 0.5, 0, c);
        B(1.3, 1, 0.25, 0xf3efe6, 0, 1, -0.55, c);
        B(0.5, 0.4, 0.2, P.acc, 0, 0.9, -0.3, c);

        lamp(-3, -2.9, P);
        plant(4.2, -3.2, 1.3);
        plant(-4.2, 1.6, 0.8);
        side(-3.4, 0.5, P, 0.9);
        B(2.6, 0.9, 0.8, P.wood, -3.9, 0.65, -0.2, fur).rotation.y = 0;
        art(-0.5, 2.7, 1.6, 1.1, P);
        art(-2.3, 2.7, 0.8, 1.1, P, 0xe9b98d);
        art(1.3, 2.6, 0.8, 0.8, P, 0xffffff);
        pend(0, 3.1, 0.4, P);
      },

      dining(P) {
        rug(0, 0, 6.5, 4.6, 0xd6cfc0);
        B(3.8, 0.15, 1.8, P.wood, 0, 1.45, 0);
        [-1.6, 1.6].forEach((x) =>
          [-0.7, 0.7].forEach((z) => B(0.15, 1.4, 0.15, P.wood, x, 0.7, z))
        );
        [-1.1, 0, 1.1].forEach((x) => {
          chair(x, -1.35, 0, P);
          chair(x, 1.35, Math.PI, P);
        });
        chair(-2.5, 0, Math.PI / 2, P);
        chair(2.5, 0, -Math.PI / 2, P);

        C(0.12, 0.1, 0.4, 0xffffff, 0, 1.7, 0);
        B(0.4, 0.05, 0.4, P.acc, 0.8, 1.55, 0.2, fur, M(P.acc, 0.3, 0.8));

        side(-2.8, -3.5, P, 3.6);
        B(3.6, 0.9, 0.9, P.wood, 2.4, 0.65, -3.5);
        plant(4.3, -3, 1.3);
        art(-2.8, 2.5, 1.6, 1.1, P);
        art(0, 2.7, 2, 1.3, P);
        art(2.6, 2.5, 1.1, 1.1, P, 0xe9b98d);

        pend(-0.9, 2.6, 0, P);
        pend(0, 2.4, 0, P);
        pend(0.9, 2.6, 0, P);
      },

      kitchen(P) {
        B(9.4, 1.2, 1.2, 0xf3efe6, 0, 0.6, -3.4);
        B(9.5, 0.12, 1.3, 0x2b2f33, 0, 1.26, -3.4, fur, M(0x2b2f33, 0.2, 0.3));
        B(9.4, 1.6, 0.05, 0xd8d4cb, 0, 2.1, -3.95);

        [-3.2, -0.2, 2.8].forEach((x) => B(2.9, 1.3, 0.9, P.main, x, 3, -3.5));
        B(1.6, 0.5, 0.9, 0x9aa0a5, -0.2 + 0.1, 2.2, -3.5, fur, M(0xb8bdc2, 0.2, 0.8));
        B(1.5, 3.4, 1.3, 0xc9cdd1, 3.9, 1.7, -3.3, fur, M(0xc9cdd1, 0.25, 0.7));

        B(3.8, 1.15, 1.5, P.main, 0, 0.58, 0.3);
        B(4, 0.12, 1.7, 0xf3efe6, 0, 1.2, 0.3, fur, M(0xf3efe6, 0.2));
        [-1.3, 0, 1.3].forEach((x) => stool(x, 1.5, P));

        C(0.28, 0.28, 0.3, 0xdedede, -1.2, 1.4, 0.1);
        C(0.15, 0.15, 0.5, 0xffffff, 1.2, 1.5, 0.4);
        plant(-4.3, -3, 0.9);
        pend(-1, 2.5, 0.3, P);
        pend(0, 2.5, 0.3, P);
        pend(1, 2.5, 0.3, P);
        rug(0, 2.2, 3.5, 1.4, 0xbfc8b0);
      },

      bed(P) {
        rug(0, 0.5, 5.5, 4.2, 0xd9d3c3);
        B(3.3, 0.5, 4.3, P.wood, 0, 0.45, -1.6);
        B(3.1, 0.45, 4.1, 0xf7f3ea, 0, 0.9, -1.6, fur, M(0xf7f3ea, 1));
        B(3.15, 0.2, 2.6, P.main, 0, 1.15, -0.9, fur, M(P.main, 1));

        B(3.6, 2, 0.3, P.main, 0, 1.4, -3.8);
        [-0.8, 0.8].forEach((x) =>
          B(1.1, 0.3, 0.6, 0xffffff, x, 1.25, -3.1, fur, M(0xffffff, 1))
        );
        B(0.9, 0.3, 0.5, P.acc, 0, 1.4, -2.2, fur).rotation.y = 0.2;

        [-2.4, 2.4].forEach((x) => {
          B(1, 0.9, 0.8, P.wood, x, 0.5, -3.4);
          lamp2(x, -3.4);
        });

        B(3.2, 0.5, 0.7, P.main, 0, 0.45, 1.1);
        B(2.4, 3.1, 0.9, 0xf3efe6, -3.2, 1.55, -2.5).rotation.y = 0;
        plant(4.2, -3, 1.2);
        art(0, 3, 2.2, 1.2, P, P.acc);
        art(-3.6, 2.6, 0.9, 1.2, P, 0xe9b98d);
        art(3.6, 2.6, 0.9, 1.2, P, 0xffffff);
        rug(0, -0.6, 4, 2, 0xd0c8b7);
      },
    };

    const wallM = M(0xe9e7e0, 0.95);

    function buildShell(curRoom: RoomKey) {
      shell.clear();
      const f = new THREE.Mesh(
        new THREE.PlaneGeometry(11, 9),
        M(curRoom === "kitchen" ? 0xd9d2c4 : 0xb9793f, 0.55)
      );
      f.rotation.x = -Math.PI / 2;
      f.receiveShadow = true;
      shell.add(f);

      if (curRoom !== "kitchen") {
        for (let i = -4; i < 5; i++) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(11, 0.005, 0.02), M(0x8a5a2b));
          s.position.set(0, 0.003, i);
          shell.add(s);
        }
      }

      const bw = new THREE.Mesh(new THREE.PlaneGeometry(11, 4), wallM);
      bw.position.set(0, 2, -4);
      bw.receiveShadow = true;
      shell.add(bw);

      const lw = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), wallM);
      lw.rotation.y = Math.PI / 2;
      lw.position.set(-5.5, 2, 0);
      lw.receiveShadow = true;
      shell.add(lw);

      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2.8),
        new THREE.MeshBasicMaterial({ color: 0xfffbf0 })
      );
      win.rotation.y = Math.PI / 2;
      win.position.set(-5.45, 2.3, curRoom === "kitchen" ? 0.8 : 0);
      shell.add(win);

      const bb = new THREE.Mesh(new THREE.BoxGeometry(11, 0.14, 0.05), M(0xd8d5cb));
      bb.position.set(0, 0.07, -3.97);
      shell.add(bb);

      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xfff2c0 })
      );
      b.position.set(0, 3.2, 0.4);
      shell.add(b);
    }

    function build() {
      fur.clear();
      const currentRoomKey = stateRef.current.room;
      const currentPal = PAL[stateRef.current.palKey];
      ROOMS[currentRoomKey](currentPal);
      buildShell(currentRoomKey);
    }

    rebuildRef.current = build;
    build();

    function size() {
      if (!st) return;
      const w = st.clientWidth;
      const h = st.clientHeight;
      R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.fov = w / h < 1 ? 70 : 46;
      cam.updateProjectionMatrix();
    }

    window.addEventListener("resize", size);
    size();

    let isVisible = true;
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
    });
    io.observe(st);

    let reqId: number;

    function draw(now: number) {
      if (isVisible && st) {
        const w = st.clientWidth;
        const h = st.clientHeight;

        // Auto sweep animation on initial load
        if (stateRef.current.autoSweep) {
          const k = (now - stateRef.current.t0) / 2400;
          if (k < 1) {
            setSplit(0.5 + Math.sin(k * Math.PI * 2) * 0.35 * (1 - k));
          } else {
            setSplit(0.5);
            stateRef.current.autoSweep = false;
          }
        }

        // Camera mouse parallax
        stateRef.current.mx += (stateRef.current.tx - stateRef.current.mx) * 0.05;
        cam.position.set(6.5 + stateRef.current.mx * 1.5, 3.4, 8.8);
        cam.lookAt(-0.3, 1.3, -0.8);

        const split = stateRef.current.split;
        const sx = Math.round(split * w);

        R.setViewport(0, 0, w, h);

        // Before view (bare shell)
        R.setScissor(0, 0, sx, h);
        fur.visible = false;
        sun.intensity = 0.8;
        R.render(sc, cam);

        // After view (makeover furnishings)
        R.setScissor(sx, 0, w - sx, h);
        fur.visible = true;
        sun.intensity = 0.9;
        R.render(sc, cam);
      }

      reqId = requestAnimationFrame(draw);
    }

    reqId = requestAnimationFrame(draw);

    setSplit(0.5);

    const mv = (e: PointerEvent | MouseEvent) => {
      if (!st) return;
      const r = st.getBoundingClientRect();
      stateRef.current.tx = (e.clientX - r.left) / r.width - 0.5;
      if (stateRef.current.dragging) {
        setSplit((e.clientX - r.left) / r.width);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.autoSweep = false;
      mv(e);
    };

    const onPointerUp = () => {
      stateRef.current.dragging = false;
    };

    st.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(reqId);
      io.disconnect();
      window.removeEventListener("resize", size);
      st.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", onPointerUp);
      R.dispose();
      if (R.domElement.parentNode === st) {
        st.removeChild(R.domElement);
      }
    };
  }, [setSplit]);

  return (
    <div className="w">
      <div className="tag">Dream Home Visuals</div>
      <h1>
        Your home, <span>before &amp; after</span>.
      </h1>

      {/* Room Category Tabs */}
      <div className="row" id="rooms">
        {(Object.keys(ROOMS_META) as RoomKey[]).map((r) => (
          <button
            key={r}
            className={`chip ${activeRoom === r ? "on" : ""}`}
            data-r={r}
            onClick={() => setActiveRoom(r)}
          >
            {ROOMS_META[r]}
          </button>
        ))}
      </div>

      {/* Stage Container */}
      <div id="st" ref={stRef}>
        <span className="lab" style={{ left: 12 }}>
          Before: Bare Space
        </span>
        <span className="lab" style={{ right: 12, color: "#e7c46a" }} id="al">
          After: Dream Makeover
        </span>
        <div id="hd" ref={hdRef}>
          <i>⇄</i>
        </div>
        <div className="hint">Drag to compare</div>
      </div>

      {/* Colour Theme Swatches */}
      <div className="row" id="pal" style={{ alignItems: "center" }}>
        <span style={{ font: "14px system-ui", color: "var(--mut)" }}>Colour theme:</span>
        {(Object.keys(PAL) as PaletteKey[]).map((k) => (
          <button
            key={k}
            className={`sw ${activePal === k ? "on" : ""}`}
            title={PAL[k].n}
            style={{ background: "#" + PAL[k].main.toString(16).padStart(6, "0") }}
            onClick={() => setActivePal(k)}
          />
        ))}
      </div>

      {/* Call To Action Box */}
      <div className="cta">
        <div>
          <b>Love it? Let's design yours.</b>
          <small>Free 3D concept for your room in 48 hours.</small>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <a
            className="btn"
            href="https://www.instagram.com/dream_homevisuals"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Free Design →
          </a>
          <a
            className="btn"
            href="https://wa.me/916378095273?text=Hi%20Dream%20Home%20Visuals%2C%20I%20would%20love%20a%20free%203D%20room%20makeover%20concept!"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#25D366", color: "#fff" }}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
