import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneHost = document.querySelector('#scene');
const runPauseBtn = document.querySelector('#runPauseBtn');
const resetBtn = document.querySelector('#resetBtn');
const heaterOnBtn = document.querySelector('#heaterOnBtn');
const heaterOffBtn = document.querySelector('#heaterOffBtn');
const heatPower = document.querySelector('#heatPower');
const heatPowerValue = document.querySelector('#heatPowerValue');
const particleCount = document.querySelector('#particleCount');
const particleCountValue = document.querySelector('#particleCountValue');
const particleSpeed = document.querySelector('#particleSpeed');
const particleSpeedValue = document.querySelector('#particleSpeedValue');
const temperatureToggle = document.querySelector('#temperatureToggle');
const flowToggle = document.querySelector('#flowToggle');
const densityToggle = document.querySelector('#densityToggle');
const densityPanel = document.querySelector('#densityPanel');
const warmCount = document.querySelector('#warmCount');
const coolCount = document.querySelector('#coolCount');
const warmDensity = document.querySelector('#warmDensity');
const coolDensity = document.querySelector('#coolDensity');
const warmCounter3d = document.querySelector('#warmCounter3d');
const coolCounter3d = document.querySelector('#coolCounter3d');
const warmCounter3dValue = document.querySelector('#warmCounter3dValue');
const coolCounter3dValue = document.querySelector('#coolCounter3dValue');
const statusDot = document.querySelector('#statusDot');
const statusText = document.querySelector('#statusText');
const explainText = document.querySelector('#explainText');

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
camera.position.set(11.6, 8.8, 12.6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3.0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb2bf, 2.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
scene.add(keyLight);

const TANK = { width: 8, height: 7.2, depth: 5.2 };
const BOUNDS = {
  xMin: -TANK.width / 2 + 0.18,
  xMax: TANK.width / 2 - 0.18,
  yMin: 0.18,
  yMax: 4.45,
  zMin: -TANK.depth / 2 + 0.18,
  zMax: TANK.depth / 2 - 0.18,
};
const heaterX = -1.75;
const heaterZ = 0;
const HEATER_RADIUS = 0.46;
const SURFACE_Y = 4.55;
const MAX_SURFACE_RISE = 0.95;

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
let densityAccumulator = 0;
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
  return (0.34 + temp * 0.10) * slider;
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
      vz: dir.z * speed,
      temp: 0,
      seed: Math.random() * 1000,
    };
  });

  updateParticleInstances();
}

function flowField(x, y, z, strength) {
  // Smooth axisymmetric circulation derived from a streamfunction-like model.
  // It produces a closed convection cell: inward along the bottom, upward above
  // the heater, outward near the free surface, then downward farther away.
  const dx = x - heaterX;
  const dz = z - heaterZ;
  const r = Math.hypot(dx, dz);
  const ux = r > 1e-5 ? dx / r : 0;
  const uz = r > 1e-5 ? dz / r : 0;
  const H = SURFACE_Y - BOUNDS.yMin;
  const h = THREE.MathUtils.clamp((y - BOUNDS.yMin) / H, 0, 1);

  const circulationRadius = 1.95;
  const q = Math.pow(r / circulationRadius, 4);
  const envelope = Math.exp(-q);

  // Radial flow changes sign halfway up: inward below, outward above.
  const radial = -strength * r * envelope * (Math.PI / H) * Math.cos(Math.PI * h);

  // Vertical flow is upward in the central plume and downward in a surrounding ring.
  const vertical = strength * envelope * (2 - 4 * q) * Math.sin(Math.PI * h);

  return {
    x: ux * radial,
    y: vertical,
    z: uz * radial,
  };
}

function resetSimulation() {
  elapsed = 0;
  circulationStrength = 0;
  densityAccumulator = 0;
  makeParticles(Number(particleCount.value));
  updateDensitySamples();
  updateFlowArrows();
  explainText.textContent = 'The liquid directly above the heater gains energy first. A warm plume should gradually develop rather than appearing instantly.';
}

