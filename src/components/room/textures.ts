import * as THREE from "three";

// Cache textures so they are generated once per session
const cache: Record<string, THREE.CanvasTexture> = {};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Procedural off-white plaster texture with subtle grain and variation.
 */
export function getPlasterTexture(): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  if (cache["plaster"]) return cache["plaster"];

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Soft off-white base
  ctx.fillStyle = "#F5F3ED";
  ctx.fillRect(0, 0, 512, 512);

  // Micro-stipple plaster texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    data[i] = Math.min(255, Math.max(0, r + noise));
    data[i + 1] = Math.min(255, Math.max(0, g + noise));
    data[i + 2] = Math.min(255, Math.max(0, b + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  cache["plaster"] = texture;
  return texture;
}

/**
 * Natural oak wood plank floor texture with visible planks and fine grain.
 */
export function getWoodFloorTexture(): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  if (cache["woodFloor"]) return cache["woodFloor"];

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base warm honey/oak tone
  ctx.fillStyle = "#B38F68";
  ctx.fillRect(0, 0, 512, 512);

  const plankHeight = 64;
  const colors = ["#BD9973", "#B6916B", "#AA8660", "#C4A27D", "#A37F5A"];

  for (let y = 0; y < 512; y += plankHeight) {
    const colIndex = Math.floor(y / plankHeight) % colors.length;
    const col = colors[colIndex] ?? "#BD9973";
    ctx.fillStyle = col;
    ctx.fillRect(0, y, 512, plankHeight - 2);

    // Fine wood grain lines inside each plank
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    for (let k = 0; k < 6; k++) {
      const gy = y + Math.random() * (plankHeight - 4);
      ctx.fillRect(0, gy, 512, 1);
    }

    // Plank seam shadow
    ctx.fillStyle = "rgba(40, 25, 10, 0.4)";
    ctx.fillRect(0, y + plankHeight - 2, 512, 2);
  }

  // Staggered vertical butt joints
  ctx.fillStyle = "rgba(40, 25, 10, 0.35)";
  ctx.fillRect(180, 0, 2, plankHeight);
  ctx.fillRect(360, plankHeight, 2, plankHeight);
  ctx.fillRect(120, plankHeight * 2, 2, plankHeight);
  ctx.fillRect(320, plankHeight * 3, 2, plankHeight);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  cache["woodFloor"] = texture;
  return texture;
}

/**
 * Subtle woven cream rug texture with textured diamond motifs.
 */
export function getRugTexture(): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  if (cache["rug"]) return cache["rug"];

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Cream base
  ctx.fillStyle = "#EAE6DC";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle woven grid texture
  ctx.fillStyle = "rgba(160, 150, 135, 0.12)";
  for (let x = 0; x < 512; x += 12) {
    ctx.fillRect(x, 0, 2, 512);
  }
  for (let y = 0; y < 512; y += 12) {
    ctx.fillRect(0, y, 512, 2);
  }

  // Modern subtle geometric diamond pattern
  ctx.strokeStyle = "rgba(140, 130, 115, 0.28)";
  ctx.lineWidth = 2.5;
  const step = 64;
  for (let x = 0; x < 512; x += step) {
    for (let y = 0; y < 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y);
      ctx.lineTo(x + step, y + step / 2);
      ctx.lineTo(x + step / 2, y + step);
      ctx.lineTo(x, y + step / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Subtle woven border
  ctx.strokeStyle = "rgba(120, 110, 95, 0.35)";
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  cache["rug"] = texture;
  return texture;
}

/**
 * Editorial gallery art pieces.
 */
export function getArtTexture(variant: 1 | 2 | 3): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  const key = `art_${variant}`;
  if (cache[key]) return cache[key];

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (variant === 1) {
    // Abstract Gold & Emerald Luxury Piece
    ctx.fillStyle = "#1F3A34";
    ctx.fillRect(0, 0, 512, 512);

    // Warm gold and cream organic shapes
    const grad = ctx.createLinearGradient(100, 100, 400, 400);
    grad.addColorStop(0, "#E8CA6E");
    grad.addColorStop(0.5, "#C59B27");
    grad.addColorStop(1, "#8A6A48");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(280, 240, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#EAE4D6";
    ctx.beginPath();
    ctx.ellipse(220, 310, 110, 70, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(260, 250, 180, 0.2, Math.PI * 1.4);
    ctx.stroke();
  } else if (variant === 2) {
    // Minimalist Arched Architectural Form
    ctx.fillStyle = "#F7F5EE";
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = "#C87D55"; // Terracotta arch
    ctx.beginPath();
    ctx.arc(256, 260, 120, Math.PI, 0);
    ctx.lineTo(376, 440);
    ctx.lineTo(136, 440);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#2D3E3A"; // Forest sphere
    ctx.beginPath();
    ctx.arc(256, 200, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#B08D57";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(40, 40, 432, 432);
  } else {
    // Botanical Line Study
    ctx.fillStyle = "#EDE8DF";
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = "#A2B19F";
    ctx.beginPath();
    ctx.arc(220, 280, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1A2E26";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(256, 460);
    ctx.bezierCurveTo(240, 320, 270, 200, 256, 80);
    ctx.stroke();

    // Curved leaves
    for (let y = 140; y < 400; y += 60) {
      ctx.beginPath();
      ctx.ellipse(210, y, 40, 18, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(300, y + 25, 40, 18, 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  cache[key] = texture;
  return texture;
}

/**
 * Clock dial texture with brass indices and hands.
 */
export function getClockTexture(): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  if (cache["clock"]) return cache["clock"];

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#F7F5F0";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#B08D57";
  ctx.lineWidth = 6;
  ctx.stroke();

  // 12 hour ticks
  ctx.fillStyle = "#2D3E3A";
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = 128 + Math.cos(angle) * 100;
    const y1 = 128 + Math.sin(angle) * 100;
    const r = i % 3 === 0 ? 5 : 2.5;
    ctx.beginPath();
    ctx.arc(x1, y1, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hands (set at 10:10 aesthetic time)
  ctx.strokeStyle = "#1A2623";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(82, 86);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(176, 88);
  ctx.stroke();

  // Center brass pin
  ctx.fillStyle = "#B08D57";
  ctx.beginPath();
  ctx.arc(128, 128, 6, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  cache["clock"] = texture;
  return texture;
}

/**
 * Dull, cold scuffed concrete floor texture for the "Before" room.
 */
export function getBeforeFloorTexture(): THREE.CanvasTexture | null {
  if (!isBrowser()) return null;
  if (cache["beforeFloor"]) return cache["beforeFloor"];

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dull mottled grey
  ctx.fillStyle = "#7D8285";
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 36;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    data[i] = Math.min(255, Math.max(0, r + noise));
    data[i + 1] = Math.min(255, Math.max(0, g + noise));
    data[i + 2] = Math.min(255, Math.max(0, b + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // A couple of worn hairline scratches
  ctx.strokeStyle = "rgba(40, 40, 40, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.lineTo(160, 140);
  ctx.moveTo(300, 240);
  ctx.lineTo(440, 220);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  cache["beforeFloor"] = texture;
  return texture;
}
