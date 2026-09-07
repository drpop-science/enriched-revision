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
const flowToggle = document.querySelector('#flowToggle');
const traceToggle = document.querySelector('#traceToggle');
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
const walkthroughPrevBtn = document.querySelector('#walkthroughPrevBtn');
const walkthroughNextBtn = document.querySelector('#walkthroughNextBtn');
const walkthroughCloseBtn = document.querySelector('#walkthroughCloseBtn');
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

const TANK = { width: 9.2, height: 4.10, depth: 2.10 };
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
const DEPTH_MOTION_SCALE = 0.78;
const HEAT_EFFECT_RADIUS = HEATER_RADIUS * 0.94;
const MAX_SURFACE_RISE = 0.72;


// V10 bulk-flow model ---------------------------------------------------------
// A 2-D Boussinesq-style incompressible solver drives the x-y bulk motion.
// The particle layer remains fully 3-D: microscopic motion, packing and a small
// curl-derived z drift give depth/parallax without pretending this is full 3-D CFD.
const FLUID_WIDTH = BOUNDS.xMax - BOUNDS.xMin;
const FLUID_HEIGHT = SURFACE_Y - BOUNDS.yMin;
const FLUID_NX = 84;
const FLUID_H = FLUID_WIDTH / FLUID_NX;
const FLUID_NY = Math.max(24, Math.round(FLUID_HEIGHT / FLUID_H));
const FLUID_STRIDE = FLUID_NX + 2;
const FLUID_SIZE = (FLUID_NX + 2) * (FLUID_NY + 2);
const FLOW_PARTICLE_SCALE = 0.92;

const FLUID_CFG = {
  buoyancy: 2.20,
  heatRate: 4.20,
  heaterSigma: 0.60,
  heaterDepth: 0.30,
  bulkCool: 0.025,
  surfaceCool: 0.46,
  wallCool: 0.36,
  diffT: 0.00028,
  viscosity: 0.000055,
  drag: 0.46,
  vorticity: 1.65,
  projIters: 22,
};

function fluidIdx(i, j) { return i + FLUID_STRIDE * j; }
function fClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function fZeros() { return new Float32Array(FLUID_SIZE); }

class Fluid2D {
  constructor() {
    this.u = fZeros(); this.v = fZeros(); this.T = fZeros();
    this.u0 = fZeros(); this.v0 = fZeros(); this.T0 = fZeros();
    this.p = fZeros(); this.div = fZeros(); this.curl = fZeros();
  }

  boundary(type, x) {
    for (let j = 1; j <= FLUID_NY; j++) {
      x[fluidIdx(0, j)] = type === 1 ? -x[fluidIdx(1, j)] : x[fluidIdx(1, j)];
      x[fluidIdx(FLUID_NX + 1, j)] = type === 1 ? -x[fluidIdx(FLUID_NX, j)] : x[fluidIdx(FLUID_NX, j)];
    }
    for (let i = 1; i <= FLUID_NX; i++) {
      x[fluidIdx(i, 0)] = type === 2 ? -x[fluidIdx(i, 1)] : x[fluidIdx(i, 1)];
      x[fluidIdx(i, FLUID_NY + 1)] = type === 2 ? -x[fluidIdx(i, FLUID_NY)] : x[fluidIdx(i, FLUID_NY)];
    }
    x[fluidIdx(0, 0)] = 0.5 * (x[fluidIdx(1, 0)] + x[fluidIdx(0, 1)]);
    x[fluidIdx(0, FLUID_NY + 1)] = 0.5 * (x[fluidIdx(1, FLUID_NY + 1)] + x[fluidIdx(0, FLUID_NY)]);
    x[fluidIdx(FLUID_NX + 1, 0)] = 0.5 * (x[fluidIdx(FLUID_NX, 0)] + x[fluidIdx(FLUID_NX + 1, 1)]);
    x[fluidIdx(FLUID_NX + 1, FLUID_NY + 1)] = 0.5 * (x[fluidIdx(FLUID_NX, FLUID_NY + 1)] + x[fluidIdx(FLUID_NX + 1, FLUID_NY)]);
  }