function confineParticle(p) {
  const bounce = 0.96;
  if (p.x < BOUNDS.xMin) { p.x = BOUNDS.xMin; p.vx = Math.abs(p.vx) * bounce; }
  if (p.x > BOUNDS.xMax) { p.x = BOUNDS.xMax; p.vx = -Math.abs(p.vx) * bounce; }
  if (p.y < BOUNDS.yMin) { p.y = BOUNDS.yMin; p.vy = Math.abs(p.vy) * bounce; }
  if (p.z < BOUNDS.zMin) { p.z = BOUNDS.zMin; p.vz = Math.abs(p.vz) * bounce; }
  if (p.z > BOUNDS.zMax) { p.z = BOUNDS.zMax; p.vz = -Math.abs(p.vz) * bounce; }

  // The water surface is deliberately NOT a wall. Particles are allowed to
  // overshoot it and are returned by a soft surface-tension force in
  // updateParticles(). This distant guard is only a numerical failsafe near
  // the open top of the much taller glass vessel.
  const glassSafetyCeiling = TANK.height - 0.30;
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
  const targetCirculation = heat * 1.65 * Math.min(1, elapsed / 3.2);
  circulationStrength += (targetCirculation - circulationStrength) * Math.min(1, dt * 0.90);

  heaterLight.intensity = heaterOn ? 0.25 + heat * 5.1 : 0.0;
  coilMaterial.emissiveIntensity = heaterOn ? 0.35 + heat * 4.3 : 0.05;
  coilMaterial.color.setHex(heaterOn ? 0xa63f2d : 0x4d555a);

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const r2 = dx * dx + dz * dz;
    const r = Math.sqrt(r2);

    // Small circular induction-style pad: heating is concentrated directly above it.
    const radialHeat = Math.exp(-r2 / Math.pow(HEATER_RADIUS * 0.88, 2));
    const verticalHeat = Math.exp(-Math.pow((p.y - 0.34) / 0.52, 2));
    const heaterProximity = radialHeat * verticalHeat;

    // Stronger local energy gain, followed by gradual loss away from the source.
    p.temp += heaterProximity * heat * 6.2 * dt;
    p.temp -= p.temp * (0.035 + 0.012 * Math.max(0, p.y - 3.0)) * dt;
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Microscopic particle motion stays lively at 1× and remains distinct from bulk flow.
    const kickStrength = 0.42 + p.temp * 0.16;
    const kx = Math.sin(elapsed * 4.7 + p.seed * 1.19) + Math.sin(elapsed * 7.1 + p.seed * 0.37) * 0.45;
    const ky = Math.cos(elapsed * 5.3 + p.seed * 0.83) + Math.sin(elapsed * 8.4 + p.seed * 0.23) * 0.42;
    const kz = Math.sin(elapsed * 5.9 + p.seed * 0.61) + Math.cos(elapsed * 7.8 + p.seed * 0.71) * 0.45;
    p.vx += kx * kickStrength * dt;
    p.vy += ky * kickStrength * dt;
    p.vz += kz * kickStrength * dt;

    const currentSpeed = Math.hypot(p.vx, p.vy, p.vz) || 1e-6;
    const targetSpeed = targetMicroscopicSpeed(p.temp);
    const speedCorrection = (targetSpeed - currentSpeed) * Math.min(1, dt * 2.4);
    p.vx += (p.vx / currentSpeed) * speedCorrection;
    p.vy += (p.vy / currentSpeed) * speedCorrection;
    p.vz += (p.vz / currentSpeed) * speedCorrection;

    const field = flowField(p.x, p.y, p.z, circulationStrength);

    // Hot particles gain a stronger upward drift and a small lateral expansion
    // of the plume. This gives the warm region a visibly lower particle number
    // density while retaining conservation of the simulation particles overall.
    const buoyancyDrift = p.temp * 0.92;
    let expansionX = 0;
    let expansionZ = 0;
    if (r > 1e-4) {
      const expansion = p.temp * 0.58 * Math.exp(-r2 / 0.90);
      expansionX = (dx / r) * expansion;
      expansionZ = (dz / r) * expansion;
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

    p.x += (p.vx + field.x + expansionX) * dt;
    p.y += (p.vy + field.y + buoyancyDrift + bubbleLift) * dt;
    p.z += (p.vz + field.z + expansionZ) * dt;
    confineParticle(p);
  }

  resolveParticleCollisions();
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

const arrowGroup = new THREE.Group();
scene.add(arrowGroup);
const vectorSamples = [];
let arrowShaftMesh = null;
let arrowHeadMesh = null;
const arrowAxis = new THREE.Vector3(0, 1, 0);
const arrowDirection = new THREE.Vector3();
const arrowOrigin = new THREE.Vector3();
const shaftDummy = new THREE.Object3D();
const headDummy = new THREE.Object3D();

function buildFlowArrows() {
  arrowGroup.clear();
  vectorSamples.length = 0;

  // Dense, regular 3-D vector lattice. The heater lies exactly on the centre
  // x-line so the rising plume and surrounding return flow read clearly.
  const xs = [-3.55, -2.65, -1.75, -0.85, 0.05, 0.95, 1.85, 2.75, 3.55];
  const ys = [0.48, 1.12, 1.76, 2.40, 3.04, 3.68, 4.32, 4.82];
  const zs = [-2.0, -1.0, 0, 1.0, 2.0];

  for (const z of zs) {
    for (const y of ys) {
      for (const x of xs) vectorSamples.push(new THREE.Vector3(x, y, z));
    }
  }

  const shaftGeometry = new THREE.CylinderGeometry(0.012, 0.012, 1, 6);
  const headGeometry = new THREE.ConeGeometry(0.042, 1, 8);
  const shaftMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    vertexColors: true,
  });
  const headMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.76,
    depthWrite: false,
    vertexColors: true,
  });

  arrowShaftMesh = new THREE.InstancedMesh(shaftGeometry, shaftMaterial, vectorSamples.length);
  arrowHeadMesh = new THREE.InstancedMesh(headGeometry, headMaterial, vectorSamples.length);
  arrowShaftMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  arrowHeadMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  arrowShaftMesh.renderOrder = 3;
  arrowHeadMesh.renderOrder = 3;

  const centreColour = new THREE.Color(0x385f72);
  const middleColour = new THREE.Color(0x587d8e);
  const outerColour = new THREE.Color(0x7895a2);
  vectorSamples.forEach((sample, index) => {
    const colour = Math.abs(sample.z) < 0.1 ? centreColour : Math.abs(sample.z) < 1.1 ? middleColour : outerColour;
    arrowShaftMesh.setColorAt(index, colour);
    arrowHeadMesh.setColorAt(index, colour);
  });
  if (arrowShaftMesh.instanceColor) arrowShaftMesh.instanceColor.needsUpdate = true;
  if (arrowHeadMesh.instanceColor) arrowHeadMesh.instanceColor.needsUpdate = true;

  arrowGroup.add(arrowShaftMesh, arrowHeadMesh);
  arrowGroup.visible = flowToggle.checked;
  updateFlowArrows();
}

