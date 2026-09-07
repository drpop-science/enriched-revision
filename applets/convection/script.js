import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneHost = document.querySelector('#scene');
const runPauseBtn = document.querySelector('#runPauseBtn');
const resetBtn = document.querySelector('#resetBtn');
const heatPower = document.querySelector('#heatPower');
const heatPowerValue = document.querySelector('#heatPowerValue');
const particleCount = document.querySelector('#particleCount');
const particleCountValue = document.querySelector('#particleCountValue');
const temperatureToggle = document.querySelector('#temperatureToggle');
const flowToggle = document.querySelector('#flowToggle');
const densityToggle = document.querySelector('#densityToggle');
const densityPanel = document.querySelector('#densityPanel');
const warmCount = document.querySelector('#warmCount');
const coolCount = document.querySelector('#coolCount');
const warmDensity = document.querySelector('#warmDensity');
const coolDensity = document.querySelector('#coolDensity');
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

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb9d5df,
  transparent: true,
  opacity: 0.13,
  roughness: 0.12,
  metalness: 0,
  transmission: 0.75,
  thickness: 0.35,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x9cc9dc,
  transparent: true,
  opacity: 0.10,
  roughness: 0.28,
  transmission: 0.72,
  thickness: 1.1,
  depthWrite: false,
});

const water = new THREE.Mesh(new THREE.BoxGeometry(TANK.width - 0.16, TANK.height - 0.16, TANK.depth - 0.16), waterMaterial);
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

const PARTICLE_RADIUS = 0.055;
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
const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

function seededNoise(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function makeParticles(count) {
  if (particleMesh) {
    scene.remove(particleMesh);
    particleMesh.dispose?.();
  }

  particleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
  });
  particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, count);
  particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particleMesh.castShadow = false;
  particleMesh.receiveShadow = false;
  scene.add(particleMesh);

  particles = [];
  for (let i = 0; i < count; i++) {
    const p = {
      x: THREE.MathUtils.lerp(BOUNDS.xMin, BOUNDS.xMax, Math.random()),
      y: THREE.MathUtils.lerp(BOUNDS.yMin, BOUNDS.yMax, Math.random()),
      z: THREE.MathUtils.lerp(BOUNDS.zMin, BOUNDS.zMax, Math.random()),
      vx: 0,
      vy: 0,
      vz: 0,
      temp: 0,
      seed: Math.random() * 1000,
    };
    particles.push(p);
    dummy.position.set(p.x, p.y, p.z);
    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);
    particleMesh.setColorAt(i, ambientColor);
  }
  particleMesh.instanceMatrix.needsUpdate = true;
  particleMesh.instanceColor.needsUpdate = true;
}

function flowField(x, y, z, strength) {
  // A smooth teaching model: local warm upflow forms first, with a progressively
  // developing return circulation elsewhere. It is intentionally schematic,
  // not a CFD solver.
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
  makeParticles(Number(particleCount.value));
  updateDensitySamples();
  explainText.textContent = 'The liquid directly above the heater gains energy first. A warm plume should gradually develop rather than appearing instantly.';
}

function confineParticle(p) {
  const bounce = 0.3;
  if (p.x < BOUNDS.xMin) { p.x = BOUNDS.xMin; p.vx = Math.abs(p.vx) * bounce; }
  if (p.x > BOUNDS.xMax) { p.x = BOUNDS.xMax; p.vx = -Math.abs(p.vx) * bounce; }
  if (p.y < BOUNDS.yMin) { p.y = BOUNDS.yMin; p.vy = Math.abs(p.vy) * bounce; }
  if (p.y > BOUNDS.yMax) { p.y = BOUNDS.yMax; p.vy = -Math.abs(p.vy) * bounce; }
  if (p.z < BOUNDS.zMin) { p.z = BOUNDS.zMin; p.vz = Math.abs(p.vz) * bounce; }
  if (p.z > BOUNDS.zMax) { p.z = BOUNDS.zMax; p.vz = -Math.abs(p.vz) * bounce; }
}