  linSolve(type, x, x0, a, c, iterations) {
    const invC = 1 / c;
    for (let k = 0; k < iterations; k++) {
      for (let j = 1; j <= FLUID_NY; j++) {
        for (let i = 1; i <= FLUID_NX; i++) {
          const id = fluidIdx(i, j);
          x[id] = (x0[id] + a * (x[id - 1] + x[id + 1] + x[id - FLUID_STRIDE] + x[id + FLUID_STRIDE])) * invC;
        }
      }
      this.boundary(type, x);
    }
  }

  diffuse(type, x, x0, diffusion, dt, iterations) {
    if (diffusion <= 0) { x.set(x0); return; }
    const a = dt * diffusion * FLUID_NX * FLUID_NY;
    this.linSolve(type, x, x0, a, 1 + 4 * a, iterations);
  }

  advect(type, d, d0, u, v, dt) {
    const dt0 = dt / FLUID_H;
    for (let j = 1; j <= FLUID_NY; j++) {
      for (let i = 1; i <= FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        const x = fClamp(i - dt0 * u[id], 0.5, FLUID_NX + 0.5);
        const y = fClamp(j - dt0 * v[id], 0.5, FLUID_NY + 0.5);
        const i0 = Math.floor(x), i1 = i0 + 1;
        const j0 = Math.floor(y), j1 = j0 + 1;
        const s1 = x - i0, s0 = 1 - s1;
        const t1 = y - j0, t0 = 1 - t1;
        d[id] = s0 * (t0 * d0[fluidIdx(i0, j0)] + t1 * d0[fluidIdx(i0, j1)]) +
                s1 * (t0 * d0[fluidIdx(i1, j0)] + t1 * d0[fluidIdx(i1, j1)]);
      }
    }
    this.boundary(type, d);
  }

  project(iterations) {
    for (let j = 1; j <= FLUID_NY; j++) {
      for (let i = 1; i <= FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        this.div[id] = -0.5 * FLUID_H * (
          this.u[id + 1] - this.u[id - 1] +
          this.v[id + FLUID_STRIDE] - this.v[id - FLUID_STRIDE]
        );
        this.p[id] = 0;
      }
    }
    this.boundary(0, this.div); this.boundary(0, this.p);
    this.linSolve(0, this.p, this.div, 1, 4, iterations);
    for (let j = 1; j <= FLUID_NY; j++) {
      for (let i = 1; i <= FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        this.u[id] -= 0.5 * (this.p[id + 1] - this.p[id - 1]) / FLUID_H;
        this.v[id] -= 0.5 * (this.p[id + FLUID_STRIDE] - this.p[id - FLUID_STRIDE]) / FLUID_H;
      }
    }
    this.boundary(1, this.u); this.boundary(2, this.v);
  }

  applyVorticity(dt, strength) {
    if (strength <= 0) return;
    for (let j = 1; j <= FLUID_NY; j++) {
      for (let i = 1; i <= FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        this.curl[id] = (this.v[id + 1] - this.v[id - 1] - this.u[id + FLUID_STRIDE] + this.u[id - FLUID_STRIDE]) * 0.5 / FLUID_H;
      }
    }
    for (let j = 2; j < FLUID_NY; j++) {
      for (let i = 2; i < FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        let dx = (Math.abs(this.curl[id + 1]) - Math.abs(this.curl[id - 1])) * 0.5;
        let dy = (Math.abs(this.curl[id + FLUID_STRIDE]) - Math.abs(this.curl[id - FLUID_STRIDE])) * 0.5;
        const len = Math.hypot(dx, dy) + 1e-6;
        dx /= len; dy /= len;
        this.u[id] += strength * FLUID_H * dy * this.curl[id] * dt;
        this.v[id] -= strength * FLUID_H * dx * this.curl[id] * dt;
      }
    }
    this.boundary(1, this.u); this.boundary(2, this.v);
  }

