import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneHost = document.querySelector('#scene');
const runPauseBtn = document.querySelector('#runPauseBtn');
const resetBtn = document.querySelector('#resetBtn');
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
camera.position.set(10.5, 7.4, 11.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.1, 0);
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

const TANK = { width: 8, height: 5.2, depth: 5.2 };
const BOUNDS = {
  xMin: -TANK.width / 2 + 0.18,
  xMax: TANK.width / 2 - 0.18,
  yMin: 0.18,
  yMax: TANK.height - 0.18,
  zMin: -TANK.depth / 2 + 0.18,
  zMax: TANK.depth / 2 - 0.18,
};
const heaterX = -1.85;
const heaterZ = 0;

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

const water = new THREE.Mesh(
  new THREE.BoxGeometry(TANK.width - 0.16, TANK.height - 0.16, TANK.depth - 0.16),
  waterMaterial
);
water.position.y = TANK.height / 2;
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
  new THREE.BoxGeometry(2.35, 0.22, 2.15),
  new THREE.MeshStandardMaterial({ color: 0x6f7a83, roughness: 0.52, metalness: 0.45 })
);
heaterPlate.position.set(heaterX, -0.02, heaterZ);
heaterPlate.castShadow = true;
heaterGroup.add(heaterPlate);

const coilMaterial = new THREE.MeshStandardMaterial({
  color: 0xe66744,
  emissive: 0xe14e2d,
  emissiveIntensity: 2.0,
  roughness: 0.32,
});
for (let i = -2; i <= 2; i++) {
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.055, 10, 30), coilMaterial);
  coil.rotation.x = Math.PI / 2;
  coil.position.set(heaterX + i * 0.42, 0.13, heaterZ);
  heaterGroup.add(coil);
}
scene.add(heaterGroup);

const heaterLight = new THREE.PointLight(0xff744c, 2.6, 6.5, 2);
heaterLight.position.set(heaterX, 0.4, heaterZ);
scene.add(heaterLight);

const PARTICLE_RADIUS = 0.068;
const COLLISION_DISTANCE = PARTICLE_RADIUS * 2.28;
const particleGeometry = new THREE.SphereGeometry(PARTICLE_RADIUS, 8, 8);
const ambientColor = new THREE.Color(0x5e9fd4);
const warmColor = new THREE.Color(0xef795f);
const neutralColor = new THREE.Color(0x7aa8c5);

let particles = [];
let particleMesh = null;
let particleMaterial = null;
let isRunning = !prefersReducedMotion;
let elapsed = 0;
let circulationStrength = 0;
let lastFrame = performance.now();
let densityAccumulator = 0;
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();
const projectionScratch = new THREE.Vector3();

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
  // Deliberately simplified bulk-flow field for teaching convection.
  // Microscopic random particle motion is handled separately.
  const dx = x - heaterX;
  const dz = z - heaterZ;
  const radial2 = dx * dx + dz * dz;
  const plume = Math.exp(-radial2 / 1.25) * Math.exp(-Math.max(0, y - 3.8) * 0.45);

  const topBand = Math.exp(-Math.pow(y - 4.45, 2) / 0.7);
  const bottomBand = Math.exp(-Math.pow(y - 0.65, 2) / 0.72);
  const farFromHeater = 1 - Math.exp(-radial2 / 2.4);

  const upward = plume * 0.68;
  const downward = farFromHeater * Math.max(0, y - 1.0) / TANK.height * 0.23;

  const horizontalDirection = dx === 0 ? 0 : Math.sign(dx);
  const outwardTop = horizontalDirection * topBand * Math.exp(-Math.abs(z) * 0.12) * 0.30;
  const inwardBottom = -horizontalDirection * bottomBand * farFromHeater * 0.24;

  const zSpread = Math.sign(z || 1) * topBand * Math.min(Math.abs(z) / (TANK.depth / 2), 1) * 0.06;
  const zReturn = -Math.sign(z || 1) * bottomBand * Math.min(Math.abs(z) / (TANK.depth / 2), 1) * 0.045;

  return {
    x: strength * (outwardTop + inwardBottom),
    y: strength * (upward - downward),
    z: strength * (zSpread + zReturn),
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
  if (p.y > BOUNDS.yMax) { p.y = BOUNDS.yMax; p.vy = -Math.abs(p.vy) * bounce; }
  if (p.z < BOUNDS.zMin) { p.z = BOUNDS.zMin; p.vz = Math.abs(p.vz) * bounce; }
  if (p.z > BOUNDS.zMax) { p.z = BOUNDS.zMax; p.vz = -Math.abs(p.vz) * bounce; }
}

