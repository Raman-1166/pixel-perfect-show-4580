// The whole 3D world is built from simple primitives (no model downloads, well under 5 MB).
// To use real models: drop .glb files into /public/models and replace a furniture group
// below with <primitive object={useGLTF("/models/sofa.glb").scene} /> inside <Suspense>.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Outlines, RoundedBox } from "@react-three/drei";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { FURNITURE, GREY, ROOMS, STYLES, type RoomKey, type StyleKey } from "./data";

type Mode = "hero" | "studio" | "static";
type Ctx = {
  colors: typeof GREY;
  night: boolean;
  interactive: boolean;
  hovered: string | null;
  setHovered: (k: string | null) => void;
  onSelect?: (k: string) => void;
};
const SceneCtx = createContext<Ctx>(null!);
const ItemCtx = createContext<string | null>(null);

/** Material that smoothly lerps to its target colour every frame. */
function Mat({ color, roughness = 0.8, metalness = 0, emissive }: { color: string; roughness?: number; metalness?: number; emissive?: string }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, d) => ref.current?.color.lerp(target, 1 - Math.exp(-4 * d)));
  return <meshStandardMaterial ref={ref} color={color} roughness={roughness} metalness={metalness} emissive={emissive ?? "#000"} />;
}

/** A mesh that shows a soft outline when its parent furniture item is hovered. */
function Part({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  const item = useContext(ItemCtx);
  const { hovered } = useContext(SceneCtx);
  return (
    <mesh castShadow receiveShadow {...props}>
      {children}
      {item && hovered === item && <Outlines thickness={3} color="#B08D57" screenspace />}
    </mesh>
  );
}

function Item({ id, children, ...props }: { id: string; children: ReactNode } & Record<string, unknown>) {
  const { interactive, setHovered, onSelect } = useContext(SceneCtx);
  return (
    <ItemCtx.Provider value={id}>
      <group
        {...props}
        onPointerOver={interactive ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); setHovered(id); document.body.style.cursor = "pointer"; } : undefined}
        onPointerOut={interactive ? () => { setHovered(null); document.body.style.cursor = ""; } : undefined}
        onClick={interactive ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect?.(id); } : undefined}
      >
        {children}
      </group>
    </ItemCtx.Provider>
  );
}