  thermal(dt, worldHeaterX, power) {
    const sourceX = worldHeaterX - BOUNDS.xMin;
    const sigma2 = 2 * FLUID_CFG.heaterSigma * FLUID_CFG.heaterSigma;
    for (let j = 1; j <= FLUID_NY; j++) {
      const y = (j - 0.5) * FLUID_H;
      const nearTop = Math.exp(-Math.pow((FLUID_HEIGHT - y) / 0.30, 2));
      for (let i = 1; i <= FLUID_NX; i++) {
        const id = fluidIdx(i, j);
        const x = (i - 0.5) * FLUID_H;
        if (power > 0 && y < FLUID_CFG.heaterDepth * 2.5) {
          const dx = x - sourceX;
          const vertical = Math.exp(-Math.pow(y / FLUID_CFG.heaterDepth, 2));
          const source = Math.exp(-dx * dx / sigma2) * vertical;
          this.T[id] += source * power * FLUID_CFG.heatRate * dt * (1 - this.T[id]);
        }
        const nearWall = Math.exp(-Math.pow(Math.min(x, FLUID_WIDTH - x) / 0.32, 2));
        const loss = FLUID_CFG.bulkCool + FLUID_CFG.surfaceCool * nearTop + FLUID_CFG.wallCool * nearWall;
        this.T[id] = fClamp(this.T[id] - this.T[id] * loss * dt, 0, 1);
        this.v[id] += FLUID_CFG.buoyancy * this.T[id] * dt;
      }
    }
    this.boundary(0, this.T);
  }

  limitVelocity(limit = 2.4) {
    for (let i = 0; i < FLUID_SIZE; i++) {
      const s = Math.hypot(this.u[i], this.v[i]);
      if (s > limit) {
        const k = limit / s;
        this.u[i] *= k; this.v[i] *= k;
      }
    }
  }

  step(dt, worldHeaterX, power) {
    this.thermal(dt, worldHeaterX, power);
    this.applyVorticity(dt, FLUID_CFG.vorticity);
    const damp = Math.max(0, 1 - FLUID_CFG.drag * dt);
    for (let i = 0; i < FLUID_SIZE; i++) { this.u[i] *= damp; this.v[i] *= damp; }

    this.u0.set(this.u); this.v0.set(this.v);
    this.diffuse(1, this.u, this.u0, FLUID_CFG.viscosity, dt, 6);
    this.diffuse(2, this.v, this.v0, FLUID_CFG.viscosity, dt, 6);
    this.project(FLUID_CFG.projIters);

    this.u0.set(this.u); this.v0.set(this.v);
    this.advect(1, this.u, this.u0, this.u0, this.v0, dt);
    this.advect(2, this.v, this.v0, this.u0, this.v0, dt);
    this.project(FLUID_CFG.projIters);

    this.T0.set(this.T);
    this.diffuse(0, this.T, this.T0, FLUID_CFG.diffT, dt, 5);
    this.T0.set(this.T);
    this.advect(0, this.T, this.T0, this.u, this.v, dt);
    this.limitVelocity();
  }

  sample(field, worldX, worldY) {
    const x = fClamp(worldX - BOUNDS.xMin, 0, FLUID_WIDTH);
    const y = fClamp(worldY - BOUNDS.yMin, 0, FLUID_HEIGHT);
    const fx = fClamp(x / FLUID_H + 0.5, 0.5, FLUID_NX + 0.5);
    const fy = fClamp(y / FLUID_H + 0.5, 0.5, FLUID_NY + 0.5);
    const i0 = Math.floor(fx), j0 = Math.floor(fy);
    const s1 = fx - i0, s0 = 1 - s1, t1 = fy - j0, t0 = 1 - t1;
    const i1 = i0 + 1, j1 = j0 + 1;
    return s0 * (t0 * field[fluidIdx(i0, j0)] + t1 * field[fluidIdx(i0, j1)]) +
           s1 * (t0 * field[fluidIdx(i1, j0)] + t1 * field[fluidIdx(i1, j1)]);
  }

  velocityAt(worldX, worldY) {
    return {
      x: this.sample(this.u, worldX, worldY),
      y: this.sample(this.v, worldX, worldY),
    };
  }

  curlAt(worldX, worldY) {
    const e = FLUID_H;
    const dvDx = (this.sample(this.v, worldX + e, worldY) - this.sample(this.v, worldX - e, worldY)) / (2 * e);
    const duDy = (this.sample(this.u, worldX, worldY + e) - this.sample(this.u, worldX, worldY - e)) / (2 * e);
    return dvDx - duDy;
  }
}

let fluid = new Fluid2D();

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

const PARTICLE_RADIUS = 0.064;
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
      packJitter: THREE.MathUtils.lerp(0.96, 1.04, Math.random()),
    };
  });

  updateParticleInstances();
}