function resolveParticleCollisions() {
  const cellSize = COLLISION_DISTANCE * 1.05;
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

  const minDist2 = COLLISION_DISTANCE * COLLISION_DISTANCE;
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
            if (dist2 <= 1e-10 || dist2 >= minDist2) continue;

            const dist = Math.sqrt(dist2);
            dx /= dist; dy /= dist; dz /= dist;
            const overlap = COLLISION_DISTANCE - dist;
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
  const heat = Number(heatPower.value) / 100;
  const targetCirculation = heat * Math.min(1, elapsed / 7.5);
  circulationStrength += (targetCirculation - circulationStrength) * Math.min(1, dt * 0.55);

  heaterLight.intensity = 0.25 + heat * 3.1;
  coilMaterial.emissiveIntensity = 0.25 + heat * 2.6;

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const heaterProximity = Math.exp(-(dx * dx + dz * dz) / 0.78) * Math.exp(-Math.pow(p.y - 0.42, 2) / 0.5);

    // Heat gain near the plate and gradual energy loss away from it.
    p.temp += heaterProximity * heat * 0.58 * dt;
    p.temp -= p.temp * (0.055 + 0.022 * Math.max(0, p.y - 3.2)) * dt;
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Continuous microscopic motion: particles keep moving even with the heater off.
    // Small pseudo-random kicks continually alter direction, while a gentle thermostat
    // keeps the average speed near the value chosen by the user.
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
    const buoyancyDrift = p.temp * 0.28;

    p.x += (p.vx + field.x) * dt;
    p.y += (p.vy + field.y + buoyancyDrift) * dt;
    p.z += (p.vz + field.z) * dt;
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
const flowArrows = [];

function buildFlowArrows() {
  arrowGroup.clear();
  flowArrows.length = 0;

  const xs = [-3.25, -1.95, -0.65, 0.65, 1.95, 3.25];
  const ys = [0.62, 1.42, 2.22, 3.02, 3.82, 4.62];
  const zs = [-1.65, 0, 1.65];

  for (const z of zs) {
    for (const y of ys) {
      for (const x of xs) {
        const helper = new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(x, y, z),
          0.25,
          0x55788e,
          0.12,
          0.075
        );
        helper.line.material.transparent = true;
        helper.line.material.opacity = 0.62;
        helper.cone.material.transparent = true;
        helper.cone.material.opacity = 0.72;
        arrowGroup.add(helper);
        flowArrows.push({ helper, position: new THREE.Vector3(x, y, z) });
      }
    }
  }

  arrowGroup.visible = flowToggle.checked;
  updateFlowArrows();
}

function updateFlowArrows() {
  if (!flowToggle.checked) return;
  for (const item of flowArrows) {
    const { x, y, z } = item.position;
    const f = flowField(x, y, z, circulationStrength);
    const dir = new THREE.Vector3(f.x, f.y, f.z);
    const magnitude = dir.length();
    item.helper.visible = magnitude > 0.006;
    if (!item.helper.visible) continue;
    dir.normalize();
    item.helper.setDirection(dir);
    const length = THREE.MathUtils.clamp(0.18 + magnitude * 1.25, 0.18, 0.72);
    item.helper.setLength(length, Math.min(0.14, length * 0.31), Math.min(0.08, length * 0.18));
  }
}

buildFlowArrows();

const sampleGroup = new THREE.Group();
scene.add(sampleGroup);
const sampleCubeSize = 1.22;
const warmSamplePos = new THREE.Vector3(heaterX, 2.15, 0.9);
const coolSamplePos = new THREE.Vector3(2.35, 1.55, -0.9);

function makeSampleCube(position, color) {
  const group = new THREE.Group();
  const cube = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(sampleCubeSize, sampleCubeSize, sampleCubeSize)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
  );
  group.add(cube);
  group.position.copy(position);
  return group;
}

const warmCube = makeSampleCube(warmSamplePos, 0xef795f);
const coolCube = makeSampleCube(coolSamplePos, 0x5e9fd4);
sampleGroup.add(warmCube, coolCube);