function Shell({ x }: { x: number }) {
  const { colors, night } = useContext(SceneCtx);
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <Mat color={colors.floor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2, -5]} receiveShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <Mat color={colors.wall} />
      </mesh>
      <mesh position={[-5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <Mat color={colors.wall} />
      </mesh>
      {/* window */}
      <mesh position={[-4.94, 2.2, -1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial color={night ? "#1b2a3d" : "#fdf6e3"} toneMapped={false} />
      </mesh>
      <mesh position={[-4.93, 2.2, -1]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[0.06, 2, 0.06]} />
        <meshStandardMaterial color="#F6F7F4" />
      </mesh>
      {/* skirting */}
      <mesh position={[0, 0.06, -4.93]}>
        <boxGeometry args={[10, 0.12, 0.04]} />
        <meshStandardMaterial color="#F6F7F4" />
      </mesh>
    </group>
  );
}

function Living() {
  const { colors, night } = useContext(SceneCtx);
  return (
    <group>
      <Shell x={0} />
      <Item id="rug">
        <Part position={[0.3, 0.01, -1.2]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[4.4, 3]} />
          <Mat color={colors.rug} roughness={1} />
        </Part>
      </Item>
      <Item id="sofa" position={[0.3, 0, -3.6]}>
        <Part position={[0, 0.35, 0]}><RoundedBox args={[3.4, 0.5, 1.1]} radius={0.12}><Mat color={colors.sofa} roughness={0.95} /></RoundedBox></Part>
        <Part position={[0, 0.9, -0.42]}><RoundedBox args={[3.4, 0.8, 0.28]} radius={0.12}><Mat color={colors.sofa} roughness={0.95} /></RoundedBox></Part>
        <Part position={[-1.62, 0.6, 0]}><RoundedBox args={[0.26, 0.6, 1.1]} radius={0.1}><Mat color={colors.sofa} roughness={0.95} /></RoundedBox></Part>
        <Part position={[1.62, 0.6, 0]}><RoundedBox args={[0.26, 0.6, 1.1]} radius={0.1}><Mat color={colors.sofa} roughness={0.95} /></RoundedBox></Part>
        <Part position={[-0.8, 0.78, -0.15]} rotation-z={0.15}><RoundedBox args={[0.5, 0.45, 0.16]} radius={0.07}><Mat color={colors.accent} /></RoundedBox></Part>
      </Item>
      <Item id="table" position={[0.3, 0, -1.2]}>
        <Part position={[0, 0.4, 0]}><cylinderGeometry args={[0.7, 0.7, 0.07, 48]} /><Mat color="#8A6A48" roughness={0.5} /></Part>
        <Part position={[0, 0.2, 0]}><cylinderGeometry args={[0.18, 0.25, 0.4, 24]} /><Mat color="#6E5238" /></Part>
        <Part position={[0.2, 0.52, 0.1]}><cylinderGeometry args={[0.08, 0.06, 0.18, 16]} /><Mat color={colors.accent} metalness={0.6} roughness={0.3} /></Part>
      </Item>
      <Item id="lamp" position={[-2.3, 0, -3.8]}>
        <Part position={[0, 0.02, 0]}><cylinderGeometry args={[0.25, 0.25, 0.04, 24]} /><Mat color="#B08D57" metalness={0.8} roughness={0.3} /></Part>
        <Part position={[0, 0.9, 0]}><cylinderGeometry args={[0.025, 0.025, 1.8, 8]} /><Mat color="#B08D57" metalness={0.8} roughness={0.3} /></Part>
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.22, 0.34, 0.4, 32, 1, true]} />
          <meshStandardMaterial color="#F6F0E0" side={THREE.DoubleSide} emissive="#FFC877" emissiveIntensity={night ? 1.4 : 0.05} />
        </mesh>
      </Item>
      <Item id="plant" position={[2.8, 0, -3.9]}>
        <Part position={[0, 0.3, 0]}><cylinderGeometry args={[0.3, 0.22, 0.6, 24]} /><Mat color="#B86B4B" /></Part>
        <Part position={[0, 1.3, 0]}><icosahedronGeometry args={[0.6, 0]} /><Mat color="#3E6B4E" /></Part>
        <Part position={[0.2, 1.8, 0.1]}><icosahedronGeometry args={[0.4, 0]} /><Mat color="#4F7D5A" /></Part>
      </Item>
      {/* wall art */}
      <mesh position={[0.3, 2.5, -4.93]}><boxGeometry args={[1.6, 1, 0.04]} /><Mat color={colors.accent} /></mesh>
      <mesh position={[0.3, 2.5, -4.9]}><planeGeometry args={[1.4, 0.8]} /><Mat color={colors.rug} /></mesh>
    </group>
  );
}

function Bedroom() {
  const { colors, night } = useContext(SceneCtx);
  const x = ROOMS.bedroom.x;
  return (
    <group>
      <Shell x={x} />
      <Item id="rug"><Part position={[x + 0.5, 0.01, -2]} rotation-x={-Math.PI / 2}><planeGeometry args={[4, 3.4]} /><Mat color={colors.rug} roughness={1} /></Part></Item>
      <Item id="bed" position={[x + 0.5, 0, -3]}>
        <Part position={[0, 0.3, 0]}><RoundedBox args={[2.4, 0.4, 2.6]} radius={0.08}><Mat color={colors.sofa} /></RoundedBox></Part>
        <Part position={[0, 0.58, 0.1]}><RoundedBox args={[2.3, 0.2, 2.3]} radius={0.08}><Mat color="#F6F7F4" roughness={1} /></RoundedBox></Part>
        <Part position={[0, 0.66, 0.6]}><RoundedBox args={[2.34, 0.08, 1.3]} radius={0.03}><Mat color={colors.rug} roughness={1} /></RoundedBox></Part>
        <Part position={[0, 1.1, -1.3]}><RoundedBox args={[2.5, 1.4, 0.18]} radius={0.08}><Mat color={colors.sofa} roughness={1} /></RoundedBox></Part>
        <Part position={[-0.55, 0.8, -0.8]}><RoundedBox args={[0.8, 0.2, 0.45]} radius={0.08}><Mat color="#F6F7F4" /></RoundedBox></Part>
        <Part position={[0.55, 0.8, -0.8]}><RoundedBox args={[0.8, 0.2, 0.45]} radius={0.08}><Mat color="#F6F7F4" /></RoundedBox></Part>
      </Item>
      {[-1.8, 1.8].map((dx) => (
        <Item key={dx} id="nightstand" position={[x + 0.5 + dx, 0, -3.9]}>
          <Part position={[0, 0.3, 0]}><boxGeometry args={[0.6, 0.6, 0.5]} /><Mat color="#5E4330" roughness={0.5} /></Part>
          <mesh position={[0, 0.8, 0]}><sphereGeometry args={[0.16, 24, 16]} /><meshStandardMaterial color="#F6F0E0" emissive="#FFC877" emissiveIntensity={night ? 1.5 : 0.05} /></mesh>
        </Item>
      ))}
      <Item id="plant" position={[x + 3.6, 0, -1]}>
        <Part position={[0, 0.25, 0]}><cylinderGeometry args={[0.25, 0.2, 0.5, 24]} /><Mat color="#D9CFC0" /></Part>
        <Part position={[0, 1, 0]}><icosahedronGeometry args={[0.5, 0]} /><Mat color="#3E6B4E" /></Part>
      </Item>
    </group>
  );
}