function resetSimulation() {
  elapsed = 0;
  fluid = new Fluid2D();
  makeParticles(Number(particleCount.value));
  if (traceToggle.checked) pickTracedParticles();
  explainText.textContent = 'The bulk current is now solved from heating, buoyancy and pressure rather than prescribed as a loop. Use the arrows to see the instantaneous solved flow, or trace six representative particles.';
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

function relaxParticlePacking(iterations = 2) {
  if (particles.length < 2) return;
  const volume = (BOUNDS.xMax - BOUNDS.xMin) * (BOUNDS.yMax - BOUNDS.yMin) * (BOUNDS.zMax - BOUNDS.zMin);
  const meanSpacing = Math.cbrt(volume / particles.length);
  const baseRest = meanSpacing * 0.78;
  const maxRest = baseRest * 1.28;
  const cellSize = maxRest * 1.05;
  const keyFor = (x, y, z) => `${x}|${y}|${z}`;

  for (let pass = 0; pass < iterations; pass++) {
    const grid = new Map();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const cx = Math.floor((p.x - BOUNDS.xMin) / cellSize);
      const cy = Math.floor((p.y - BOUNDS.yMin) / cellSize);
      const cz = Math.floor((p.z - BOUNDS.zMin) / cellSize);
      p._packCell = [cx, cy, cz];
      const k = keyFor(cx, cy, cz);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const [cx, cy, cz] = p._packCell;
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          for (let oz = -1; oz <= 1; oz++) {
            const neighbours = grid.get(keyFor(cx + ox, cy + oy, cz + oz));
            if (!neighbours) continue;
            for (const j of neighbours) {
              if (j <= i) continue;
              const q = particles[j];
              let dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z;
              let d2 = dx * dx + dy * dy + dz * dz;
              const thermal = 1 + 0.22 * ((p.temp + q.temp) * 0.5);
              const rest = baseRest * thermal * 0.5 * (p.packJitter + q.packJitter);
              if (d2 >= rest * rest) continue;
              if (d2 < 1e-10) {
                const a = (p.seed + q.seed) * 0.73;
                dx = Math.cos(a) * 1e-4; dy = Math.sin(a * 1.7) * 1e-4; dz = Math.sin(a) * 1e-4;
                d2 = dx * dx + dy * dy + dz * dz;
              }
              const d = Math.sqrt(d2);
              const correction = 0.21 * (rest - d) / d;
              dx *= correction; dy *= correction; dz *= correction;
              p.x -= dx; p.y -= dy; p.z -= dz;
              q.x += dx; q.y += dy; q.z += dz;
            }
          }
        }
      }
    }
    for (const p of particles) confineParticle(p);
  }
}

function updateParticles(dt) {
  const heat = currentHeat();
  const substeps = dt > 0.024 ? 2 : 1;
  for (let s = 0; s < substeps; s++) fluid.step(dt / substeps, heaterX, heat);

  heaterLight.intensity = heaterOn ? 0.25 + heat * 5.1 : 0.0;
  coilMaterial.emissiveIntensity = heaterOn ? 0.35 + heat * 4.3 : 0.05;
  coilMaterial.color.setHex(heaterOn ? 0xa63f2d : 0x4d555a);

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const r2 = dx * dx + dz * dz;

    // Particle colour/microscopic speed follows the solved temperature field.
    const solvedT = fluid.sample(fluid.T, p.x, Math.min(p.y, SURFACE_Y - 0.01));
    const depthThermalProfile = 0.48 + 0.52 * Math.exp(-Math.pow(p.z / 0.78, 2));
    const particleTargetT = solvedT * depthThermalProfile;
    p.temp += (particleTargetT - p.temp) * Math.min(1, dt * 3.2);
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Microscopic random motion: deliberately faster than the bulk drift.
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

    // Solved incompressible bulk velocity. This same x-y field is what the
    // arrow overlay displays, so particles and arrows cannot disagree about
    // the direction of the convection current.
    const bulk = fluid.velocityAt(p.x, Math.min(p.y, SURFACE_Y - 0.01));
    const curl = fluid.curlAt(p.x, Math.min(p.y, SURFACE_Y - 0.02));
    const depthShape = Math.max(0, 1 - Math.pow(p.z / Math.max(0.2, TANK.depth * 0.5), 2));
    const curlDepthDrift = THREE.MathUtils.clamp(curl * 0.028, -0.16, 0.16) * depthShape;

    // Soft free surface: particles may overshoot and then return smoothly.
    if (p.y > SURFACE_Y) {
      const excess = p.y - SURFACE_Y;
      const restoringAcceleration = -2.7 * excess;
      const upwardDamping = p.vy > 0 ? -1.15 * p.vy : 0;
      p.vy += (restoringAcceleration + upwardDamping) * dt;
    }

    const localHeat = Math.exp(-r2 / Math.pow(HEAT_EFFECT_RADIUS, 2));
    const nearSurface = Math.exp(-Math.pow((p.y - SURFACE_Y) / 0.42, 2));
    const bubbleLift = heat * localHeat * nearSurface *
      (0.72 + 0.28 * Math.sin(elapsed * 6.4 + p.seed)) * (0.25 + 0.75 * p.temp);

    applySoftWallForces(p, dt);
    const depthFlowProfile = 0.72 + 0.28 * Math.exp(-Math.pow(p.z / 0.92, 2));
    p.x += (p.vx + bulk.x * FLOW_PARTICLE_SCALE * depthFlowProfile) * dt;
    p.y += (p.vy + bulk.y * FLOW_PARTICLE_SCALE * depthFlowProfile + bubbleLift) * dt;
    p.z += (p.vz + curlDepthDrift) * dt;
    confineParticle(p);
  }

  // Position-only neighbour repulsion keeps the liquid evenly filled without
  // injecting extra kinetic energy into the particles. Warm particles claim a
  // slightly larger rest separation, making the expansion visible.
  relaxParticlePacking(particles.length > 1750 ? 1 : 2);
  updateTrails(dt);
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


