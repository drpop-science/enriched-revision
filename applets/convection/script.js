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
let heaterX = -1.75;
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

function formatHeaterPosition(x) {
  if (Math.abs(x) < 0.08) return 'Centre';
  return `${x < 0 ? 'Left' : 'Right'} ${Math.abs(x).toFixed(1)}`;
}

function setHeaterX(x, { syncSlider = true } = {}) {
  heaterX = THREE.MathUtils.clamp(x, -2.85, 2.85);
  heaterPlate.position.x = heaterX;
  heaterPadTop.position.x = heaterX;
  heaterLight.position.x = heaterX;

  if (syncSlider) heaterPosition.value = heaterX.toFixed(2);
  heaterPositionValue.textContent = formatHeaterPosition(heaterX);

  updateSamplePositions();
  if (densityToggle.checked) {
    updateDensitySamples();
    updateSampleCounterPositions();
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
      vz: dir.z * speed,
      temp: 0,
      seed: Math.random() * 1000,
    };
  });

  updateParticleInstances();
}

function flowField(x, y, z, strength) {
  // Deliberately gentle bulk return flow. Most upward motion now comes from
  // the actual temperature carried by particles; this field only closes the
  // convection loop slowly enough for the CAIE thermal story to remain visible.
  const dx = x - heaterX;
  const dz = z - heaterZ;
  const r = Math.hypot(dx, dz);
  const ux = r > 1e-5 ? dx / r : 0;
  const uz = r > 1e-5 ? dz / r : 0;
  const H = SURFACE_Y - BOUNDS.yMin;
  const h = THREE.MathUtils.clamp((y - BOUNDS.yMin) / H, 0, 1);

  const circulationRadius = 2.25;
  const q = Math.pow(r / circulationRadius, 4);
  const envelope = Math.exp(-q);

  // Inward near the bottom, outward near the surface.
  const radial = -strength * 0.32 * r * envelope * Math.cos(Math.PI * h);

  // Very gentle vertical closure around the loop.
  const vertical = strength * 0.20 * envelope * (2 - 4 * q) * Math.sin(Math.PI * h);

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
  explainText.textContent = 'The liquid above the heater gains energy, spreads slightly and rises. Follow it as it loses energy away from the heater, slows, becomes more closely packed and joins the sinking return flow.';
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
  const targetCirculation = heat * 0.72 * Math.min(1, elapsed / 5.5);
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
    const radialHeat = Math.exp(-r2 / Math.pow(HEATER_RADIUS * 0.88, 2));
    const verticalHeat = Math.exp(-Math.pow((p.y - 0.34) / 0.52, 2));
    const heaterProximity = radialHeat * verticalHeat;

    // Stronger local energy gain, followed by gradual loss away from the source.
    p.temp += heaterProximity * heat * 6.2 * dt;
    // Energy is lost gradually away from the heater. The loss is stronger in
    // upper/outlying regions, so cooler parcels visibly slow before settling.
    const awayFromHeater = THREE.MathUtils.clamp((r - HEATER_RADIUS) / 2.2, 0, 1);
    p.temp -= p.temp * (0.050 + 0.020 * Math.max(0, p.y - 2.6) + 0.025 * awayFromHeater) * dt;
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Microscopic particle motion stays lively at 1× and remains distinct from bulk flow.
    const kickStrength = 0.34 + p.temp * 0.25;
    const kx = Math.sin(elapsed * 4.7 + p.seed * 1.19) + Math.sin(elapsed * 7.1 + p.seed * 0.37) * 0.45;
    const ky = Math.cos(elapsed * 5.3 + p.seed * 0.83) + Math.sin(elapsed * 8.4 + p.seed * 0.23) * 0.42;
    const kz = Math.sin(elapsed * 5.9 + p.seed * 0.61) + Math.cos(elapsed * 7.8 + p.seed * 0.71) * 0.45;
    p.vx += kx * kickStrength * dt;
    p.vy += ky * kickStrength * dt;
    p.vz += kz * kickStrength * dt;

    const currentSpeed = Math.hypot(p.vx, p.vy, p.vz) || 1e-6;
    const targetSpeed = targetMicroscopicSpeed(p.temp);
    const speedCorrection = (targetSpeed - currentSpeed) * Math.min(1, dt * 2.0);
    p.vx += (p.vx / currentSpeed) * speedCorrection;
    p.vy += (p.vy / currentSpeed) * speedCorrection;
    p.vz += (p.vz / currentSpeed) * speedCorrection;

    const field = flowField(p.x, p.y, p.z, circulationStrength);

    // Temperature now drives the visible bulk motion more than the background
    // circulation field. Hotter parcels rise; as they lose energy they slow,
    // become more closely packed, and a weak density-driven settling term lets
    // the relatively cooler return flow descend gradually.
    const plumeEnvelope = Math.exp(-r2 / 1.05);
    const buoyancyDrift = p.temp * (0.72 + 0.48 * plumeEnvelope);
    const coolFraction = 1 - p.temp;
    const returnRegion = THREE.MathUtils.smoothstep(r, 1.0, 2.9);
    const settlingDrift = -circulationStrength * 0.24 * coolFraction * returnRegion;

    let expansionX = 0;
    let expansionZ = 0;
    if (r > 1e-4) {
      // Schematic thermal expansion: the warmer plume spreads laterally,
      // lowering the number of representative particles per equal volume.
      const expansion = p.temp * 0.74 * Math.exp(-r2 / 1.10);
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
    p.y += (p.vy + field.y + buoyancyDrift + settlingDrift + bubbleLift) * dt;
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


const sampleGroup = new THREE.Group();
scene.add(sampleGroup);
const sampleCubeSize = 1.90;
const warmSamplePos = new THREE.Vector3(heaterX, 1.75, 0);
const coolSamplePos = new THREE.Vector3(-0.65 * heaterX, 1.15, 1.35);

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

function updateSamplePositions() {
  // Warm frame follows the plume. The cool frame sits low on the side farthest
  // from the heater, where the denser return flow accumulates.
  warmSamplePos.set(heaterX, 1.75, 0);
  // Keep the cool sample continuously away from a heater that moves only in x.
  // A z-offset avoids the frame jumping sides as the heater crosses the centre.
  coolSamplePos.set(-0.65 * heaterX, 1.15, 1.35);
  warmCube.position.copy(warmSamplePos);
  coolCube.position.copy(coolSamplePos);
}

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
  if (elapsed < 5) {
    explainText.textContent = 'Above the heater, particles gain energy: their microscopic motion becomes more vigorous, the liquid expands slightly and the warmer region rises.';
  } else if (elapsed < 14) {
    explainText.textContent = 'Away from the heater, the rising liquid gradually loses energy. Its particles move less vigorously and pack more closely as the parcel becomes relatively cooler and denser.';
  } else {
    explainText.textContent = 'The relatively cooler, denser liquid sinks slowly and returns along the bottom. This bulk circulation is deliberately slower than the random particle motion.';
  }
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
  updateDensitySamples();
});

particleSpeed.addEventListener('input', () => {
  particleSpeedValue.textContent = `${Number(particleSpeed.value).toFixed(1)}×`;
});

temperatureToggle.addEventListener('change', () => {
  document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';
  updateParticleInstances();
});

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
updateSamplePositions();
setHeaterX(heaterX);
updateDensitySamples();
updateStatus();
updateHeaterControls();
requestAnimationFrame(animate);