function updateParticles(dt) {
  const heat = Number(heatPower.value) / 100;
  const targetCirculation = heat * Math.min(1, elapsed / 7.5);
  circulationStrength += (targetCirculation - circulationStrength) * Math.min(1, dt * 0.55);

  heaterLight.intensity = 0.25 + heat * 3.1;
  coilMaterial.emissiveIntensity = 0.25 + heat * 2.6;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const heaterProximity = Math.exp(-(dx * dx + dz * dz) / 0.78) * Math.exp(-Math.pow(p.y - 0.42, 2) / 0.5);

    // Heat gain near the plate; gradual energy loss to the rest of the liquid/environment.
    p.temp += heaterProximity * heat * 0.58 * dt;
    p.temp -= p.temp * (0.055 + 0.022 * Math.max(0, p.y - 3.2)) * dt;
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    const field = flowField(p.x, p.y, p.z, circulationStrength);
    const buoyancy = p.temp * 0.40;

    // Small, continuous irregular motion superimposed on the bulk flow.
    const jitter = 0.06 + p.temp * 0.05;
    const nx = Math.sin(elapsed * 2.2 + p.seed * 1.17) + Math.sin(elapsed * 3.7 + p.seed * 0.31) * 0.4;
    const ny = Math.cos(elapsed * 2.5 + p.seed * 0.83) + Math.sin(elapsed * 4.1 + p.seed * 0.21) * 0.35;
    const nz = Math.sin(elapsed * 2.9 + p.seed * 0.57) + Math.cos(elapsed * 3.3 + p.seed * 0.73) * 0.4;

    p.vx += (field.x + nx * jitter - p.vx * 1.8) * dt;
    p.vy += (field.y + buoyancy + ny * jitter * 0.45 - p.vy * 1.9) * dt;
    p.vz += (field.z + nz * jitter * 0.7 - p.vz * 1.8) * dt;

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    confineParticle(p);

    dummy.position.set(p.x, p.y, p.z);
    const pulse = 0.96 + 0.11 * p.temp;
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
  particleMesh.instanceColor.needsUpdate = true;
}

const arrowGroup = new THREE.Group();
scene.add(arrowGroup);

function buildFlowArrows() {
  arrowGroup.clear();
  const points = [
    [-1.85, 1.2, 0], [-1.85, 2.5, 0], [-1.85, 3.7, 0],
    [-0.5, 4.35, 0], [1.25, 4.35, 0], [2.75, 3.75, 0],
    [2.9, 2.3, 0], [2.6, 1.15, 0], [1.25, 0.65, 0], [0.0, 0.65, 0],
  ];
  for (const [x, y, z] of points) {
    const f = flowField(x, y, z, 1);
    const dir = new THREE.Vector3(f.x, f.y, f.z);
    if (dir.lengthSq() < 0.005) continue;
    dir.normalize();
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(x, y, z), 0.72, 0x55788e, 0.19, 0.10);
    arrowGroup.add(arrow);
  }
  arrowGroup.visible = flowToggle.checked;
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
let warmSampleDots = new THREE.Group();
let coolSampleDots = new THREE.Group();
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
      THREE.MathUtils.lerp(-half, half, seededNoise(i * 7.7 + seedOffset + 11)),
    );
    group.add(dot);
  }
}

let lastWarmVisualCount = -1;
let lastCoolVisualCount = -1;

function updateDensitySamples() {
  const warmT = localAverageTemp(warmSamplePos, 0.95);
  const coolT = localAverageTemp(coolSamplePos, 0.95);

  // Exaggerated coefficient chosen for a visible teaching model.
  const warmRho = THREE.MathUtils.clamp(1 - warmT * 0.12, 0.87, 1);
  const coolRho = THREE.MathUtils.clamp(1 - coolT * 0.12, 0.87, 1);
  const baseline = 36;
  const warmN = Math.round(baseline * warmRho);
  const coolN = Math.round(baseline * coolRho);

  warmCount.textContent = `${warmN} particles`;
  coolCount.textContent = `${coolN} particles`;
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

function updateNarration() {
  if (elapsed < 4) {
    explainText.textContent = 'The liquid directly above the heater gains energy first. A warm plume should gradually develop rather than appearing instantly.';
  } else if (elapsed < 11) {
    explainText.textContent = 'The warmer region becomes less dense and rises. Relatively cooler liquid moves in beneath it.';
  } else {
    explainText.textContent = 'As the warmer liquid spreads away from the heater and loses energy, the bulk circulation becomes easier to see.';
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
});

temperatureToggle.addEventListener('change', () => {
  document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';
});

flowToggle.addEventListener('change', () => {
  arrowGroup.visible = flowToggle.checked;
});

densityToggle.addEventListener('change', () => {
  sampleGroup.visible = densityToggle.checked;
  densityPanel.hidden = !densityToggle.checked;
  if (densityToggle.checked) updateDensitySamples();
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
    updateParticles(dt);
    if (densityToggle.checked && Math.floor(elapsed * 3) % 3 === 0) updateDensitySamples();
    updateNarration();
  }

  // Subtle heater pulse without changing the physical model.
  const heat = Number(heatPower.value) / 100;
  heaterLight.intensity = 0.25 + heat * (2.7 + Math.sin(elapsed * 3.2) * 0.18);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

makeParticles(Number(particleCount.value));
updateDensitySamples();
updateStatus();
requestAnimationFrame(animate);