// V10 solved-flow arrows ------------------------------------------------------
const flowArrowGroup = new THREE.Group();
scene.add(flowArrowGroup);
const flowArrows = [];
const arrowRows = 6;
const arrowCols = 11;
for (let row = 0; row < arrowRows; row++) {
  for (let col = 0; col < arrowCols; col++) {
    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(),
      0.1,
      0x4f80a8,
      0.04,
      0.025
    );
    arrow.line.material.transparent = true;
    arrow.line.material.opacity = 0.55;
    arrow.line.material.depthWrite = false;
    arrow.cone.material.transparent = true;
    arrow.cone.material.opacity = 0.55;
    arrow.cone.material.depthWrite = false;
    flowArrowGroup.add(arrow);
    flowArrows.push({ arrow, row, col });
  }
}
flowArrowGroup.visible = false;

function updateFlowArrows() {
  flowArrowGroup.visible = flowToggle.checked;
  if (!flowArrowGroup.visible) return;
  const x0 = BOUNDS.xMin + 0.48, x1 = BOUNDS.xMax - 0.48;
  const y0 = BOUNDS.yMin + 0.40, y1 = SURFACE_Y - 0.34;
  for (const item of flowArrows) {
    const x = THREE.MathUtils.lerp(x0, x1, (item.col + 0.5) / arrowCols);
    const y = THREE.MathUtils.lerp(y0, y1, (item.row + 0.5) / arrowRows);
    const vel = fluid.velocityAt(x, y);
    const speed = Math.hypot(vel.x, vel.y);
    if (speed < 0.035) {
      item.arrow.visible = false;
      continue;
    }
    item.arrow.visible = true;
    const dir = new THREE.Vector3(vel.x, vel.y, 0).normalize();
    const length = THREE.MathUtils.clamp(0.08 + speed * 0.34, 0.09, 0.48);
    item.arrow.position.set(x, y, 0);
    item.arrow.setDirection(dir);
    item.arrow.setLength(length, Math.min(0.11, length * 0.30), Math.min(0.065, length * 0.18));
    const alpha = THREE.MathUtils.clamp(0.20 + speed / 1.35, 0.20, 0.82);
    item.arrow.line.material.opacity = alpha;
    item.arrow.cone.material.opacity = alpha;
  }
}

// V10 trace six actual particles ---------------------------------------------
const traceGroup = new THREE.Group();
scene.add(traceGroup);
traceGroup.visible = false;
const TRACE_COUNT = 6;
const TRACE_MAX_POINTS = 72;
const traced = [];
let trailAccumulator = 0;

