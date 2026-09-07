import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneHost = document.querySelector('#scene');
const runPauseBtn = document.querySelector('#runPauseBtn');
const resetBtn = document.querySelector('#resetBtn');
const heaterOnBtn = document.querySelector('#heaterOnBtn');
const heaterOffBtn = document.querySelector('#heaterOffBtn');
const heatPower = document.querySelector('#heatPower');
const heatPowerValue = document.querySelector('#heatPowerValue');
const heaterPosition = document.querySelector('#heaterPosition');
const heaterPositionValue = document.querySelector('#heaterPositionValue');
const particleCount = document.querySelector('#particleCount');
const particleCountValue = document.querySelector('#particleCountValue');
const particleSpeed = document.querySelector('#particleSpeed');
const particleSpeedValue = document.querySelector('#particleSpeedValue');
const temperatureToggle = document.querySelector('#temperatureToggle');
const densityToggle = document.querySelector('#densityToggle');
const densityPanel = document.querySelector('#densityPanel');
const statusDot = document.querySelector('#statusDot');
const statusText = document.querySelector('#statusText');
const explainText = document.querySelector('#explainText');
const walkthroughBtn = document.querySelector('#walkthroughBtn');
const walkthroughStopBtn = document.querySelector('#walkthroughStopBtn');
const walkthroughBanner = document.querySelector('#walkthroughBanner');
const walkthroughStepLabel = document.querySelector('#walkthroughStepLabel');
const walkthroughTitle = document.querySelector('#walkthroughTitle');
const walkthroughText = document.querySelector('#walkthroughText');
const walkthroughDots = [...document.querySelectorAll('.step-dots span')];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3f8fb);
scene.fog = new THREE.Fog(0xf3f8fb, 12, 23);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(11.4, 5.5, 7.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.60, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 7.5;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb2bf, 2.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
scene.add(keyLight);

const TANK = { width: 9.2, height: 4.10, depth: 1.55 };
const BOUNDS = {
  xMin: -TANK.width / 2 + 0.18,
  xMax: TANK.width / 2 - 0.18,
  yMin: 0.18,
  yMax: 3.02,
  zMin: -TANK.depth / 2 + 0.08,
  zMax: TANK.depth / 2 - 0.08,
};
let heaterX = -1.45;
const heaterZ = 0;
const HEATER_RADIUS = 0.46;
const HEATER_X_LIMIT = 3.55;
const SURFACE_Y = 3.12;
const DEPTH_MOTION_SCALE = 0.58;
const HEAT_EFFECT_RADIUS = HEATER_RADIUS * 0.94;
const MAX_SURFACE_RISE = 0.72;

const tankGroup = new THREE.Group();
scene.add(tankGroup);

const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x9cc9dc,
  transparent: true,
  opacity: 0.10,
  roughness: 0.28,
  transmission: 0.72,
  thickness: 1.1,
  depthWrite: false,
});

const waterBottomY = 0.08;
const water = new THREE.Mesh(
  new THREE.BoxGeometry(TANK.width - 0.16, SURFACE_Y - waterBottomY, TANK.depth - 0.16),
  waterMaterial
);
water.position.y = (SURFACE_Y + waterBottomY) / 2;
water.renderOrder = 0;
tankGroup.add(water);

const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(TANK.width, TANK.height, TANK.depth)),
  new THREE.LineBasicMaterial({ color: 0x6f91a2, transparent: true, opacity: 0.64 })
);
edges.position.y = TANK.height / 2;
tankGroup.add(edges);

const base = new THREE.Mesh(
  new THREE.BoxGeometry(TANK.width + 0.8, 0.28, TANK.depth + 0.8),
  new THREE.MeshStandardMaterial({ color: 0xdce6eb, roughness: 0.8 })
);
base.position.y = -0.18;
base.receiveShadow = true;
scene.add(base);

const heaterGroup = new THREE.Group();
const heaterPlate = new THREE.Mesh(
  new THREE.CylinderGeometry(HEATER_RADIUS * 1.14, HEATER_RADIUS * 1.14, 0.16, 64),
  new THREE.MeshStandardMaterial({ color: 0x30373d, roughness: 0.30, metalness: 0.66 })
);
heaterPlate.position.set(heaterX, 0.005, heaterZ);
heaterPlate.castShadow = true;
heaterGroup.add(heaterPlate);

const heaterPadTop = new THREE.Mesh(
  new THREE.CircleGeometry(HEATER_RADIUS, 64),
  new THREE.MeshStandardMaterial({
    color: 0x8f3327,
    emissive: 0xff5a34,
    emissiveIntensity: 2.8,
    roughness: 0.25,
    metalness: 0.12,
    side: THREE.DoubleSide,
  })
);
heaterPadTop.rotation.x = -Math.PI / 2;
heaterPadTop.position.set(heaterX, 0.095, heaterZ);
heaterGroup.add(heaterPadTop);
scene.add(heaterGroup);

