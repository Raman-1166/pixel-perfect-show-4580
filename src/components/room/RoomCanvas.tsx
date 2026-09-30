// 3D procedural rooms for Ganesh Dream House.
// Built with rounded primitives, procedural canvas textures, and HDR lighting.
// MODEL SWAP: To use real .glb models, drop files into /public/models/ and replace
// any Item group with: <primitive object={useGLTF("/models/your-model.glb").scene} />
// COLOR CUSTOMIZATION: Change hex color values in STYLES or inline materials below.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, Outlines, RoundedBox } from "@react-three/drei";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { FURNITURE, GREY, ROOMS, STYLES, type RoomKey, type StyleKey } from "./data";
import {
  getArtTexture,
  getBeforeFloorTexture,
  getClockTexture,
  getPlasterTexture,
  getRugTexture,
  getWoodFloorTexture,
} from "./textures";

type Mode = "hero" | "studio" | "static";
type Ctx = {
  colors: typeof GREY;
  night: boolean;
  grey: boolean;
  interactive: boolean;
  hovered: string | null;
  setHovered: (k: string | null) => void;
  onSelect?: ((k: string) => void) | undefined;
};
const SceneCtx = createContext<Ctx>(null!);
const ItemCtx = createContext<string | null>(null);

/** Material that smoothly lerps to its target colour every frame and supports procedural maps. */
function Mat({
  color,
  roughness = 0.8,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
  map,
  transparent = false,
  opacity = 1,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  map?: THREE.Texture | null;
  transparent?: boolean;
  opacity?: number;
}) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, d) => {
    if (ref.current) {
      ref.current.color.lerp(target, 1 - Math.exp(-4 * d));
    }
  });
  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive ?? "#000"}
      emissiveIntensity={emissiveIntensity}
      map={map ?? null}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

/** A mesh that shows a soft gold outline when its parent furniture item is hovered in studio mode. */
function Part({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  const item = useContext(ItemCtx);
  const { hovered } = useContext(SceneCtx);
  return (
    <mesh castShadow receiveShadow {...props}>
      {children}
      {item && hovered === item && <Outlines thickness={3} color="#C59B27" screenspace />}
    </mesh>
  );
}

function Item({ id, children, ...props }: { id: string; children: ReactNode } & Record<string, unknown>) {
  const { interactive, setHovered, onSelect } = useContext(SceneCtx);
  const interactionProps = interactive
    ? {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHovered(id);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          setHovered(null);
          document.body.style.cursor = "";
        },
        onClick: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          onSelect?.(id);
        },
      }
    : {};

  return (
    <ItemCtx.Provider value={id}>
      <group {...props} {...interactionProps}>
        {children}
      </group>
    </ItemCtx.Provider>
  );
}