function clearTraceObjects() {
  while (traceGroup.children.length) {
    const child = traceGroup.children[traceGroup.children.length - 1];
    traceGroup.remove(child);
    child.geometry?.dispose?.();
    child.material?.dispose?.();
  }
  traced.length = 0;
}

function pickTracedParticles({ preferHeater = false } = {}) {
  clearTraceObjects();
  if (!particles.length) return;
  const all = particles.map((_, i) => i);
  const candidates = [];
  if (preferHeater) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (Math.abs(p.x - heaterX) < 1.15 && p.y < 1.20) candidates.push(i);
    }
  }
  const pool = preferHeater && candidates.length >= TRACE_COUNT ? candidates : all;
  const chosen = shuffle([...pool]).slice(0, TRACE_COUNT);
  for (const index of chosen) {
    const positions = new Float32Array(TRACE_MAX_POINTS * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xe3a43b, transparent: true, opacity: 0.66, depthWrite: false })
    );
    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(PARTICLE_RADIUS * 1.72, PARTICLE_RADIUS * 0.22, 8, 22),
      new THREE.MeshBasicMaterial({ color: 0xe3a43b, transparent: true, opacity: 0.94, depthWrite: false })
    );
    marker.renderOrder = 6;
    traceGroup.add(line, marker);
    traced.push({ index, trail: [], line, marker });
  }
}

function updateTrails(dt) {
  traceGroup.visible = traceToggle.checked;
  if (!traceGroup.visible) return;
  if (!traced.length || traced.some(t => t.index >= particles.length)) pickTracedParticles();
  trailAccumulator += dt;
  const addPoint = trailAccumulator >= 0.065;
  if (addPoint) trailAccumulator = 0;

  for (const item of traced) {
    const p = particles[item.index];
    if (!p) continue;
    if (addPoint) {
      item.trail.push([p.x, p.y, p.z]);
      if (item.trail.length > TRACE_MAX_POINTS) item.trail.shift();
      const attr = item.line.geometry.getAttribute('position');
      for (let i = 0; i < item.trail.length; i++) {
        const q = item.trail[i];
        attr.setXYZ(i, q[0], q[1], q[2]);
      }
      attr.needsUpdate = true;
      item.line.geometry.setDrawRange(0, item.trail.length);
    }
    item.marker.position.set(p.x, p.y, p.z);
    item.marker.quaternion.copy(camera.quaternion);
  }
}

function syncFlowUi() { flowArrowGroup.visible = flowToggle.checked; }
function syncTraceUi({ repick = false } = {}) {
  traceGroup.visible = traceToggle.checked;
  if (traceToggle.checked && (repick || !traced.length)) pickTracedParticles();
}


const sampleGroup = new THREE.Group();
scene.add(sampleGroup);
const sampleBox = { width: 1.65, height: 1.40, depth: 1.45 };
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
    explainText.textContent = 'The relatively cooler, denser liquid sinks and returns underneath. The solved bulk circulation remains slower than the random microscopic particle motion.';
  }
}


let walkthroughActive = false;
let walkthroughStep = -1;
let cameraTween = null;
let walkthroughSavedState = null;

const WALKTHROUGH_CAMERA_MS = 1750;