function Kitchen() {
  const { colors, night } = useContext(SceneCtx);
  const x = ROOMS.kitchen.x;
  return (
    <group>
      <Shell x={x} />
      {/* back cabinets */}
      <mesh position={[x + 0.5, 0.45, -4.6]} castShadow receiveShadow><boxGeometry args={[7, 0.9, 0.7]} /><Mat color={colors.sofa} /></mesh>
      <mesh position={[x + 0.5, 0.93, -4.6]}><boxGeometry args={[7.05, 0.06, 0.75]} /><Mat color="#EDEBE6" roughness={0.3} /></mesh>
      <mesh position={[x + 0.5, 2.8, -4.75]}><boxGeometry args={[7, 0.8, 0.4]} /><Mat color={colors.sofa} /></mesh>
      <Item id="island" position={[x + 0.5, 0, -1.8]}>
        <Part position={[0, 0.45, 0]}><boxGeometry args={[3, 0.9, 1.1]} /><Mat color={colors.sofa} /></Part>
        <Part position={[0, 0.94, 0]}><boxGeometry args={[3.2, 0.08, 1.3]} /><Mat color="#F1EFEA" roughness={0.25} /></Part>
      </Item>
      {[-0.9, 0, 0.9].map((dx) => (
        <Item key={dx} id="stool" position={[x + 0.5 + dx, 0, -0.7]}>
          <Part position={[0, 0.65, 0]}><cylinderGeometry args={[0.22, 0.22, 0.08, 24]} /><Mat color="#6B4226" /></Part>
          <Part position={[0, 0.32, 0]}><cylinderGeometry args={[0.03, 0.12, 0.62, 12]} /><Mat color={colors.accent} metalness={0.7} roughness={0.3} /></Part>
        </Item>
      ))}
      {[-0.8, 0.8].map((dx) => (
        <Item key={dx} id="pendant" position={[x + 0.5 + dx, 0, -1.8]}>
          <mesh position={[0, 3.3, 0]}><cylinderGeometry args={[0.01, 0.01, 1.4, 6]} /><meshStandardMaterial color="#222" /></mesh>
          <Part position={[0, 2.5, 0]}><sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat color="#B08D57" metalness={0.8} roughness={0.25} /></Part>
          <mesh position={[0, 2.46, 0]}><sphereGeometry args={[0.1, 16, 8]} /><meshStandardMaterial color="#fff" emissive="#FFC877" emissiveIntensity={night ? 2 : 0.1} /></mesh>
        </Item>
      ))}
      <mesh position={[x + 0.5, 0.01, -1.8]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[4.4, 2.6]} /><Mat color={colors.rug} roughness={1} /></mesh>
    </group>
  );
}