/** Architectural room envelope: floor, walls, window, curtains, and sunlight beam. */
function Shell({ x, grey }: { x: number; grey?: boolean }) {
  const { colors, night } = useContext(SceneCtx);
  const isGrey = Boolean(grey);
  const woodTex = useMemo(() => (!isGrey ? getWoodFloorTexture() : null), [isGrey]);
  const plasterTex = useMemo(() => (!isGrey ? getPlasterTexture() : null), [isGrey]);
  const beforeFloorTex = useMemo(() => (isGrey ? getBeforeFloorTexture() : null), [isGrey]);

  return (
    <group position={[x, 0, 0]}>
      {/* Floor with wood planks or dull concrete */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        {isGrey ? (
          <meshStandardMaterial color="#787C80" roughness={0.95} metalness={0} map={beforeFloorTex ?? null} />
        ) : (
          <Mat color={colors.floor} roughness={0.35} metalness={0.06} map={woodTex} />
        )}
      </mesh>

      {/* Back Wall with soft plaster */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <boxGeometry args={[10, 4, 0.1]} />
        <Mat color={grey ? "#888C90" : colors.wall} roughness={0.9} map={plasterTex} />
      </mesh>

      {/* Left Wall with Window Cutout */}
      <mesh position={[-5, 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, 4, 10]} />
        <Mat color={grey ? "#888C90" : colors.wall} roughness={0.9} map={plasterTex} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={grey ? "#7A7E82" : "#F6F4EE"} roughness={0.9} />
      </mesh>

      {/* Window Outdoor View & Frame */}
      {/* Window opening at x = -4.95, z = -1, y = 2.2 */}
      <mesh position={[-4.94, 2.2, -1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[3, 2.2]} />
        <meshBasicMaterial
          color={
            night
              ? "#162230"
              : grey
                ? "#BAC4CC"
                : "#FFF8EA"
          }
          toneMapped={false}
        />
      </mesh>

      {/* Outdoor greenery gradient visible through glass */}
      {!grey && !night && (
        <mesh position={[-5.3, 1.8, -1]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[5, 3]} />
          <meshBasicMaterial color="#5E7D63" />
        </mesh>
      )}

      {/* Glass Pane */}
      <mesh position={[-4.93, 2.2, -1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[2.9, 2.1]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.2} roughness={0.05} metalness={0.3} />
      </mesh>

      {/* Architectural Window Mullions / Frame */}
      <group position={[-4.91, 2.2, -1]} rotation-y={Math.PI / 2}>
        {/* Outer Frame */}
        <mesh position={[0, 1.05, 0]}><boxGeometry args={[3, 0.08, 0.08]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
        <mesh position={[0, -1.05, 0]}><boxGeometry args={[3.1, 0.1, 0.14]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
        <mesh position={[-1.45, 0, 0]}><boxGeometry args={[0.08, 2.1, 0.08]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
        <mesh position={[1.45, 0, 0]}><boxGeometry args={[0.08, 2.1, 0.08]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
        {/* Center cross mullions */}
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.05, 2.1, 0.06]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
        <mesh position={[0, 0.35, 0]}><boxGeometry args={[2.9, 0.05, 0.06]} /><meshStandardMaterial color={grey ? "#6C7074" : "#F7F5EE"} roughness={0.5} /></mesh>
      </group>

      {/* Elegant Draped Curtains (After version only) */}
      {!grey && (
        <group position={[-4.82, 0, 0]}>
          {/* Brass Curtain Rod */}
          <mesh position={[0, 3.42, -1]}>
            <cylinderGeometry args={[0.02, 0.02, 3.8, 16]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Left Pleated Drapery */}
          <group position={[0, 1.8, -2.6]}>
            <RoundedBox args={[0.18, 3.2, 0.6]} radius={0.06}>
              <meshStandardMaterial color="#EFEBE2" roughness={0.9} />
            </RoundedBox>
          </group>
          {/* Right Pleated Drapery */}
          <group position={[0, 1.8, 0.6]}>
            <RoundedBox args={[0.18, 3.2, 0.6]} radius={0.06}>
              <meshStandardMaterial color="#EFEBE2" roughness={0.9} />
            </RoundedBox>
          </group>
        </group>
      )}

      {/* Volumetric Sunlight Rays from Window (After version only) */}
      {!grey && !night && (
        <mesh position={[-2.8, 1.7, -1]} rotation={[0.2, 0.7, -0.45]}>
          <planeGeometry args={[3.2, 4]} />
          <meshBasicMaterial
            color="#FFF0D4"
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Classic Molded Skirting Board (After version only) */}
      {!grey && (
        <group>
          {/* Back wall skirting */}
          <mesh position={[0, 0.08, -4.93]}>
            <boxGeometry args={[10, 0.16, 0.04]} />
            <meshStandardMaterial color="#F7F5F0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.165, -4.92]}>
            <boxGeometry args={[10, 0.02, 0.05]} />
            <meshStandardMaterial color="#F7F5F0" roughness={0.5} />
          </mesh>
          {/* Left wall skirting */}
          <mesh position={[-4.93, 0.08, 0]}>
            <boxGeometry args={[0.04, 0.16, 10]} />
            <meshStandardMaterial color="#F7F5F0" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Smooth broad-leaf potted plant generator with curved organic leaves */
function RoundedPlant({ potColor, scale = 1 }: { potColor: string; scale?: number }) {
  return (
    <group scale={scale}>
      {/* Fluted Ceramic Planter */}
      <Part position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.34, 0.26, 0.7, 32]} />
        <meshStandardMaterial color={potColor} roughness={0.6} />
      </Part>
      {/* Dark Soil */}
      <mesh position={[0, 0.69, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.31, 24]} />
        <meshStandardMaterial color="#2B1F17" roughness={0.9} />
      </mesh>
      {/* Central Stems */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.9, 12]} />
        <meshStandardMaterial color="#3C4A3A" roughness={0.7} />
      </mesh>
      {/* Broad smooth rounded leaves (Ficus Lyrata style) */}
      {[
        { pos: [0.18, 0.95, 0.12] as const, rot: [0.3, 0.4, -0.4] as const, s: [0.32, 0.52, 0.05] as const },
        { pos: [-0.18, 1.1, -0.1] as const, rot: [-0.25, -0.6, 0.35] as const, s: [0.34, 0.54, 0.05] as const },
        { pos: [0.05, 1.25, -0.22] as const, rot: [-0.4, 0.1, -0.2] as const, s: [0.3, 0.48, 0.05] as const },
        { pos: [-0.15, 1.42, 0.15] as const, rot: [0.4, -0.5, 0.3] as const, s: [0.32, 0.5, 0.05] as const },
        { pos: [0.16, 1.55, -0.05] as const, rot: [-0.2, 0.8, -0.3] as const, s: [0.28, 0.46, 0.05] as const },
        { pos: [0, 1.7, 0] as const, rot: [0.1, 0, 0] as const, s: [0.25, 0.4, 0.05] as const },
      ].map((leaf, idx) => (
        <group key={idx} position={leaf.pos} rotation={leaf.rot}>
          <mesh scale={leaf.s}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#2E573F" : "#38654A"} roughness={0.35} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Living Room: Full Luxury Makeover (After) or Bare Cold Room (Before) */
function Living() {
  const { colors, grey, night } = useContext(SceneCtx);
  const rugTex = useMemo(() => (!grey ? getRugTexture() : null), [grey]);
  const art1Tex = useMemo(() => (!grey ? getArtTexture(1) : null), [grey]);
  const art2Tex = useMemo(() => (!grey ? getArtTexture(2) : null), [grey]);
  const art3Tex = useMemo(() => (!grey ? getArtTexture(3) : null), [grey]);
  const clockTex = useMemo(() => (!grey ? getClockTexture() : null), [grey]);

  // BEFORE VERSION: Bare, cold, neglected room with minimal worn elements
  if (grey) {
    return (
      <group>
        <Shell x={0} grey={true} />
        {/* Old worn boxy grey sofa frame without cushions */}
        <Item id="sofa" position={[0.3, 0, -3.6]}>
          <Part position={[0, 0.3, 0]}>
            <boxGeometry args={[3.2, 0.42, 1.0]} />
            <Mat color="#6E7275" roughness={0.95} />
          </Part>
          <Part position={[0, 0.78, -0.4]}>
            <boxGeometry args={[3.2, 0.65, 0.22]} />
            <Mat color="#6E7275" roughness={0.95} />
          </Part>
          <Part position={[-1.52, 0.52, 0]}>
            <boxGeometry args={[0.2, 0.5, 1.0]} />
            <Mat color="#65696C" roughness={0.95} />
          </Part>
          <Part position={[1.52, 0.52, 0]}>
            <boxGeometry args={[0.2, 0.5, 1.0]} />
            <Mat color="#65696C" roughness={0.95} />
          </Part>
        </Item>

        {/* Rough wooden crate / makeshift cardboard box instead of coffee table */}
        <Item id="table" position={[0.3, 0, -1.4]}>
          <Part position={[0, 0.22, 0]}>
            <boxGeometry args={[0.7, 0.44, 0.55]} />
            <Mat color="#5C5852" roughness={0.95} />
          </Part>
        </Item>

        {/* Empty dusty ceramic pot without plant */}
        <Item id="plant" position={[2.7, 0, -3.8]}>
          <Part position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.22, 0.16, 0.45, 16]} />
            <Mat color="#5E6164" roughness={0.9} />
          </Part>
        </Item>

        {/* Bare dangling wire & exposed bulb socket from ceiling */}
        <group position={[0.2, 2.9, -2]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.2, 8]} />
            <meshBasicMaterial color="#2E3033" />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
            <meshStandardMaterial color="#4A4E52" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshStandardMaterial color="#94A0A8" emissive="#A8B4BC" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>
    );
  }

  // AFTER VERSION: Bespoke luxury living room with full furniture and editorial styling
  return (
    <group>
      <Shell x={0} grey={false} />

      {/* 1. TEXTURED GEOMETRIC WOVEN RUG */}
      <Item id="rug">
        <Part position={[0.25, 0.012, -1.6]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[4.6, 3.4]} />
          <Mat color={colors.rug} roughness={0.92} map={rugTex} />
        </Part>
      </Item>

      {/* 2. PLUSH L-SHAPED / 3-SEATER SOFA WITH CUSHIONS & THROW BLANKET */}
      <Item id="sofa" position={[0.2, 0, -3.5]}>
        {/* Tapered Brass Legs */}
        {([
          [-1.5, 0.06, 0.4],
          [1.5, 0.06, 0.4],
          [-1.5, 0.06, -0.4],
          [1.5, 0.06, -0.4],
          [-1.5, 0.06, 1.1],
          [-0.6, 0.06, 1.1],
        ] as const).map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]}>
            <cylinderGeometry args={[0.025, 0.015, 0.12, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}

        {/* Main Base Frame */}
        <Part position={[0, 0.22, 0]}>
          <RoundedBox args={[3.3, 0.2, 1.05]} radius={0.06}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* Chaise / L-section Base on Left */}
        <Part position={[-1.05, 0.22, 0.7]}>
          <RoundedBox args={[1.2, 0.2, 0.85]} radius={0.06}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* 3 Deep Seat Cushions */}
        {[-0.85, 0.2, 1.15].map((cx, i) => (
          <Part key={i} position={[cx, 0.42, 0.02]}>
            <RoundedBox args={[0.96, 0.24, 0.98]} radius={0.08}>
              <Mat color={colors.sofa} roughness={0.85} />
            </RoundedBox>
          </Part>
        ))}
        {/* Chaise Cushion */}
        <Part position={[-1.05, 0.42, 0.7]}>
          <RoundedBox args={[1.15, 0.24, 0.82]} radius={0.08}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* Backrest Frame & Cushions */}
        <Part position={[0, 0.82, -0.44]}>
          <RoundedBox args={[3.3, 0.72, 0.24]} radius={0.08}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>
        {[-0.85, 0.2, 1.15].map((cx, i) => (
          <Part key={`b-${i}`} position={[cx, 0.82, -0.3]}>
            <RoundedBox args={[0.94, 0.52, 0.18]} radius={0.07}>
              <Mat color={colors.sofa} roughness={0.85} />
            </RoundedBox>
          </Part>
        ))}

        {/* Left and Right Armrests */}
        <Part position={[-1.7, 0.55, 0.15]}>
          <RoundedBox args={[0.22, 0.54, 1.3]} radius={0.08}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>
        <Part position={[1.7, 0.55, 0]}>
          <RoundedBox args={[0.22, 0.54, 1.05]} radius={0.08}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* 3 Accent Throw Pillows */}
        <Part position={[-0.8, 0.65, -0.15]} rotation={[0.1, 0.2, 0.1]}>
          <RoundedBox args={[0.45, 0.42, 0.16]} radius={0.08}>
            <Mat color="#C88A36" roughness={0.8} />
          </RoundedBox>
        </Part>
        <Part position={[0.7, 0.65, -0.18]} rotation={[0.1, -0.2, -0.08]}>
          <RoundedBox args={[0.42, 0.4, 0.16]} radius={0.08}>
            <Mat color="#2D4C3E" roughness={0.8} />
          </RoundedBox>
        </Part>
        <Part position={[1.35, 0.62, -0.1]}>
          <RoundedBox args={[0.38, 0.38, 0.15]} radius={0.07}>
            <Mat color="#EFEBE2" roughness={0.9} />
          </RoundedBox>
        </Part>

        {/* Elegant Draped Throw Blanket */}
        <group position={[-1.58, 0.54, 0.4]}>
          <RoundedBox args={[0.28, 0.14, 0.62]} radius={0.04}>
            <meshStandardMaterial color="#E6DEC9" roughness={0.9} />
          </RoundedBox>
          <mesh position={[-0.1, -0.15, 0]}>
            <boxGeometry args={[0.06, 0.34, 0.58]} />
            <meshStandardMaterial color="#E6DEC9" roughness={0.9} />
          </mesh>
        </group>
      </Item>

      {/* 3. SCULPTURAL ACCENT ARMCHAIR */}
      <Item id="armchair" position={[2.15, 0, -1.5]} rotation-y={-0.68}>
        {/* Tapered Brass Legs */}
        {([
          [-0.35, 0.1, 0.3],
          [0.35, 0.1, 0.3],
          [-0.32, 0.1, -0.3],
          [0.32, 0.1, -0.3],
        ] as const).map(([ax, ay, az], i) => (
          <mesh key={i} position={[ax, ay, az]} rotation-z={ax > 0 ? -0.1 : 0.1}>
            <cylinderGeometry args={[0.02, 0.012, 0.22, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
        {/* Upholstered Seat Cushion */}
        <Part position={[0, 0.34, 0]}>
          <RoundedBox args={[0.82, 0.22, 0.8]} radius={0.09}>
            <meshStandardMaterial color="#F3EFE6" roughness={0.8} />
          </RoundedBox>
        </Part>
        {/* Curved Backrest */}
        <Part position={[0, 0.68, -0.3]}>
          <RoundedBox args={[0.82, 0.54, 0.18]} radius={0.09}>
            <meshStandardMaterial color="#F3EFE6" roughness={0.8} />
          </RoundedBox>
        </Part>
        {/* Lumbar Accent Cushion */}
        <Part position={[0, 0.52, -0.18]}>
          <RoundedBox args={[0.42, 0.24, 0.12]} radius={0.06}>
            <Mat color="#C88A36" roughness={0.8} />
          </RoundedBox>
        </Part>
      </Item>

      {/* 4. ROUND WOOD COFFEE TABLE WITH STYLING ACCENTS */}
      <Item id="table" position={[0.3, 0, -1.5]}>
        {/* 3-Leg Tripod Base */}
        {[-0.32, 0.32, 0].map((tx, idx) => (
          <mesh key={idx} position={[tx, 0.18, idx === 2 ? 0.32 : -0.2]}>
            <cylinderGeometry args={[0.035, 0.04, 0.36, 16]} />
            <meshStandardMaterial color="#785536" roughness={0.6} />
          </mesh>
        ))}
        {/* Round Beveled Tabletop with Real Oak Grain */}
        <Part position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 0.05, 48]} />
          <meshStandardMaterial color="#946B45" roughness={0.4} metalness={0.04} />
        </Part>

        {/* Stack of 2 Design Coffee Table Books */}
        <group position={[-0.18, 0.42, -0.08]} rotation-y={0.2}>
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.26, 0.03, 0.34]} />
            <meshStandardMaterial color="#C87D55" roughness={0.6} />
          </mesh>
          <mesh position={[0.02, 0.04, 0.02]} rotation-y={-0.12}>
            <boxGeometry args={[0.24, 0.025, 0.32]} />
            <meshStandardMaterial color="#2E4C41" roughness={0.6} />
          </mesh>
        </group>

        {/* Ceramic Vase with Delicate Stems */}
        <group position={[0.16, 0.41, -0.05]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.24, 24]} />
            <meshStandardMaterial color="#EDE9E1" roughness={0.35} />
          </mesh>
          {/* Flower Stems */}
          <mesh position={[0.02, 0.28, 0.01]} rotation-z={0.2}>
            <cylinderGeometry args={[0.005, 0.005, 0.18, 8]} />
            <meshStandardMaterial color="#3E543A" />
          </mesh>
          <mesh position={[-0.02, 0.26, -0.02]} rotation-z={-0.25}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
            <meshStandardMaterial color="#3E543A" />
          </mesh>
          {/* White flower bud */}
          <mesh position={[0.04, 0.37, 0.02]}>
            <sphereGeometry args={[0.025, 12, 8]} />
            <meshStandardMaterial color="#FFF8EE" />
          </mesh>
        </group>

        {/* Scented Candle in Ribbed Glass */}
        <group position={[0.02, 0.41, 0.22]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.09, 20]} />
            <meshStandardMaterial color="#FFFDF7" roughness={0.2} transparent opacity={0.8} />
          </mesh>
          {/* Candle Flame Point Light */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.012, 12, 8]} />
            <meshBasicMaterial color="#FFB84D" />
          </mesh>
          <pointLight position={[0, 0.14, 0]} color="#FF9922" distance={2} intensity={night ? 1.8 : 0.8} decay={2} />
        </group>
      </Item>

      {/* 5. STORAGE: TV UNIT / CONSOLE TABLE WITH DECOR TRAY */}
      <Item id="mediaConsole" position={[-3.8, 0, 0.4]} rotation-y={Math.PI / 2}>
        {/* Console Legs */}
        {[-0.9, 0.9].map((lx, i) => (
          <mesh key={i} position={[lx, 0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.015, 0.2, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
        {/* Fluted Oak Console Body */}
        <Part position={[0, 0.4, 0]}>
          <RoundedBox args={[2.0, 0.44, 0.52]} radius={0.06}>
            <meshStandardMaterial color="#8E6746" roughness={0.5} />
          </RoundedBox>
        </Part>
        {/* Marble Decor Tray & Vessel */}
        <mesh position={[-0.35, 0.63, 0]}>
          <boxGeometry args={[0.5, 0.02, 0.34]} />
          <meshStandardMaterial color="#F4F2EC" roughness={0.2} metalness={0.05} />
        </mesh>
        <mesh position={[-0.35, 0.67, 0]}>
          <sphereGeometry args={[0.08, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2E3C37" roughness={0.4} />
        </mesh>
        {/* Table Lamp on Console */}
        <group position={[0.55, 0.62, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.26, 24]} />
            <meshStandardMaterial color="#EDE9DE" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.13, 0.18, 0.24, 28, 1, true]} />
            <meshStandardMaterial color="#FFF5DE" side={THREE.DoubleSide} emissive="#FFB855" emissiveIntensity={night ? 1.6 : 0.3} />
          </mesh>
          <pointLight position={[0, 0.36, 0]} color="#FFBA66" distance={4} intensity={night ? 4 : 1.5} decay={2} />
        </group>
      </Item>

      {/* 6. STORAGE: TALL ARCHITECTURAL BOOKSHELF WITH BOOKS */}
      <Item id="bookshelf" position={[2.75, 0, -4.4]}>
        {/* Frame */}
        <Part position={[0, 1.4, 0]}>
          <boxGeometry args={[1.05, 2.7, 0.36]} />
          <meshStandardMaterial color="#7E5839" roughness={0.5} />
        </Part>
        {/* Inner hollow shelves */}
        {[0.4, 0.95, 1.5, 2.05, 2.6].map((sy, i) => (
          <mesh key={i} position={[0, sy, 0.02]}>
            <boxGeometry args={[0.95, 0.035, 0.34]} />
            <meshStandardMaterial color="#C59B27" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Books rows with colorful spines */}
        {[
          { y: 0.58, colors: ["#A85536", "#2D4C3E", "#D4AF37", "#48627A", "#8E6746"] },
          { y: 1.13, colors: ["#2D4C3E", "#EFEBE2", "#A85536", "#3A4540"] },
          { y: 1.68, colors: ["#C59B27", "#3B4A54", "#A85536", "#EFEBE2", "#48627A"] },
        ].map((shelf, sIdx) => (
          <group key={sIdx} position={[-0.32, shelf.y, 0.04]}>
            {shelf.colors.map((bCol, bIdx) => (
              <mesh key={bIdx} position={[bIdx * 0.08, 0, 0]}>
                <boxGeometry args={[0.065, 0.28, 0.22]} />
                <meshStandardMaterial color={bCol} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Decorative ceramic vases on upper shelves */}
        <mesh position={[0.2, 2.22, 0.04]}>
          <cylinderGeometry args={[0.06, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#EAE6DA" roughness={0.3} />
        </mesh>
        <mesh position={[-0.2, 2.2, 0.04]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#C87D55" roughness={0.5} />
        </mesh>
      </Item>

      {/* 7. ARCHED BRASS FLOOR LAMP WITH WARM LINEN SHADE */}
      <Item id="lamp" position={[-2.4, 0, -3.8]}>
        {/* Heavy Brass Base */}
        <Part position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.04, 32]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </Part>
        {/* Slender Brass Stem */}
        <Part position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 1.95, 12]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </Part>
        {/* Gentle Arch Arm */}
        <mesh position={[0.15, 1.98, 0]} rotation-z={-0.3}>
          <cylinderGeometry args={[0.018, 0.018, 0.45, 12]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Warm Linen Shade */}
        <mesh position={[0.3, 1.88, 0]}>
          <cylinderGeometry args={[0.24, 0.32, 0.42, 32, 1, true]} />
          <meshStandardMaterial
            color="#FFF4DC"
            side={THREE.DoubleSide}
            emissive="#FFAA44"
            emissiveIntensity={night ? 1.8 : 0.4}
            roughness={0.9}
          />
        </mesh>
        <pointLight position={[0.3, 1.88, 0]} color="#FFAA44" distance={7} intensity={night ? 6 : 2.5} decay={1.8} />
      </Item>

      {/* 8. MODERN SCULPTURAL BRASS CHANDELIER */}
      <Item id="chandelier" position={[0.3, 3.4, -1.6]}>
        {/* Ceiling Canopy & Stem */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 12]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Central Hub */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.07, 24, 16]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Radial Brass Arms & Frosted Glass Globes */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((rad, i) => {
          const armLen = 0.55;
          const gx = Math.cos(rad) * armLen;
          const gz = Math.sin(rad) * armLen;
          return (
            <group key={i}>
              <mesh position={[gx / 2, 0, gz / 2]} rotation-y={rad}>
                <cylinderGeometry args={[0.008, 0.008, armLen, 8]} />
                <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
              </mesh>
              <mesh position={[gx, 0, gz]}>
                <sphereGeometry args={[0.1, 24, 16]} />
                <meshStandardMaterial
                  color="#FFFDF5"
                  emissive="#FFD899"
                  emissiveIntensity={night ? 1.6 : 0.4}
                  roughness={0.2}
                />
              </mesh>
            </group>
          );
        })}
        <pointLight position={[0, -0.1, 0]} color="#FFD899" distance={8} intensity={night ? 6 : 2} decay={1.8} />
      </Item>

      {/* 9. EXTRAS: 2 POTTED PLANTS (ROUNDED BROAD LEAVES) */}
      {/* Large Floor Plant (Ficus Lyrata) */}
      <Item id="plant" position={[2.7, 0, -3.2]}>
        <RoundedPlant potColor="#C87D55" scale={1.15} />
      </Item>
      {/* Secondary Potted Plant near side console */}
      <group position={[-3.8, 0.64, 1.1]}>
        <RoundedPlant potColor="#EAE5DC" scale={0.45} />
      </group>

      {/* 10. EXTRAS: ROUND BOUCLÉ POUF */}
      <Item id="pouf" position={[1.4, 0, -0.6]}>
        <Part position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.34, 0.36, 0.44, 32]} />
          <meshStandardMaterial color="#EFEBE2" roughness={0.95} />
        </Part>
      </Item>

      {/* 11. EXTRAS: SIDE TABLE NEXT TO SOFA */}
      <Item id="sideTable" position={[-1.95, 0, -2.8]}>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.48, 12]} />
          <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
        </mesh>
        <Part position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
          <meshStandardMaterial color="#F7F5F0" roughness={0.15} metalness={0.1} />
        </Part>
      </Item>

      {/* 12. WALL ART GALLERY (3 BESPOKE FRAMES) & LARGE ROUND BRASS MIRROR */}
      <Item id="gallery">
        {/* Frame 1 (Center Large): Abstract Gold & Emerald Piece */}
        <mesh position={[0.2, 2.5, -4.93]}>
          <boxGeometry args={[1.5, 1.05, 0.04]} />
          <meshStandardMaterial color="#C59B27" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 2.5, -4.9]}>
          <planeGeometry args={[1.4, 0.95]} />
          <meshStandardMaterial map={art1Tex ?? null} roughness={0.5} />
        </mesh>

        {/* Frame 2 (Left): Arched Minimalist Form with Mat */}
        <mesh position={[-1.15, 2.55, -4.93]}>
          <boxGeometry args={[0.72, 0.94, 0.035]} />
          <meshStandardMaterial color="#7E5839" roughness={0.6} />
        </mesh>
        <mesh position={[-1.15, 2.55, -4.9]}>
          <planeGeometry args={[0.64, 0.86]} />
          <meshStandardMaterial map={art2Tex ?? null} roughness={0.5} />
        </mesh>

        {/* Frame 3 (Right): Botanical Line Study */}
        <mesh position={[1.55, 2.7, -4.93]}>
          <boxGeometry args={[0.65, 0.65, 0.035]} />
          <meshStandardMaterial color="#C59B27" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[1.55, 2.7, -4.9]}>
          <planeGeometry args={[0.58, 0.58]} />
          <meshStandardMaterial map={art3Tex ?? null} roughness={0.5} />
        </mesh>

        {/* Large Round Brass Mirror */}
        <group position={[-2.4, 2.45, -4.92]}>
          <mesh>
            <cylinderGeometry args={[0.52, 0.52, 0.03, 48]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <circleGeometry args={[0.48, 48]} />
            <meshStandardMaterial color="#E8EEF2" metalness={0.9} roughness={0.08} />
          </mesh>
        </group>

        {/* Minimalist Brass Wall Clock */}
        <mesh position={[1.55, 1.85, -4.92]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial map={clockTex ?? null} roughness={0.4} />
        </mesh>

        {/* 2 Floating Wall Shelves */}
        <mesh position={[-3.6, 2.65, -4.85]}>
          <boxGeometry args={[0.9, 0.03, 0.2]} />
          <meshStandardMaterial color="#8E6746" roughness={0.5} />
        </mesh>
        <mesh position={[-3.6, 2.15, -4.85]}>
          <boxGeometry args={[0.9, 0.03, 0.2]} />
          <meshStandardMaterial color="#8E6746" roughness={0.5} />
        </mesh>
        {/* Ceramics on floating shelves */}
        <mesh position={[-3.8, 2.75, -4.84]}>
          <cylinderGeometry args={[0.04, 0.06, 0.16, 16]} />
          <meshStandardMaterial color="#EDE9DE" roughness={0.3} />
        </mesh>
        <mesh position={[-3.4, 2.74, -4.84]}>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshStandardMaterial color="#C87D55" roughness={0.5} />
        </mesh>
      </Item>
    </group>
  );
}

function Bedroom() {
  const { colors, night } = useContext(SceneCtx);
  const x = ROOMS.bedroom.x;
  const rugTex = useMemo(() => getRugTexture(), []);
  const art1Tex = useMemo(() => getArtTexture(1), []);
  const art2Tex = useMemo(() => getArtTexture(2), []);

  return (
    <group>
      <Shell x={x} grey={false} />

      {/* 1. Bedroom Rug */}
      <Item id="rug">
        <Part position={[x + 0.5, 0.012, -2.1]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[4.8, 3.8]} />
          <Mat color={colors.rug} roughness={0.92} map={rugTex} />
        </Part>
      </Item>

      {/* 2. Master Bed Suite */}
      <Item id="bed" position={[x + 0.5, 0, -3.1]}>
        {/* Tapered Brass Bed Legs */}
        {([
          [-1.25, 0.06, 1.25],
          [1.25, 0.06, 1.25],
          [-1.25, 0.06, -1.25],
          [1.25, 0.06, -1.25],
        ] as const).map(([bx, by, bz], i) => (
          <mesh key={i} position={[bx, by, bz]}>
            <cylinderGeometry args={[0.03, 0.018, 0.12, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}

        {/* Low Profile Upholstered Bed Platform */}
        <Part position={[0, 0.22, 0]}>
          <RoundedBox args={[2.7, 0.22, 2.7]} radius={0.08}>
            <Mat color={colors.sofa} roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* Sculptural Channeled Fluted Headboard */}
        <group position={[0, 1.15, -1.36]}>
          {[-1.05, -0.525, 0, 0.525, 1.05].map((hx, idx) => (
            <Part key={idx} position={[hx, 0, 0]}>
              <RoundedBox args={[0.5, 1.6, 0.16]} radius={0.08}>
                <Mat color={colors.sofa} roughness={0.85} />
              </RoundedBox>
            </Part>
          ))}
          {/* Headboard Top Brass Trim */}
          <mesh position={[0, 0.81, 0]}>
            <boxGeometry args={[2.72, 0.03, 0.17]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* Deep Plush Mattress */}
        <Part position={[0, 0.44, 0.06]}>
          <RoundedBox args={[2.46, 0.24, 2.44]} radius={0.07}>
            <meshStandardMaterial color="#FAF9F5" roughness={0.9} />
          </RoundedBox>
        </Part>

        {/* Crisp Folded Duvet / Comforter */}
        <Part position={[0, 0.57, 0.28]}>
          <RoundedBox args={[2.48, 0.18, 1.96]} radius={0.08}>
            <meshStandardMaterial color="#F4F2EC" roughness={0.85} />
          </RoundedBox>
        </Part>

        {/* Turned Down Sheet Fold */}
        <Part position={[0, 0.58, -0.66]}>
          <RoundedBox args={[2.44, 0.08, 0.28]} radius={0.04}>
            <meshStandardMaterial color="#EAE7DE" roughness={0.9} />
          </RoundedBox>
        </Part>

        {/* Bed End Decorative Accent Throw Runner */}
        <Part position={[0, 0.67, 0.85]}>
          <RoundedBox args={[2.52, 0.04, 0.68]} radius={0.03}>
            <Mat color={colors.rug} roughness={0.95} />
          </RoundedBox>
        </Part>

        {/* Pillows: 2 Primary King Pillows + 2 Decorative Accent Bouclé Cushions */}
        <Part position={[-0.62, 0.66, -0.86]} rotation-x={0.28}>
          <RoundedBox args={[0.88, 0.18, 0.46]} radius={0.08}>
            <meshStandardMaterial color="#FAF9F5" roughness={0.8} />
          </RoundedBox>
        </Part>
        <Part position={[0.62, 0.66, -0.86]} rotation-x={0.28}>
          <RoundedBox args={[0.88, 0.18, 0.46]} radius={0.08}>
            <meshStandardMaterial color="#FAF9F5" roughness={0.8} />
          </RoundedBox>
        </Part>
        <Part position={[-0.45, 0.72, -0.65]} rotation-x={0.2}>
          <RoundedBox args={[0.48, 0.34, 0.18]} radius={0.08}>
            <meshStandardMaterial color="#C59B27" roughness={0.8} />
          </RoundedBox>
        </Part>
        <Part position={[0.45, 0.72, -0.65]} rotation-x={0.2}>
          <RoundedBox args={[0.48, 0.34, 0.18]} radius={0.08}>
            <Mat color={colors.accent} roughness={0.8} />
          </RoundedBox>
        </Part>
      </Item>

      {/* 3. Nightstands with Walnut Veneer, Marble Tops, and Frosted Glass Lamps */}
      {[-2.05, 2.05].map((dx, i) => (
        <Item key={i} id="nightstand" position={[x + 0.5 + dx, 0, -4.1]}>
          {/* Nightstand Body with Fluted Wood Slats */}
          <Part position={[0, 0.34, 0]}>
            <RoundedBox args={[0.76, 0.58, 0.56]} radius={0.04}>
              <meshStandardMaterial color="#5E4330" roughness={0.5} />
            </RoundedBox>
          </Part>
          {/* Honed White Marble Top */}
          <Part position={[0, 0.64, 0]}>
            <RoundedBox args={[0.78, 0.03, 0.58]} radius={0.02}>
              <meshStandardMaterial color="#F4F3EE" roughness={0.2} metalness={0.05} />
            </RoundedBox>
          </Part>
          {/* Brass Drawer Handle */}
          <mesh position={[0, 0.42, 0.29]}>
            <boxGeometry args={[0.18, 0.02, 0.02]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Table Lamp: Brass Base + Stem + Frosted White Glass Globe */}
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.26, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <sphereGeometry args={[0.14, 24, 16]} />
            <meshStandardMaterial
              color="#FDFBF7"
              emissive="#FFD79E"
              emissiveIntensity={night ? 2.5 : 0.2}
              roughness={0.2}
            />
          </mesh>
        </Item>
      ))}

      {/* 4. Bedroom Reading Chair & Side Table */}
      <Item id="armchair" position={[x - 2.8, 0, -1.4]} rotation-y={0.75}>
        <Part position={[0, 0.35, 0]}>
          <RoundedBox args={[0.82, 0.22, 0.8]} radius={0.09}>
            <meshStandardMaterial color="#F3EFE6" roughness={0.85} />
          </RoundedBox>
        </Part>
        <Part position={[0, 0.72, -0.32]}>
          <RoundedBox args={[0.82, 0.56, 0.18]} radius={0.09}>
            <meshStandardMaterial color="#F3EFE6" roughness={0.85} />
          </RoundedBox>
        </Part>
        {/* Chair Legs */}
        {([
          [-0.32, 0.1, 0.28],
          [0.32, 0.1, 0.28],
          [-0.3, 0.1, -0.28],
          [0.3, 0.1, -0.28],
        ] as const).map(([cx, cy, cz], idx) => (
          <mesh key={idx} position={[cx, cy, cz]}>
            <cylinderGeometry args={[0.02, 0.012, 0.22, 12]} />
            <meshStandardMaterial color="#C59B27" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </Item>

      {/* 5. Framed Diptych Art Canvas Above Headboard */}
      <Item id="gallery">
        <mesh position={[x + 0.5 - 0.75, 2.7, -4.92]}>
          <boxGeometry args={[0.85, 1.15, 0.035]} />
          <meshStandardMaterial color="#C59B27" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[x + 0.5 - 0.75, 2.7, -4.89]}>
          <planeGeometry args={[0.77, 1.05]} />
          <meshStandardMaterial map={art1Tex ?? null} roughness={0.5} />
        </mesh>
        <mesh position={[x + 0.5 + 0.75, 2.7, -4.92]}>
          <boxGeometry args={[0.85, 1.15, 0.035]} />
          <meshStandardMaterial color="#C59B27" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[x + 0.5 + 0.75, 2.7, -4.89]}>
          <planeGeometry args={[0.77, 1.05]} />
          <meshStandardMaterial map={art2Tex ?? null} roughness={0.5} />
        </mesh>
      </Item>

      {/* 6. Lush Potted Floor Tree */}
      <Item id="plant" position={[x + 3.6, 0, -1]}>
        <RoundedPlant potColor="#D9CFC0" scale={1.05} />
      </Item>
    </group>
  );
}

function Kitchen() {
  const { colors, night } = useContext(SceneCtx);
  const x = ROOMS.kitchen.x;
  const rugTex = useMemo(() => getRugTexture(), []);

  return (
    <group>
      <Shell x={x} grey={false} />

      {/* 1. Full-Length Back Cabinets & Honed Marble Splashback */}
      <group position={[x + 0.5, 0, -4.5]}>
        {/* Base Cabinet Frame */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 0.9, 0.75]} />
          <Mat color={colors.sofa} roughness={0.7} />
        </mesh>
        {/* Brass Edge Pulls on Drawers */}
        {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((bx, i) => (
          <mesh key={i} position={[bx, 0.78, 0.38]}>
            <boxGeometry args={[0.4, 0.02, 0.02]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {/* Honed Marble Back Countertop */}
        <mesh position={[0, 0.92, 0.01]} receiveShadow>
          <boxGeometry args={[7.25, 0.06, 0.8]} />
          <meshStandardMaterial color="#EDEAE3" roughness={0.25} metalness={0.05} />
        </mesh>
        {/* Honed Full Slab Marble Backsplash */}
        <mesh position={[0, 1.85, -0.38]} receiveShadow>
          <boxGeometry args={[7.2, 1.8, 0.04]} />
          <meshStandardMaterial color="#EDEAE3" roughness={0.3} metalness={0.05} />
        </mesh>
        {/* Sleek Cooktop with Inset Burner Discs */}
        <mesh position={[0, 0.955, -0.05]}>
          <boxGeometry args={[0.9, 0.01, 0.52]} />
          <meshStandardMaterial color="#1A1C1E" roughness={0.15} metalness={0.4} />
        </mesh>
        {/* Architectural Brass & Black Range Hood Canopy */}
        <mesh position={[0, 2.65, -0.15]}>
          <boxGeometry args={[1.2, 0.9, 0.5]} />
          <meshStandardMaterial color="#2B3032" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.22, -0.15]}>
          <boxGeometry args={[1.22, 0.04, 0.52]} />
          <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Floating Natural Oak Shelves with Stoneware Styling */}
        {[-2.2, 2.2].map((sx, i) => (
          <group key={i} position={[sx, 2.05, -0.2]}>
            <mesh>
              <boxGeometry args={[2.2, 0.04, 0.28]} />
              <meshStandardMaterial color="#8E6746" roughness={0.6} />
            </mesh>
            {/* Ceramic bowls & bottles */}
            <mesh position={[-0.6, 0.12, 0]}>
              <cylinderGeometry args={[0.07, 0.05, 0.18, 16]} />
              <meshStandardMaterial color="#EAE5DA" roughness={0.4} />
            </mesh>
            <mesh position={[0.4, 0.1, 0]}>
              <cylinderGeometry args={[0.12, 0.08, 0.14, 16]} />
              <meshStandardMaterial color="#C87D55" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. Luxury Waterfall Marble Kitchen Island */}
      <Item id="island" position={[x + 0.5, 0, -1.8]}>
        {/* Fluted Oak Island Base Body */}
        <Part position={[0, 0.45, 0]}>
          <boxGeometry args={[3.0, 0.88, 1.15]} />
          <Mat color={colors.sofa} roughness={0.75} />
        </Part>

        {/* Calacatta Marble Top Slab */}
        <Part position={[0, 0.93, 0]}>
          <boxGeometry args={[3.24, 0.08, 1.25]} />
          <meshStandardMaterial color="#F4F2EC" roughness={0.2} metalness={0.06} />
        </Part>

        {/* Calacatta Waterfall Marble Left Side */}
        <Part position={[-1.6, 0.46, 0]}>
          <boxGeometry args={[0.06, 0.92, 1.25]} />
          <meshStandardMaterial color="#F4F2EC" roughness={0.2} metalness={0.06} />
        </Part>

        {/* Calacatta Waterfall Marble Right Side */}
        <Part position={[1.6, 0.46, 0]}>
          <boxGeometry args={[0.06, 0.92, 1.25]} />
          <meshStandardMaterial color="#F4F2EC" roughness={0.2} metalness={0.06} />
        </Part>

        {/* Recessed Undermount Sink */}
        <mesh position={[-0.65, 0.94, 0]}>
          <boxGeometry args={[0.62, 0.01, 0.45]} />
          <meshStandardMaterial color="#2E3336" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Tall Arched Brass Gooseneck Faucet */}
        <group position={[-0.65, 0.98, -0.22]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.32, 16]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.33, 0.08]} rotation-x={Math.PI / 4}>
            <cylinderGeometry args={[0.014, 0.014, 0.16, 16]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* Island Styling: Artisan Wooden Cutting Board & Fruit Bowl */}
        <mesh position={[0.6, 0.98, 0.1]}>
          <boxGeometry args={[0.42, 0.03, 0.3]} />
          <meshStandardMaterial color="#825C3C" roughness={0.7} />
        </mesh>
        <mesh position={[0.6, 1.04, 0.1]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#C9945B" roughness={0.9} />
        </mesh>
        <mesh position={[-0.05, 1.02, 0.05]}>
          <cylinderGeometry args={[0.18, 0.1, 0.09, 24]} />
          <meshStandardMaterial color="#F4F1EA" roughness={0.3} />
        </mesh>
      </Item>

      {/* 3. Designer Leather Counter Stools */}
      {[-0.95, 0, 0.95].map((dx, i) => (
        <Item key={i} id="stool" position={[x + 0.5 + dx, 0, -0.72]}>
          {/* Curved Saddle Leather Seat */}
          <Part position={[0, 0.68, 0]}>
            <RoundedBox args={[0.42, 0.08, 0.38]} radius={0.04}>
              <meshStandardMaterial color="#503322" roughness={0.65} />
            </RoundedBox>
          </Part>
          {/* Black Metal Stool Legs */}
          {([
            [-0.16, 0.33, 0.14],
            [0.16, 0.33, 0.14],
            [-0.16, 0.33, -0.14],
            [0.16, 0.33, -0.14],
          ] as const).map(([lx, ly, lz], idx) => (
            <mesh key={idx} position={[lx, ly, lz]}>
              <cylinderGeometry args={[0.014, 0.01, 0.66, 12]} />
              <meshStandardMaterial color="#1E1E1E" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
          {/* Brass Footrest Ring */}
          <mesh position={[0, 0.22, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.18, 0.012, 12, 24]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </mesh>
        </Item>
      ))}

      {/* 4. Sculptural Brushed Brass Pendants Over Island */}
      {[-0.8, 0.8].map((dx, i) => (
        <Item key={i} id="pendant" position={[x + 0.5 + dx, 0, -1.8]}>
          {/* Black Suspension Wire */}
          <mesh position={[0, 3.3, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.4, 8]} />
            <meshStandardMaterial color="#1E1E1E" />
          </mesh>
          {/* Brass Cone / Dome Shade */}
          <Part position={[0, 2.52, 0]}>
            <cylinderGeometry args={[0.06, 0.34, 0.26, 32]} />
            <meshStandardMaterial color="#C59B27" metalness={0.85} roughness={0.2} />
          </Part>
          {/* Frosted Warm Glow Diffuser */}
          <mesh position={[0, 2.38, 0]}>
            <sphereGeometry args={[0.12, 24, 16]} />
            <meshStandardMaterial
              color="#FFF9EE"
              emissive="#FFD199"
              emissiveIntensity={night ? 2.8 : 0.4}
              roughness={0.2}
            />
          </mesh>
        </Item>
      ))}

      {/* 5. Natural Woven Kitchen Floor Runner */}
      <Item id="rug">
        <Part position={[x + 0.5, 0.012, -1.8]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[4.6, 2.6]} />
          <Mat color={colors.rug} roughness={0.95} map={rugTex} />
        </Part>
      </Item>

      {/* 6. Indoor Potted Tree */}
      <Item id="plant" position={[x - 3.6, 0, -1.2]}>
        <RoundedPlant potColor="#C87D55" scale={1.05} />
      </Item>
    </group>
  );
}

/** Soft realistic lighting setup with warm sun, ambient bounce, HDR environment, and lamp glow. */
function Lights() {
  const { night, grey } = useContext(SceneCtx);
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.HemisphereLight>(null);
  const bedSun = useRef<THREE.DirectionalLight>(null);
  const kitSun = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useFrame((_, d) => {
    const k = 1 - Math.exp(-3 * d);
    if (sun.current) {
      const targetSun = grey ? 0.35 : night ? 0.1 : 2.5;
      sun.current.intensity += (targetSun - sun.current.intensity) * k;
    }
    if (bedSun.current) {
      bedSun.current.intensity += ((night ? 0.1 : 2.4) - bedSun.current.intensity) * k;
    }
    if (kitSun.current) {
      kitSun.current.intensity += ((night ? 0.1 : 2.4) - kitSun.current.intensity) * k;
    }
    if (amb.current) {
      const targetAmb = grey ? 0.45 : night ? 0.5 : 0.85;
      amb.current.intensity += (targetAmb - amb.current.intensity) * k;
    }
    const bg = scene.background as THREE.Color | null;
    bg?.lerp(new THREE.Color(grey ? "#7A8288" : night ? "#16201D" : "#F6F5F0"), k);
  });

  return (
    <>
      <color attach="background" args={[grey ? "#7A8288" : "#F6F5F0"]} />

      {/* HDR Environment Reflections */}
      <Environment preset="apartment" environmentIntensity={grey ? 0.25 : 0.85} />

      {/* Soft Ambient Sky / Ground Bounce */}
      <hemisphereLight
        ref={amb}
        args={[
          grey ? "#B8C4CC" : "#FFF7EB",
          grey ? "#5E6870" : "#8A9A86",
          grey ? 0.45 : 0.85,
        ]}
      />

      {/* Warm Directional Sunlight Beaming from the Living Window */}
      <directionalLight
        ref={sun}
        position={grey ? [-6, 5, 0] : [-8, 5.5, -0.6]}
        intensity={grey ? 0.35 : 2.5}
        color={grey ? "#C4D2DC" : "#FFF1D8"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      {/* Bedroom Directional Sunlight */}
      <directionalLight
        ref={bedSun}
        position={[ROOMS.bedroom.x - 8, 5.5, -0.6]}
        intensity={2.4}
        color="#FFF1D8"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      {/* Kitchen Directional Sunlight */}
      <directionalLight
        ref={kitSun}
        position={[ROOMS.kitchen.x - 8, 5.5, -0.6]}
        intensity={2.4}
        color="#FFF1D8"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      {/* Warm Night Accent Lamps */}
      <pointLight position={[-2.3, 1.9, -3.6]} color="#FFB866" distance={8} decay={1.5} intensity={night ? 4 : 0.4} />
      <pointLight position={[ROOMS.bedroom.x + 0.5, 1.4, -3.6]} color="#FFB866" distance={8} decay={1.5} intensity={night ? 4 : 0.4} />
      <pointLight position={[ROOMS.kitchen.x + 0.5, 2.3, -1.8]} color="#FFD199" distance={8} decay={1.5} intensity={night ? 4.5 : 0.6} />
    </>
  );
}

const CAM = { pos: new THREE.Vector3(3.2, 3.2, 5.2), look: new THREE.Vector3(-0.3, 1, -2.2) };

/** Camera rig handling smooth navigation, gentle drift, and subtle mouse parallax. */
function Rig({ room, mode, reduced }: { room: RoomKey; mode: Mode; reduced: boolean }) {
  const { camera, pointer } = useThree();
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const moving = useRef(true);
  const look = useRef(CAM.look.clone());

  useEffect(() => {
    moving.current = true;
  }, [room]);

  useFrame((state, d) => {
    const ox = ROOMS[room].x;
    const goalPos = CAM.pos.clone().add(new THREE.Vector3(ox, 0, 0));
    const goalLook = CAM.look.clone().add(new THREE.Vector3(ox, 0, 0));
    const k = 1 - Math.exp(-2.5 * d);

    if (mode === "hero" && !reduced) {
      const t = state.clock.elapsedTime;
      goalPos.x += Math.sin(t * 0.15) * 0.5 + pointer.x * 0.55;
      goalPos.y += Math.cos(t * 0.1) * 0.15 + pointer.y * 0.3;
    }

    if (mode === "static" && !reduced) {
      // Gentle camera drift and subtle mouse parallax for before/after inspection
      const t = state.clock.elapsedTime;
      goalPos.x += Math.sin(t * 0.3) * 0.1 + pointer.x * 0.28;
      goalPos.y += Math.cos(t * 0.22) * 0.07 + pointer.y * 0.18;
      goalLook.x += pointer.x * 0.12;
      goalLook.y += pointer.y * 0.08;
    }

    if (mode === "studio") {
      if (!moving.current || !controls.current) return;
      camera.position.lerp(goalPos, k);
      controls.current.target.lerp(goalLook, k);
      controls.current.update();
      if (camera.position.distanceTo(goalPos) < 0.05) moving.current = false;
      return;
    }

    camera.position.lerp(goalPos, k);
    look.current.lerp(goalLook, k);
    camera.lookAt(look.current);
  });

  if (mode !== "studio") return null;
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={3.5}
      maxDistance={9}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2.2}
      minAzimuthAngle={-0.2}
      maxAzimuthAngle={1.1}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}

export type RoomCanvasProps = {
  style?: StyleKey;
  night?: boolean;
  grey?: boolean;
  room?: RoomKey;
  mode?: Mode;
  onSelect?: ((k: string) => void) | undefined;
  onMissed?: (() => void) | undefined;
};

export default function RoomCanvas({
  style = "modern",
  night = false,
  grey = false,
  room = "living",
  mode = "hero",
  onSelect,
  onMissed,
}: RoomCanvasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [lowPower, setLowPower] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setLowPower(window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const colors = grey ? GREY : STYLES[style];
  const ctx: Ctx = {
    colors,
    night,
    grey,
    interactive: mode === "studio",
    hovered,
    setHovered,
    onSelect,
  };

  return (
    <Canvas
      shadows={!lowPower}
      dpr={lowPower ? 1 : [1, 1.75]}
      camera={{ position: CAM.pos.toArray(), fov: 45 }}
      {...(onMissed ? { onPointerMissed: onMissed } : {})}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Interactive 3D living room"
    >
      <SceneCtx.Provider value={ctx}>
        <Lights />
        <Living />
        {mode === "studio" && (
          <>
            <Bedroom />
            <Kitchen />
          </>
        )}
        {/* Soft contact shadows under all furniture */}
        {!lowPower && (
          <>
            <ContactShadows
              position={[0, 0.005, -2]}
              scale={11}
              opacity={grey ? 0.45 : 0.65}
              blur={1.8}
              far={4}
              resolution={512}
              color={grey ? "#181818" : "#22160C"}
            />
            {mode === "studio" && (
              <>
                <ContactShadows
                  position={[ROOMS.bedroom.x, 0.005, -2]}
                  scale={11}
                  opacity={0.65}
                  blur={1.8}
                  far={4}
                  resolution={512}
                  color="#22160C"
                />
                <ContactShadows
                  position={[ROOMS.kitchen.x, 0.005, -2]}
                  scale={11}
                  opacity={0.65}
                  blur={1.8}
                  far={4}
                  resolution={512}
                  color="#22160C"
                />
              </>
            )}
          </>
        )}
        <Rig room={room} mode={mode} reduced={reduced} />
      </SceneCtx.Provider>
    </Canvas>
  );
}

export { FURNITURE };