const walkthroughSteps = [
  {
    title: 'Particles gain kinetic energy',
    text: 'Particles nearest the heater gain energy first. Their random motion becomes more vigorous, so their average kinetic energy increases. The heat glow marks where energy is being supplied; it is only a visual guide.',
    view: () => ({
      position: new THREE.Vector3(heaterX + 2.9, 2.05, 3.05),
      target: new THREE.Vector3(heaterX, 0.58, 0),
    }),
    overlay: 'none', flow: false, trace: false,
  },
  {
    title: 'The heated liquid expands',
    text: 'The warmer particles claim slightly more space in the model, so their average separation increases. The same mass occupies a larger volume: the warmed liquid is less dense. The equal wireframes are passive guides for comparing spacing.',
    view: () => ({
      position: new THREE.Vector3(8.8, 3.65, 5.2),
      target: new THREE.Vector3(0, 1.45, 0),
    }),
    overlay: 'both-volumes', flow: false, trace: false,
  },
  {
    title: 'Warmer, less-dense liquid rises',
    text: 'The less-dense warm liquid rises. Follow the six highlighted representative particles: their microscopic motion stays random, but the solved bulk flow carries them through the rising plume and across the tank.',
    view: () => ({
      position: new THREE.Vector3(10.0, 4.65, 6.25),
      target: new THREE.Vector3(heaterX * 0.35, 1.75, 0),
    }),
    overlay: 'none', flow: false, trace: true,
  },
  {
    title: 'Cooling and sinking complete the convection current',
    text: 'Away from the heater the liquid transfers energy to its surroundings. Particle motion becomes less vigorous and the liquid becomes more closely packed and denser. The live arrows show the bulk velocity the fluid solver is calculating at this instant: warm liquid rises, spreads, cooler liquid sinks, and the return flow closes the current.',
    view: () => ({
      position: new THREE.Vector3(11.8, 5.6, 7.8),
      target: new THREE.Vector3(0, 1.55, 0),
    }),
    overlay: 'none', flow: true, trace: true,
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
  walkthroughPrevBtn.disabled = walkthroughStep === 0;
  walkthroughNextBtn.textContent = walkthroughStep === walkthroughSteps.length - 1 ? 'Finish' : 'Next';

  setWalkthroughOverlay(step.overlay);
  flowToggle.checked = step.flow;
  traceToggle.checked = step.trace;
  syncFlowUi();
  if (step.trace && walkthroughStep === 2) pickTracedParticles({ preferHeater: true });
  syncTraceUi();
  startCameraTween(view.position, view.target);
}

function startWalkthrough() {
  if (walkthroughActive) return;
  walkthroughSavedState = {
    density: densityToggle.checked,
    temperature: temperatureToggle.checked,
    flow: flowToggle.checked,
    trace: traceToggle.checked,
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
  cameraTween = null;
  walkthroughBtn.disabled = false;
  walkthroughStopBtn.disabled = true;
  controls.enabled = true;
  walkthroughBanner.hidden = true;
  walkthroughDots.forEach(dot => dot.classList.remove('active'));

  if (walkthroughSavedState) {
    densityToggle.checked = walkthroughSavedState.density;
    temperatureToggle.checked = walkthroughSavedState.temperature;
    flowToggle.checked = walkthroughSavedState.flow;
    traceToggle.checked = walkthroughSavedState.trace;
    warmCube.visible = true;
    coolCube.visible = true;
    syncDensityUi();
    syncFlowUi();
    syncTraceUi({ repick: traceToggle.checked });
    updateParticleInstances();
    document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';

    if (restoreView) {
      startCameraTween(walkthroughSavedState.cameraPosition, walkthroughSavedState.cameraTarget, 900);
    }
  }
  walkthroughSavedState = null;
  explainText.textContent = 'The bulk current is solved from heating, buoyancy and pressure. Toggle the live flow arrows to inspect that solved field, or trace six representative particles through it.';
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
  if (traceToggle.checked) pickTracedParticles();
});

particleSpeed.addEventListener('input', () => {
  particleSpeedValue.textContent = `${Number(particleSpeed.value).toFixed(1)}×`;
});

temperatureToggle.addEventListener('change', () => {
  document.querySelector('#legend').style.opacity = temperatureToggle.checked ? '1' : '0.45';
  updateParticleInstances();
});

flowToggle.addEventListener('change', syncFlowUi);
traceToggle.addEventListener('change', () => syncTraceUi({ repick: traceToggle.checked }));
densityToggle.addEventListener('change', syncDensityUi);

walkthroughBtn.addEventListener('click', startWalkthrough);
walkthroughStopBtn.addEventListener('click', () => finishWalkthrough(true));
walkthroughPrevBtn.addEventListener('click', () => enterWalkthroughStep(walkthroughStep - 1));
walkthroughNextBtn.addEventListener('click', () => {
  if (walkthroughStep >= walkthroughSteps.length - 1) finishWalkthrough(true);
  else enterWalkthroughStep(walkthroughStep + 1);
});
walkthroughCloseBtn.addEventListener('click', () => finishWalkthrough(true));

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
  updateFlowArrows();
  if (traceGroup.visible) {
    for (const item of traced) item.marker.quaternion.copy(camera.quaternion);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

makeParticles(Number(particleCount.value));
updateSamplePositions();
setHeaterX(heaterX);
updateStatus();
updateHeaterControls();
syncDensityUi();
syncFlowUi();
syncTraceUi();
requestAnimationFrame(animate);