function updateFlowArrows() {
  if (!flowToggle.checked || !arrowShaftMesh || !arrowHeadMesh) return;

  const displayStrength = Math.max(circulationStrength, currentHeat() * 0.06);
  for (let i = 0; i < vectorSamples.length; i++) {
    const sample = vectorSamples[i];
    const f = flowField(sample.x, sample.y, sample.z, displayStrength);
    arrowDirection.set(f.x, f.y, f.z);
    const magnitude = arrowDirection.length();

    if (magnitude <= 0.010) {
      shaftDummy.position.copy(sample);
      shaftDummy.scale.setScalar(0.0001);
      shaftDummy.updateMatrix();
      headDummy.position.copy(sample);
      headDummy.scale.setScalar(0.0001);
      headDummy.updateMatrix();
      arrowShaftMesh.setMatrixAt(i, shaftDummy.matrix);
      arrowHeadMesh.setMatrixAt(i, headDummy.matrix);
      continue;
    }

    arrowDirection.normalize();
    const length = THREE.MathUtils.clamp(0.14 + magnitude * 0.46, 0.14, 0.72);
    const headLength = THREE.MathUtils.clamp(length * 0.25, 0.065, 0.105);
    const shaftLength = Math.max(0.035, length - headLength);

    shaftDummy.quaternion.setFromUnitVectors(arrowAxis, arrowDirection);
    shaftDummy.position.copy(sample).addScaledVector(arrowDirection, shaftLength * 0.5);
    shaftDummy.scale.set(1, shaftLength, 1);
    shaftDummy.updateMatrix();
    arrowShaftMesh.setMatrixAt(i, shaftDummy.matrix);

    headDummy.quaternion.copy(shaftDummy.quaternion);
    headDummy.position.copy(sample).addScaledVector(arrowDirection, shaftLength + headLength * 0.5);
    headDummy.scale.set(1, headLength, 1);
    headDummy.updateMatrix();
    arrowHeadMesh.setMatrixAt(i, headDummy.matrix);
  }

  arrowShaftMesh.instanceMatrix.needsUpdate = true;
  arrowHeadMesh.instanceMatrix.needsUpdate = true;
}

buildFlowArrows();

const sampleGroup = new THREE.Group();
scene.add(sampleGroup);
const sampleCubeSize = 1.45;
const warmSamplePos = new THREE.Vector3(heaterX, 2.25, 0);
const coolSamplePos = new THREE.Vector3(1.85, 2.25, 0);

function makeSampleCube(position, color) {
  const group = new THREE.Group();
  const cube = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(sampleCubeSize, sampleCubeSize, sampleCubeSize)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.98 })
  );
  group.add(cube);
  group.position.copy(position);
  return group;
}

const warmCube = makeSampleCube(warmSamplePos, 0xef795f);
const coolCube = makeSampleCube(coolSamplePos, 0x5e9fd4);
sampleGroup.add(warmCube, coolCube);