const coilMaterial = heaterPadTop.material;
const heaterLight = new THREE.PointLight(0xff704c, 4.0, 4.2, 2);
heaterLight.position.set(heaterX, 0.44, heaterZ);
scene.add(heaterLight);

// V9 heat cue: a deliberately subtle, non-vector visual guide. It suggests
// where heating is strongest without pretending to be a measured field.
const heatCueGroup = new THREE.Group();
scene.add(heatCueGroup);

const heatConeMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uPower: { value: 1.0 },
    uColor: { value: new THREE.Color(0xff7a45) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uPower;
    uniform vec3 uColor;
    void main() {
      float endFade = smoothstep(0.0, 0.13, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
      float strength = pow(1.0 - vUv.y, 0.55);
      float alpha = 0.095 * uPower * endFade * (0.45 + 0.55 * strength);
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
});
const heatCone = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, HEATER_RADIUS * 0.72, 2.75, 48, 16, true),
  heatConeMaterial
);
heatCone.position.set(heaterX, 1.52, heaterZ);
heatCone.renderOrder = 2;
heatCueGroup.add(heatCone);

const heatHaloMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uPower: { value: 1.0 },
    uColor: { value: new THREE.Color(0xff8a55) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uPower;
    uniform vec3 uColor;
    void main() {
      float d = distance(vUv, vec2(0.5));
      float glow = 1.0 - smoothstep(0.05, 0.5, d);
      gl_FragColor = vec4(uColor, glow * 0.18 * uPower);
    }
  `,
});
const heatHalo = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55), heatHaloMaterial);
heatHalo.rotation.x = -Math.PI / 2;
heatHalo.position.set(heaterX, 0.135, heaterZ);
heatHalo.renderOrder = 2;
heatCueGroup.add(heatHalo);

const PARTICLE_RADIUS = 0.068;
const BASE_COLLISION_DISTANCE = PARTICLE_RADIUS * 2.22;
const MAX_COLLISION_DISTANCE = BASE_COLLISION_DISTANCE * 1.72;
const particleGeometry = new THREE.SphereGeometry(PARTICLE_RADIUS, 8, 8);
const ambientColor = new THREE.Color(0x5e9fd4);
const warmColor = new THREE.Color(0xef795f);
const neutralColor = new THREE.Color(0x7aa8c5);

let particles = [];
let particleMesh = null;
let particleMaterial = null;
let isRunning = !prefersReducedMotion;
let heaterOn = true;
let elapsed = 0;
let circulationStrength = 0;
let lastFrame = performance.now();
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();
const projectionScratch = new THREE.Vector3();

function currentHeat() {
  return heaterOn ? Number(heatPower.value) / 100 : 0;
}

function updateHeaterControls() {
  heaterOnBtn.classList.toggle('active', heaterOn);
  heaterOffBtn.classList.toggle('active', !heaterOn);
  heaterOnBtn.setAttribute('aria-pressed', String(heaterOn));
  heaterOffBtn.setAttribute('aria-pressed', String(!heaterOn));
}

function formatHeaterPosition(x) {
  if (Math.abs(x) < 0.08) return 'Centre';
  return `${x < 0 ? 'Left' : 'Right'} ${Math.abs(x).toFixed(1)}`;
}

function setHeaterX(x, { syncSlider = true } = {}) {
  heaterX = THREE.MathUtils.clamp(x, -HEATER_X_LIMIT, HEATER_X_LIMIT);
  heaterPlate.position.x = heaterX;
  heaterPadTop.position.x = heaterX;
  heaterLight.position.x = heaterX;
  heatCone.position.x = heaterX;
  heatHalo.position.x = heaterX;

  if (syncSlider) heaterPosition.value = heaterX.toFixed(2);
  heaterPositionValue.textContent = formatHeaterPosition(heaterX);

  updateSamplePositions();
  if (densityToggle.checked) {
      }
}

function seededNoise(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function stratifiedPositions(count) {
  const width = BOUNDS.xMax - BOUNDS.xMin;
  const height = BOUNDS.yMax - BOUNDS.yMin;
  const depth = BOUNDS.zMax - BOUNDS.zMin;
  const spacing = Math.cbrt((width * height * depth) / count);
  const nx = Math.max(1, Math.ceil(width / spacing));
  const ny = Math.max(1, Math.ceil(height / spacing));
  const nz = Math.max(1, Math.ceil(depth / spacing));
  const cells = [];

  for (let ix = 0; ix < nx; ix++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let iz = 0; iz < nz; iz++) cells.push([ix, iy, iz]);
    }
  }
  shuffle(cells);

  const cellW = width / nx;
  const cellH = height / ny;
  const cellD = depth / nz;
  const jitterFraction = 0.24;

  return cells.slice(0, count).map(([ix, iy, iz]) => ({
    x: BOUNDS.xMin + (ix + 0.5 + (Math.random() - 0.5) * jitterFraction) * cellW,
    y: BOUNDS.yMin + (iy + 0.5 + (Math.random() - 0.5) * jitterFraction) * cellH,
    z: BOUNDS.zMin + (iz + 0.5 + (Math.random() - 0.5) * jitterFraction) * cellD,
  }));
}

function randomUnitVector() {
  const y = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
}

function targetMicroscopicSpeed(temp = 0) {
  const slider = Number(particleSpeed.value);
  // Cooler parcels move a little more slowly; warmer parcels have more vigorous
  // microscopic motion. The 1× setting preserves the lively V4 baseline.
  return (0.32 + temp * 0.17) * slider;
}

function makeParticles(count) {
  if (particleMesh) scene.remove(particleMesh);

  particleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
  });
  particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, count);
  particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(particleMesh);

  const positions = stratifiedPositions(count);
  particles = positions.map((pos) => {
    const dir = randomUnitVector();
    const speed = targetMicroscopicSpeed(0) * THREE.MathUtils.lerp(0.82, 1.18, Math.random());
    return {
      ...pos,
      vx: dir.x * speed,
      vy: dir.y * speed,
      vz: dir.z * speed * DEPTH_MOTION_SCALE,
      temp: 0,
      seed: Math.random() * 1000,
    };
  });

  updateParticleInstances();
}

function flowField(x, y, z, strength) {
  // V9: broadened closed circulation cell. The overall strength is raised by
  // 20% in updateParticles(); the larger radius keeps the whole liquid involved
  // when the heater is moved towards either side of the tank.
  const dx = x - heaterX;
  const dz = z - heaterZ;
  const r = Math.hypot(dx, dz);
  const ux = r > 1e-5 ? dx / r : 0;
  const uz = r > 1e-5 ? dz / r : 0;
  const H = SURFACE_Y - BOUNDS.yMin;
  const h = THREE.MathUtils.clamp((y - BOUNDS.yMin) / H, 0, 1);

  const circulationRadius = 3.45;
  const q = Math.pow(r / circulationRadius, 2.6);
  const envelope = Math.exp(-q);

  // Bottom: flow moves towards the heater. Surface: flow spreads away.
  const radial = -strength * 0.30 * r * envelope * Math.cos(Math.PI * h);

  // Upward in the plume, downward through the broader outer return region.
  const radialFraction = r / circulationRadius;
  const verticalShape = 1.18 - 2.65 * radialFraction * radialFraction;
  const vertical = strength * 0.19 * envelope * verticalShape * Math.sin(Math.PI * h);

  return {
    x: ux * radial,
    y: vertical,
    z: uz * radial * DEPTH_MOTION_SCALE,
  };
}

function applyLiquidPressure(dt) {
  // A weak coarse-grained pressure/continuity correction. Earlier builds could create
  // conspicuous empty patches because particles only repelled on contact.
  // Here, over-populated cells gently feed neighbouring under-populated cells.
  // Hot cells count as effectively more crowded, preserving the schematic
  // lower density of warmer liquid without allowing cool regions to become voids.
  const cellSize = 0.58;
  const grid = new Map();
  const key = (ix, iy, iz) => `${ix}|${iy}|${iz}`;

  for (const p of particles) {
    const ix = Math.floor((p.x - BOUNDS.xMin) / cellSize);
    const iy = Math.floor((p.y - BOUNDS.yMin) / cellSize);
    const iz = Math.floor((p.z - BOUNDS.zMin) / cellSize);
    p._pressureCell = [ix, iy, iz];
    const k = key(ix, iy, iz);
    let cell = grid.get(k);
    if (!cell) {
      cell = { count: 0, temp: 0 };
      grid.set(k, cell);
    }
    cell.count += 1;
    cell.temp += p.temp;
  }

  const effectiveOccupancy = (ix, iy, iz) => {
    const cell = grid.get(key(ix, iy, iz));
    if (!cell) return 0;
    const meanTemp = cell.temp / cell.count;
    return cell.count * (1 + 0.62 * meanTemp);
  };

  const pressureStrength = 0.118;
  for (const p of particles) {
    const [ix, iy, iz] = p._pressureCell;
    const left = effectiveOccupancy(ix - 1, iy, iz);
    const right = effectiveOccupancy(ix + 1, iy, iz);
    const below = effectiveOccupancy(ix, iy - 1, iz);
    const above = effectiveOccupancy(ix, iy + 1, iz);
    const back = effectiveOccupancy(ix, iy, iz - 1);
    const front = effectiveOccupancy(ix, iy, iz + 1);

    // Move from locally crowded regions towards sparser neighbours. Vertical
    // smoothing is deliberately weaker so buoyancy/settling remains visible.
    p.vx += (left - right) * pressureStrength * dt;
    p.vy += (below - above) * pressureStrength * 0.34 * dt;
    p.vz += (back - front) * pressureStrength * DEPTH_MOTION_SCALE * dt;
  }
}

function resetSimulation() {
  elapsed = 0;
  circulationStrength = 0;
  makeParticles(Number(particleCount.value));
  explainText.textContent = 'The liquid above the heater gains energy, spreads slightly and rises. Follow it as it loses energy away from the heater, slows, becomes more closely packed and joins the sinking return flow.';
}

function applySoftWallForces(p, dt) {
  // V9: a wider soft boundary layer turns the flow before it reaches the glass.
  // When a hot plume is close to a side wall, outward motion is redirected
  // downwards/inwards instead of allowing particles to pile up on the wall.
  const xMargin = 0.42;
  const zMargin = 0.24;
  const bottomMargin = 0.14;
  const wallK = 7.2;
  const depthWallK = 8.4;

  const leftDepth = THREE.MathUtils.clamp((BOUNDS.xMin + xMargin - p.x) / xMargin, 0, 1);
  const rightDepth = THREE.MathUtils.clamp((p.x - (BOUNDS.xMax - xMargin)) / xMargin, 0, 1);

  if (leftDepth > 0) {
    p.vx += wallK * leftDepth * leftDepth * dt;
    if (p.vx < 0) p.vx *= Math.pow(0.18, dt);
    p.vy -= (0.28 + 0.25 * p.temp) * leftDepth * dt;
  }
  if (rightDepth > 0) {
    p.vx -= wallK * rightDepth * rightDepth * dt;
    if (p.vx > 0) p.vx *= Math.pow(0.18, dt);
    p.vy -= (0.28 + 0.25 * p.temp) * rightDepth * dt;
  }

  if (p.z < BOUNDS.zMin + zMargin) p.vz += depthWallK * (BOUNDS.zMin + zMargin - p.z) * dt;
  if (p.z > BOUNDS.zMax - zMargin) p.vz -= depthWallK * (p.z - (BOUNDS.zMax - zMargin)) * dt;
  if (p.y < BOUNDS.yMin + bottomMargin) p.vy += wallK * (BOUNDS.yMin + bottomMargin - p.y) * dt;
}

function confineParticle(p) {
  // Hard limits are only numerical fail-safes. The soft wall force above does
  // most of the turning, so particles should not sit pinned against the glass.
  const bounce = 0.72;
  const inset = 0.004;
  const tangentialNudge = 0.025;

  if (p.x < BOUNDS.xMin) {
    p.x = BOUNDS.xMin + inset;
    p.vx = Math.abs(p.vx) * bounce;
    p.vy += Math.sin(p.seed + elapsed * 2.1) * tangentialNudge;
  }
  if (p.x > BOUNDS.xMax) {
    p.x = BOUNDS.xMax - inset;
    p.vx = -Math.abs(p.vx) * bounce;
    p.vy += Math.cos(p.seed + elapsed * 2.0) * tangentialNudge;
  }
  if (p.y < BOUNDS.yMin) {
    p.y = BOUNDS.yMin + inset;
    p.vy = Math.abs(p.vy) * 0.76;
    p.vx += Math.sin(p.seed + elapsed * 1.7) * tangentialNudge;
  }
  if (p.z < BOUNDS.zMin) {
    p.z = BOUNDS.zMin + inset;
    p.vz = Math.abs(p.vz) * 0.62;
    p.vx += Math.sin(p.seed + elapsed * 2.4) * tangentialNudge;
  }
  if (p.z > BOUNDS.zMax) {
    p.z = BOUNDS.zMax - inset;
    p.vz = -Math.abs(p.vz) * 0.62;
    p.vx += Math.cos(p.seed + elapsed * 2.4) * tangentialNudge;
  }

  // The water surface is deliberately NOT a wall. Particles are allowed to
  // overshoot it and are returned by a soft surface-tension force in
  // updateParticles(). The ceiling remains only a distant numerical failsafe.
  const glassSafetyCeiling = TANK.height - 0.22;
  if (p.y > glassSafetyCeiling) {
    p.y = glassSafetyCeiling;
    p.vy = Math.min(p.vy, 0);
  }
}

function resolveParticleCollisions() {
  const cellSize = MAX_COLLISION_DISTANCE * 1.05;
  const grid = new Map();
  const keyFor = (x, y, z) => `${x}|${y}|${z}`;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const cx = Math.floor((p.x - BOUNDS.xMin) / cellSize);
    const cy = Math.floor((p.y - BOUNDS.yMin) / cellSize);
    const cz = Math.floor((p.z - BOUNDS.zMin) / cellSize);
    p._cell = [cx, cy, cz];
    const key = keyFor(cx, cy, cz);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(i);
  }

  const restitution = 0.94;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const [cx, cy, cz] = p._cell;
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        for (let oz = -1; oz <= 1; oz++) {
          const neighbours = grid.get(keyFor(cx + ox, cy + oy, cz + oz));
          if (!neighbours) continue;
          for (const j of neighbours) {
            if (j <= i) continue;
            const q = particles[j];
            let dx = q.x - p.x;
            let dy = q.y - p.y;
            let dz = q.z - p.z;
            const dist2 = dx * dx + dy * dy + dz * dz;
            const thermalSpacing = 1 + 0.72 * ((p.temp + q.temp) * 0.5);
            const pairDistance = BASE_COLLISION_DISTANCE * thermalSpacing;
            const minDist2 = pairDistance * pairDistance;
            if (dist2 <= 1e-10 || dist2 >= minDist2) continue;

            const dist = Math.sqrt(dist2);
            dx /= dist; dy /= dist; dz /= dist;
            const overlap = pairDistance - dist;
            const separation = overlap * 0.505;
            p.x -= dx * separation; p.y -= dy * separation; p.z -= dz * separation;
            q.x += dx * separation; q.y += dy * separation; q.z += dz * separation;

            const relativeNormalSpeed = (q.vx - p.vx) * dx + (q.vy - p.vy) * dy + (q.vz - p.vz) * dz;
            if (relativeNormalSpeed < 0) {
              const impulse = -(1 + restitution) * relativeNormalSpeed * 0.5;
              p.vx -= impulse * dx; p.vy -= impulse * dy; p.vz -= impulse * dz;
              q.vx += impulse * dx; q.vy += impulse * dy; q.vz += impulse * dz;
            }
          }
        }
      }
    }
  }

  for (const p of particles) confineParticle(p);
}

function updateParticles(dt) {
  const heat = currentHeat();
  const targetCirculation = heat * 0.82 * Math.min(1, elapsed / 5.0);
  circulationStrength += (targetCirculation - circulationStrength) * Math.min(1, dt * 0.55);

  heaterLight.intensity = heaterOn ? 0.25 + heat * 5.1 : 0.0;
  coilMaterial.emissiveIntensity = heaterOn ? 0.35 + heat * 4.3 : 0.05;
  coilMaterial.color.setHex(heaterOn ? 0xa63f2d : 0x4d555a);

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const r2 = dx * dx + dz * dz;
    const r = Math.sqrt(r2);

    // Small circular induction-style pad: heating is concentrated directly above it.
    const radialHeat = Math.exp(-r2 / Math.pow(HEAT_EFFECT_RADIUS, 2));
    const verticalHeat = Math.exp(-Math.pow((p.y - 0.32) / 0.48, 2));
    const heaterProximity = radialHeat * verticalHeat;

    // Stronger local energy gain, followed by gradual loss away from the source.
    p.temp += heaterProximity * heat * 6.2 * dt;
    // Energy is lost gradually away from the heater. The loss is stronger in
    // upper/outlying regions, so cooler parcels visibly slow before settling.
    const awayFromHeater = THREE.MathUtils.clamp((r - HEATER_RADIUS) / 2.2, 0, 1);
    p.temp -= p.temp * (0.050 + 0.026 * Math.max(0, p.y - 1.9) + 0.025 * awayFromHeater) * dt;
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Microscopic particle motion stays lively at 1× and remains distinct from bulk flow.
    const kickStrength = 0.34 + p.temp * 0.25;
    const kx = Math.sin(elapsed * 4.7 + p.seed * 1.19) + Math.sin(elapsed * 7.1 + p.seed * 0.37) * 0.45;
    const ky = Math.cos(elapsed * 5.3 + p.seed * 0.83) + Math.sin(elapsed * 8.4 + p.seed * 0.23) * 0.42;
    const kz = Math.sin(elapsed * 5.9 + p.seed * 0.61) + Math.cos(elapsed * 7.8 + p.seed * 0.71) * 0.45;
    p.vx += kx * kickStrength * dt;
    p.vy += ky * kickStrength * dt;
    p.vz += kz * kickStrength * DEPTH_MOTION_SCALE * dt;

    const currentSpeed = Math.hypot(p.vx, p.vy, p.vz) || 1e-6;
    const targetSpeed = targetMicroscopicSpeed(p.temp);
    const speedCorrection = (targetSpeed - currentSpeed) * Math.min(1, dt * 2.0);
    p.vx += (p.vx / currentSpeed) * speedCorrection;
    p.vy += (p.vy / currentSpeed) * speedCorrection;
    p.vz += (p.vz / currentSpeed) * speedCorrection;

    const field = flowField(p.x, p.y, p.z, circulationStrength);

    // Near a side wall, turn any outward bulk-flow component downward and back
    // into the vessel. This stops the edge-position heater from creating a
    // stationary vertical column of particles against the glass.
    const wallTurnRange = 0.78;
    const leftTurn = THREE.MathUtils.clamp((BOUNDS.xMin + wallTurnRange - p.x) / wallTurnRange, 0, 1);
    const rightTurn = THREE.MathUtils.clamp((p.x - (BOUNDS.xMax - wallTurnRange)) / wallTurnRange, 0, 1);
    if (leftTurn > 0 && field.x < 0) {
      const outward = -field.x * leftTurn;
      field.x += outward * 0.94;
      field.y -= outward * 0.72;
    }
    if (rightTurn > 0 && field.x > 0) {
      const outward = field.x * rightTurn;
      field.x -= outward * 0.94;
      field.y -= outward * 0.72;
    }

    // Temperature now drives the visible bulk motion more than the background
    // circulation field. Hotter parcels rise; as they lose energy they slow,
    // become more closely packed, and a weak density-driven settling term lets
    // the relatively cooler return flow descend gradually.
    const plumeEnvelope = Math.exp(-r2 / 1.05);
    const buoyancyDrift = p.temp * (0.72 + 0.48 * plumeEnvelope);
    const coolFraction = 1 - p.temp;
    const returnRegion = THREE.MathUtils.smoothstep(r, 1.0, 2.9);
    const settlingDrift = -circulationStrength * 0.285 * coolFraction * returnRegion;

    let expansionX = 0;
    let expansionZ = 0;
    if (r > 1e-4) {
      // Schematic thermal expansion: the warmer plume spreads laterally,
      // lowering the number of representative particles per equal volume.
      const expansion = p.temp * 0.60 * Math.exp(-r2 / 0.92);
      expansionX = (dx / r) * expansion;
      expansionZ = (dz / r) * expansion * DEPTH_MOTION_SCALE;
    }

    // Soft free surface / schematic surface tension. There is no reflective
    // boundary at SURFACE_Y: particles can emerge above the waterline. Once
    // above it, a spring-like restoring acceleration curves them smoothly back
    // into the liquid, with damping that prevents a hard bounce.
    if (p.y > SURFACE_Y) {
      const excess = p.y - SURFACE_Y;
      const restoringAcceleration = -2.7 * excess;
      const upwardDamping = p.vy > 0 ? -1.15 * p.vy : 0;
      p.vy += (restoringAcceleration + upwardDamping) * dt;
    }

    // A local pulsating lift lets the hottest plume visibly dimple/bubble above
    // the nominal surface before surface tension returns it.
    const nearSurface = Math.exp(-Math.pow((p.y - SURFACE_Y) / 0.42, 2));
    const bubbleLift = heat * radialHeat * nearSurface *
      (0.85 + 0.35 * Math.sin(elapsed * 6.4 + p.seed)) * (0.35 + 0.65 * p.temp);

    applySoftWallForces(p, dt);

    p.x += (p.vx + field.x + expansionX) * dt;
    p.y += (p.vy + field.y + buoyancyDrift + settlingDrift + bubbleLift) * dt;
    p.z += (p.vz + field.z + expansionZ) * dt;
    confineParticle(p);
  }

  resolveParticleCollisions();
  applyLiquidPressure(dt);
  updateParticleInstances();
}

function updateParticleInstances() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    dummy.position.set(p.x, p.y, p.z);
    const pulse = 0.97 + 0.08 * p.temp;
    dummy.scale.setScalar(pulse);
    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);

    if (temperatureToggle.checked) {
      tempColor.copy(ambientColor).lerp(warmColor, THREE.MathUtils.smoothstep(p.temp, 0.02, 0.78));
      particleMesh.setColorAt(i, tempColor);
    } else {
      particleMesh.setColorAt(i, neutralColor);
    }
  }
  particleMesh.instanceMatrix.needsUpdate = true;
  if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;
}


const sampleGroup = new THREE.Group();
scene.add(sampleGroup);
const sampleBox = { width: 1.65, height: 1.40, depth: 1.08 };
const sampleCubeSize = sampleBox.width;
const warmSamplePos = new THREE.Vector3(heaterX, 1.68, 0);
const coolSamplePos = new THREE.Vector3(3.25, 0.92, 0);
let coolSampleSide = 1;

function makeSampleCube(position, color) {
  const group = new THREE.Group();
  const cube = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(sampleBox.width, sampleBox.height, sampleBox.depth)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.98 })
  );
  group.add(cube);
  group.position.copy(position);
  return group;
}

const warmCube = makeSampleCube(warmSamplePos, 0xef795f);
const coolCube = makeSampleCube(coolSamplePos, 0x5e9fd4);
sampleGroup.add(warmCube, coolCube);

function updateSamplePositions() {
  const half = sampleBox.width / 2;
  const safeWarmX = THREE.MathUtils.clamp(heaterX, BOUNDS.xMin + half + 0.08, BOUNDS.xMax - half - 0.08);
  warmSamplePos.set(safeWarmX, 1.68, 0);

  // Keep the cooler sample well away from the heater. Near the middle we retain
  // the previous side rather than allowing the two equal volumes to converge.
  if (heaterX > 0.32) coolSampleSide = -1;
  else if (heaterX < -0.32) coolSampleSide = 1;

  const coolX = coolSampleSide * (BOUNDS.xMax - half - 0.28);
  coolSamplePos.set(coolX, 0.92, 0);

  warmCube.position.copy(warmSamplePos);
  coolCube.position.copy(coolSamplePos);
}

function syncDensityUi() {
  const compareOn = densityToggle.checked;
  sampleGroup.visible = compareOn;
  warmCube.visible = true;
  coolCube.visible = true;
  densityPanel.hidden = !compareOn;
}

function updateNarration() {
  if (walkthroughActive) return;
  if (elapsed < 5) {
    explainText.textContent = 'Above the heater, particles gain energy: their microscopic motion becomes more vigorous, the liquid expands slightly and the warmer region rises.';
  } else if (elapsed < 14) {
    explainText.textContent = 'Away from the heater, the rising liquid gradually loses energy. Its particles move less vigorously and become slightly more closely packed as the liquid becomes relatively cooler and denser.';
  } else {
    explainText.textContent = 'The relatively cooler, denser liquid sinks and returns underneath. The bulk circulation is deliberately slower than the random particle motion.';
  }
}


let walkthroughActive = false;
let walkthroughStep = -1;
let walkthroughTimer = null;
let cameraTween = null;
let walkthroughSavedState = null;

const WALKTHROUGH_STEP_MS = 5600;
const WALKTHROUGH_CAMERA_MS = 1750;

const walkthroughSteps = [
  {
    title: 'Particles gain kinetic energy',
    text: 'Particles nearest the heater gain energy first. Their random motion becomes more vigorous, so their average kinetic energy increases.',
    view: () => ({
      position: new THREE.Vector3(heaterX + 2.9, 2.05, 2.65),
      target: new THREE.Vector3(heaterX, 0.58, 0),
    }),
    overlay: 'none',
  },
  {
    title: 'The heated liquid expands',
    text: 'The warmed liquid expands slightly, so its particles are on average a little farther apart. An equal volume therefore contains less mass: the warmer liquid is less dense.',
    view: () => ({
      position: new THREE.Vector3(heaterX + 3.7, 2.75, 3.15),
      target: new THREE.Vector3(heaterX, 1.48, 0),
    }),
    overlay: 'warm-volume',
  },
  {
    title: 'Warmer, less-dense liquid rises',
    text: 'The warmer, less-dense liquid rises through the surrounding liquid. As it travels away from the heater it transfers energy to its surroundings.',
    view: () => ({
      position: new THREE.Vector3(heaterX + 4.3, 3.35, 3.55),
      target: new THREE.Vector3(heaterX, 2.48, 0),
    }),
    overlay: 'warm-volume',
  },
  {
    title: 'Cooler, denser liquid sinks',
    text: 'Away from the heater, the liquid transfers energy to its surroundings. Its particles move less vigorously and become more closely packed; the cooler, denser liquid sinks and returns underneath, completing the convection current.',
    view: () => ({
      position: new THREE.Vector3(11.4, 5.5, 7.4),
      target: new THREE.Vector3(0, 1.55, 0),
    }),
    overlay: 'both-volumes',
  },
];

function startCameraTween(position, target, duration = WALKTHROUGH_CAMERA_MS) {
  if (prefersReducedMotion) {
    camera.position.copy(position);
    controls.target.copy(target);
    cameraTween = null;
    return;
  }
  cameraTween = {
    start: performance.now(),
    duration,
    fromPosition: camera.position.clone(),
    toPosition: position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
  };
}

function updateCameraTween(now) {
  if (!cameraTween) return;
  const raw = THREE.MathUtils.clamp((now - cameraTween.start) / cameraTween.duration, 0, 1);
  const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
  camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, eased);
  controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
  if (raw >= 1) cameraTween = null;
}

function setWalkthroughOverlay(mode) {
  if (mode === 'none') {
    sampleGroup.visible = false;
  } else if (mode === 'warm-volume') {
    sampleGroup.visible = true;
    warmCube.visible = true;
    coolCube.visible = false;
  } else {
    sampleGroup.visible = true;
    warmCube.visible = true;
    coolCube.visible = true;
  }
}

function enterWalkthroughStep(index) {
  if (!walkthroughActive) return;
  walkthroughStep = THREE.MathUtils.clamp(index, 0, walkthroughSteps.length - 1);
  const step = walkthroughSteps[walkthroughStep];
  const view = step.view();

  walkthroughBanner.hidden = false;
  walkthroughStepLabel.textContent = `Step ${walkthroughStep + 1} of ${walkthroughSteps.length}`;
  walkthroughTitle.textContent = step.title;
  walkthroughText.textContent = step.text;
  walkthroughDots.forEach((dot, i) => dot.classList.toggle('active', i === walkthroughStep));
  setWalkthroughOverlay(step.overlay);
  startCameraTween(view.position, view.target);

  clearTimeout(walkthroughTimer);
  if (walkthroughStep < walkthroughSteps.length - 1) {
    walkthroughTimer = setTimeout(() => enterWalkthroughStep(walkthroughStep + 1), WALKTHROUGH_STEP_MS);
  } else {
    walkthroughTimer = setTimeout(() => finishWalkthrough(false), WALKTHROUGH_STEP_MS + 600);
  }
}

function startWalkthrough() {
  if (walkthroughActive) return;
  walkthroughSavedState = {
    density: densityToggle.checked,
    temperature: temperatureToggle.checked,
    cameraPosition: camera.position.clone(),
    cameraTarget: controls.target.clone(),
  };

  walkthroughActive = true;
  walkthroughBtn.disabled = true;
  walkthroughStopBtn.disabled = false;
  controls.enabled = false;
  heaterOn = true;
  updateHeaterControls();
  if (!isRunning) {
    isRunning = true;
    updateStatus();
  }
  temperatureToggle.checked = true;
  document.querySelector('#legend').style.opacity = '1';
  updateParticleInstances();
  enterWalkthroughStep(0);
}

function finishWalkthrough(restoreView = false) {
  if (!walkthroughActive) return;
  walkthroughActive = false;
  clearTimeout(walkthroughTimer);
  walkthroughTimer = null;
  cameraTween = null;
  walkthroughBtn.disabled = false;
  walkthroughStopBtn.disabled = true;
  controls.enabled = true;
  walkthroughBanner.hidden = true;
  walkthroughDots.forEach(dot => dot.classList.remove('active'));

  if (walkthroughSavedState) {
    densityToggle.checked = walkthroughSavedState.density;
    temperatureToggle.checked = walkthroughSavedState.temperature;
    warmCube.visible = true;
    coolCube.visible = true;
    syncDensityUi();
    updateParticleInstances();
    document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';

    if (restoreView) {
      startCameraTween(walkthroughSavedState.cameraPosition, walkthroughSavedState.cameraTarget, 900);
    }
  }
  walkthroughSavedState = null;
  explainText.textContent = 'The liquid above the heater gains energy, expands slightly and rises. Away from the heater it loses energy, becomes relatively cooler and denser, then sinks to complete the convection current.';
}

function updateStatus() {
  runPauseBtn.textContent = isRunning ? 'Pause' : 'Run';
  statusText.textContent = isRunning ? 'Running' : 'Paused';
  statusDot.classList.toggle('paused', !isRunning);
}

// Direct manipulation: drag the circular heater left/right along the base.
// The slider below remains as an accessible non-drag alternative.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const heaterDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.10);
const heaterDragPoint = new THREE.Vector3();
let draggingHeater = false;

function pointerToNdc(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (walkthroughActive) return;
  pointerToNdc(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([heaterPadTop, heaterPlate], false);
  if (!hits.length) return;
  draggingHeater = true;
  controls.enabled = false;
  renderer.domElement.setPointerCapture?.(event.pointerId);
  renderer.domElement.style.cursor = 'grabbing';
});

renderer.domElement.addEventListener('pointermove', (event) => {
  if (walkthroughActive) return;
  pointerToNdc(event);

  if (!draggingHeater) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([heaterPadTop, heaterPlate], false);
    renderer.domElement.style.cursor = hits.length ? 'grab' : '';
    return;
  }

  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(heaterDragPlane, heaterDragPoint)) {
    setHeaterX(heaterDragPoint.x);
  }
});

function endHeaterDrag(event) {
  if (!draggingHeater) return;
  draggingHeater = false;
  controls.enabled = true;
  renderer.domElement.releasePointerCapture?.(event.pointerId);
  renderer.domElement.style.cursor = '';
}

renderer.domElement.addEventListener('pointerup', endHeaterDrag);
renderer.domElement.addEventListener('pointercancel', endHeaterDrag);

runPauseBtn.addEventListener('click', () => {
  isRunning = !isRunning;
  updateStatus();
});

resetBtn.addEventListener('click', resetSimulation);

heaterOnBtn.addEventListener('click', () => {
  heaterOn = true;
  updateHeaterControls();
});

heaterOffBtn.addEventListener('click', () => {
  heaterOn = false;
  updateHeaterControls();
});

heatPower.addEventListener('input', () => {
  heatPowerValue.textContent = `${heatPower.value}%`;
});

heaterPosition.addEventListener('input', () => {
  setHeaterX(Number(heaterPosition.value), { syncSlider: false });
});

particleCount.addEventListener('input', () => {
  particleCountValue.textContent = particleCount.value;
});
particleCount.addEventListener('change', () => {
  makeParticles(Number(particleCount.value));
});

particleSpeed.addEventListener('input', () => {
  particleSpeedValue.textContent = `${Number(particleSpeed.value).toFixed(1)}×`;
});

temperatureToggle.addEventListener('change', () => {
  document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';
  updateParticleInstances();
});

densityToggle.addEventListener('change', syncDensityUi);

walkthroughBtn.addEventListener('click', startWalkthrough);
walkthroughStopBtn.addEventListener('click', () => finishWalkthrough(true));

function resizeRenderer() {
  const { width, height } = sceneHost.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(sceneHost);
resizeRenderer();

function animate(now) {
  const rawDt = (now - lastFrame) / 1000;
  lastFrame = now;
  const dt = Math.min(rawDt, 0.035);

  if (isRunning) {
    elapsed += dt;
    updateParticles(dt);
    updateNarration();
  }

  const heat = currentHeat();
  heaterLight.intensity = heaterOn ? 0.20 + heat * (4.3 + Math.sin(elapsed * 3.2) * 0.22) : 0;
  heatConeMaterial.uniforms.uPower.value = heaterOn ? heat : 0;
  heatHaloMaterial.uniforms.uPower.value = heaterOn ? heat : 0;
  heatCueGroup.visible = heaterOn && heat > 0.01;

  updateCameraTween(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

makeParticles(Number(particleCount.value));
updateSamplePositions();
setHeaterX(heaterX);
updateStatus();
updateHeaterControls();
syncDensityUi();
requestAnimationFrame(animate);