const sampleParticleGeometry = new THREE.SphereGeometry(0.045, 7, 7);
const warmSampleMaterial = new THREE.MeshBasicMaterial({ color: 0xef795f });
const coolSampleMaterial = new THREE.MeshBasicMaterial({ color: 0x5e9fd4 });
const warmSampleDots = new THREE.Group();
const coolSampleDots = new THREE.Group();
warmCube.add(warmSampleDots);
coolCube.add(coolSampleDots);

function localAverageTemp(pos, radius = 0.8) {
  let total = 0;
  let count = 0;
  const r2 = radius * radius;
  for (const p of particles) {
    const dx = p.x - pos.x;
    const dy = p.y - pos.y;
    const dz = p.z - pos.z;
    if (dx * dx + dy * dy + dz * dz <= r2) {
      total += p.temp;
      count++;
    }
  }
  return count ? total / count : 0;
}

function rebuildSampleDots(group, count, material, seedOffset) {
  group.clear();
  const half = sampleCubeSize * 0.43;
  for (let i = 0; i < count; i++) {
    const dot = new THREE.Mesh(sampleParticleGeometry, material);
    dot.position.set(
      THREE.MathUtils.lerp(-half, half, seededNoise(i * 3.1 + seedOffset)),
      THREE.MathUtils.lerp(-half, half, seededNoise(i * 5.2 + seedOffset + 5)),
      THREE.MathUtils.lerp(-half, half, seededNoise(i * 7.7 + seedOffset + 11))
    );
    group.add(dot);
  }
}

let lastWarmVisualCount = -1;
let lastCoolVisualCount = -1;

function updateDensitySamples() {
  const warmT = localAverageTemp(warmSamplePos, 0.95);
  const coolT = localAverageTemp(coolSamplePos, 0.95);

  // Exaggerated thermal-expansion coefficient for a clear particle model.
  const warmRho = THREE.MathUtils.clamp(1 - warmT * 0.12, 0.87, 1);
  const coolRho = THREE.MathUtils.clamp(1 - coolT * 0.12, 0.87, 1);
  const baseline = 36;
  const warmN = Math.round(baseline * warmRho);
  const coolN = Math.round(baseline * coolRho);

  warmCount.textContent = `${warmN} particles`;
  coolCount.textContent = `${coolN} particles`;
  warmCounter3dValue.textContent = `${warmN} particles`;
  coolCounter3dValue.textContent = `${coolN} particles`;
  warmDensity.textContent = `Relative density ≈ ${warmRho.toFixed(2)}`;
  coolDensity.textContent = `Relative density ≈ ${coolRho.toFixed(2)}`;

  if (warmN !== lastWarmVisualCount) {
    rebuildSampleDots(warmSampleDots, warmN, warmSampleMaterial, 19);
    lastWarmVisualCount = warmN;
  }
  if (coolN !== lastCoolVisualCount) {
    rebuildSampleDots(coolSampleDots, coolN, coolSampleMaterial, 71);
    lastCoolVisualCount = coolN;
  }
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
  projectCounter(warmCounter3d, warmSamplePos.clone().add(new THREE.Vector3(0, 0.92, 0)));
  projectCounter(coolCounter3d, coolSamplePos.clone().add(new THREE.Vector3(0, 0.92, 0)));
}

function updateNarration() {
  if (elapsed < 4) {
    explainText.textContent = 'All particles are continuously moving. The liquid directly above the heater gains energy first, so a warm plume develops gradually.';
  } else if (elapsed < 11) {
    explainText.textContent = 'The warmer region becomes less dense and rises. Relatively cooler liquid moves in beneath it while microscopic particle motion continues everywhere.';
  } else {
    explainText.textContent = 'The vector field shows the bulk movement of the liquid; the faster irregular motion of individual particles is superimposed on that flow.';
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

flowToggle.addEventListener('change', () => {
  arrowGroup.visible = flowToggle.checked;
  updateFlowArrows();
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
    updateFlowArrows();
    if (densityToggle.checked && densityAccumulator >= 0.16) {
      updateDensitySamples();
      densityAccumulator = 0;
    }
    updateNarration();
  }

  const heat = Number(heatPower.value) / 100;
  heaterLight.intensity = 0.25 + heat * (2.7 + Math.sin(elapsed * 3.2) * 0.18);

  controls.update();
  updateSampleCounterPositions();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

makeParticles(Number(particleCount.value));
updateDensitySamples();
updateStatus();
requestAnimationFrame(animate);