function sampleActualParticles(pos) {
  const half = sampleCubeSize / 2;
  let count = 0;
  let totalTemp = 0;
  for (const p of particles) {
    if (
      Math.abs(p.x - pos.x) <= half &&
      Math.abs(p.y - pos.y) <= half &&
      Math.abs(p.z - pos.z) <= half
    ) {
      count++;
      totalTemp += p.temp;
    }
  }
  return { count, meanTemp: count ? totalTemp / count : 0 };
}

function updateDensitySamples() {
  const warm = sampleActualParticles(warmSamplePos);
  const cool = sampleActualParticles(coolSamplePos);

  const tankVolume = (BOUNDS.xMax - BOUNDS.xMin) * (SURFACE_Y - BOUNDS.yMin) * (BOUNDS.zMax - BOUNDS.zMin);
  const sampleVolume = sampleCubeSize ** 3;
  const nominalCount = Math.max(1, particles.length * sampleVolume / tankVolume);
  const warmRelative = warm.count / nominalCount;
  const coolRelative = cool.count / nominalCount;

  warmCount.textContent = `${warm.count} particles`;
  coolCount.textContent = `${cool.count} particles`;
  warmCounter3dValue.textContent = `${warm.count} particles`;
  coolCounter3dValue.textContent = `${cool.count} particles`;
  warmDensity.textContent = `Mean warmth ${warm.meanTemp.toFixed(2)} · relative particle density ≈ ${warmRelative.toFixed(2)}`;
  coolDensity.textContent = `Mean warmth ${cool.meanTemp.toFixed(2)} · relative particle density ≈ ${coolRelative.toFixed(2)}`;
}

sampleGroup.visible = false;

function projectCounter(element, worldPosition) {
  const { width, height } = sceneHost.getBoundingClientRect();
  projectionScratch.copy(worldPosition).project(camera);
  const visible = projectionScratch.z > -1 && projectionScratch.z < 1;
  element.style.opacity = visible ? '1' : '0';
  if (!visible) return;
  const x = (projectionScratch.x * 0.5 + 0.5) * width;
  const y = (-projectionScratch.y * 0.5 + 0.5) * height;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

function updateSampleCounterPositions() {
  if (!densityToggle.checked) return;
  projectCounter(warmCounter3d, warmSamplePos.clone().add(new THREE.Vector3(0, 0.98, 0)));
  projectCounter(coolCounter3d, coolSamplePos.clone().add(new THREE.Vector3(0, 0.98, 0)));
}

function updateNarration() {
  if (elapsed < 4) {
    explainText.textContent = 'All particles are continuously moving. The liquid directly above the heater gains energy first, so a warm plume develops gradually.';
  } else if (elapsed < 11) {
    explainText.textContent = 'The warmer region rises as a narrow plume. Near the free surface it spreads outward, while relatively cooler liquid sinks elsewhere and returns along the bottom.';
  } else {
    explainText.textContent = 'Watch the warm particles rise together above the heater, spread near the free surface, and be replaced by relatively cooler liquid moving in below. The random microscopic motion continues throughout.';
  }
}

function updateStatus() {
  runPauseBtn.textContent = isRunning ? 'Pause' : 'Run';
  statusText.textContent = isRunning ? 'Running' : 'Paused';
  statusDot.classList.toggle('paused', !isRunning);
}

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

particleCount.addEventListener('input', () => {
  particleCountValue.textContent = particleCount.value;
});
particleCount.addEventListener('change', () => {
  makeParticles(Number(particleCount.value));
  updateDensitySamples();
});

particleSpeed.addEventListener('input', () => {
  particleSpeedValue.textContent = `${Number(particleSpeed.value).toFixed(1)}×`;
});

temperatureToggle.addEventListener('change', () => {
  document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';
  updateParticleInstances();
});

flowToggle.checked = false;
flowToggle.disabled = true;
arrowGroup.visible = false;

densityToggle.addEventListener('change', () => {
  sampleGroup.visible = densityToggle.checked;
  densityPanel.hidden = !densityToggle.checked;
  warmCounter3d.hidden = !densityToggle.checked;
  coolCounter3d.hidden = !densityToggle.checked;
  if (densityToggle.checked) {
    updateDensitySamples();
    updateSampleCounterPositions();
  }
});

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
    densityAccumulator += dt;
    updateParticles(dt);
    updateFlowArrows();
    if (densityToggle.checked) {
      updateDensitySamples();
      densityAccumulator = 0;
    }
    updateNarration();
  }

  const heat = currentHeat();
  heaterLight.intensity = heaterOn ? 0.20 + heat * (4.3 + Math.sin(elapsed * 3.2) * 0.22) : 0;

  controls.update();
  updateSampleCounterPositions();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

makeParticles(Number(particleCount.value));
updateDensitySamples();
updateStatus();
updateHeaterControls();
requestAnimationFrame(animate);