function Lights() {
  const { night } = useContext(SceneCtx);
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.HemisphereLight>(null);
  const lamps = useRef<THREE.Group>(null);
  const { scene } = useThree();
  useFrame((_, d) => {
    const k = 1 - Math.exp(-3 * d);
    if (sun.current) sun.current.intensity += ((night ? 0.08 : 2.4) - sun.current.intensity) * k;
    if (amb.current) amb.current.intensity += ((night ? 0.25 : 0.9) - amb.current.intensity) * k;
    lamps.current?.children.forEach((l) => {
      const pl = l as THREE.PointLight;
      pl.intensity += ((night ? 6 : 0) - pl.intensity) * k;
    });
    const bg = scene.background as THREE.Color | null;
    bg?.lerp(new THREE.Color(night ? "#16201D" : "#F6F7F4"), k);
  });
  return (
    <>
      <color attach="background" args={["#F6F7F4"]} />
      <hemisphereLight ref={amb} args={["#fff8ec", "#a9b8a5", 0.9]} />
      <directionalLight ref={sun} position={[-8, 7, 3]} intensity={2.4} color="#fff1d8" castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20} shadow-camera-right={40} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0005} />
      <group ref={lamps}>
        <pointLight position={[-2.3, 1.9, -3.6]} color="#FFB866" distance={9} decay={1.5} intensity={0} />
        <pointLight position={[ROOMS.bedroom.x + 0.5, 1.2, -3.6]} color="#FFB866" distance={8} decay={1.5} intensity={0} />
        <pointLight position={[ROOMS.kitchen.x + 0.5, 2.3, -1.8]} color="#FFC877" distance={8} decay={1.5} intensity={0} />
      </group>
    </>
  );
}

const CAM = { pos: new THREE.Vector3(3.2, 3.2, 5.2), look: new THREE.Vector3(-0.3, 1, -2.2) };

function Rig({ room, mode, reduced }: { room: RoomKey; mode: Mode; reduced: boolean }) {
  const { camera, pointer } = useThree();
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const moving = useRef(true);
  const look = useRef(CAM.look.clone());
  useEffect(() => { moving.current = true; }, [room]);
  useFrame((state, d) => {
    const ox = ROOMS[room].x;
    const goalPos = CAM.pos.clone().add(new THREE.Vector3(ox, 0, 0));
    const goalLook = CAM.look.clone().add(new THREE.Vector3(ox, 0, 0));
    const k = 1 - Math.exp(-2.5 * d);
    if (mode === "hero" && !reduced) {
      const t = state.clock.elapsedTime;
      goalPos.x += Math.sin(t * 0.15) * 0.5 + pointer.x * 0.6;
      goalPos.y += Math.cos(t * 0.1) * 0.15 + pointer.y * 0.35;
    }
    if (mode === "studio") {
      if (!moving.current || !controls.current) return;
      camera.position.lerp(goalPos, k);
      controls.current.target.lerp(goalLook, k);
      controls.current.update();
      if (camera.position.distanceTo(goalPos) < 0.05) moving.current = false;
      return;
    }
    camera.position.lerp(goalPos, mode === "static" ? 1 : k);
    look.current.lerp(goalLook, mode === "static" ? 1 : k);
    camera.lookAt(look.current);
  });
  if (mode !== "studio") return null;
  return (
    <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={3.5} maxDistance={9}
      minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.2} minAzimuthAngle={-0.2} maxAzimuthAngle={1.1}
      onStart={() => { moving.current = false; }} />
  );
}

export type RoomCanvasProps = {
  style?: StyleKey;
  night?: boolean;
  grey?: boolean;
  room?: RoomKey;
  mode?: Mode;
  onSelect?: (k: string) => void;
  onMissed?: () => void;
};

export default function RoomCanvas({ style = "modern", night = false, grey = false, room = "living", mode = "hero", onSelect, onMissed }: RoomCanvasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [lowPower, setLowPower] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setLowPower(window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const colors = grey ? GREY : STYLES[style];
  const ctx: Ctx = { colors, night, interactive: mode === "studio", hovered, setHovered, onSelect };
  return (
    <Canvas shadows={!lowPower} dpr={lowPower ? 1 : [1, 1.75]} camera={{ position: CAM.pos.toArray(), fov: 45 }} onPointerMissed={onMissed}
      gl={{ antialias: true }} aria-label="Interactive 3D room">
      <SceneCtx.Provider value={ctx}>
        <Lights />
        <Living />
        <Bedroom />
        <Kitchen />
        {!lowPower && <ContactShadows position={[16, 0.005, -2]} scale={50} opacity={0.3} blur={2.5} far={3} frames={1} />}
        <Rig room={room} mode={mode} reduced={reduced} />
      </SceneCtx.Provider>
    </Canvas>
  );
}

export { FURNITURE };
