// V14.2 resilient Three.js loader ------------------------------------------------
// Keep the applet module itself local, and try several CDN mirrors for the one
// external engine dependency. If one provider is temporarily slow/unavailable,
// the next is attempted automatically.
const loadNoticeEarly = document.querySelector('#loadNotice');
const THREE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js',
  'https://unpkg.com/three@0.185.1/build/three.module.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.185.1/three.module.min.js',
];

const THREE_LOAD_TIMEOUT_MS = 8000;

function importWithTimeout(source) {
  const timeout = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Timed out loading ${source}`)),
      THREE_LOAD_TIMEOUT_MS
    );
  });

  return Promise.race([
    import(source).then(module => ({ module, source })),
    timeout,
  ]);
}

let THREE = null;
let threeSourceUsed = '';

for (const source of THREE_SOURCES) {
  try {
    const loaded = await importWithTimeout(source);
    THREE = loaded.module;
    threeSourceUsed = loaded.source;
    break;
  } catch (error) {
    console.warn('Three.js source failed or timed out:', source, error);
  }
}

if (!THREE) {
  if (loadNoticeEarly) {
    loadNoticeEarly.hidden = false;
    loadNoticeEarly.innerHTML =
      '<strong>3D engine could not load.</strong>' +
      '<span>The page loaded, but none of the Three.js mirrors responded within 8 seconds. ' +
      'Please reload or try another network.</span>';
    loadNoticeEarly.classList.add('load-error');
  }
  throw new Error('Unable to load Three.js from any configured source.');
}

// Small local orbit controller so the applet no longer needs a second external
// OrbitControls module. It supports mouse/touch rotation, wheel/pinch zoom,
// damping, target changes and the same public properties used by this applet.
class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3();
    this.enabled = true;
    this.enableDamping = true;
    this.dampingFactor = 0.06;
    this.minDistance = 7.5;
    this.maxDistance = 22;
    this.maxPolarAngle = Math.PI * 0.49;

    this.rotateSpeed = 0.32;
    this.zoomSpeed = 0.00048;
    this._thetaDelta = 0;
    this._phiDelta = 0;
    this._zoomScale = 1;
    this._pointers = new Map();
    this._lastPinch = null;

    this._onPointerDown = (e) => {
      if (!this.enabled) return;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.domElement.setPointerCapture?.(e.pointerId);
      if (this._pointers.size === 2) this._lastPinch = this._pinchDistance();
    };

    this._onPointerMove = (e) => {
      if (!this.enabled || !this._pointers.has(e.pointerId)) return;
      const prev = this._pointers.get(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this._pointers.size === 1) {
        const rect = this.domElement.getBoundingClientRect();
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        this._thetaDelta -= (dx / Math.max(1, rect.width)) * Math.PI * 2 * this.rotateSpeed;
        this._phiDelta -= (dy / Math.max(1, rect.height)) * Math.PI * this.rotateSpeed;
      } else if (this._pointers.size === 2) {
        const dist = this._pinchDistance();
        if (this._lastPinch && dist > 2) {
          const pinchRatio = THREE.MathUtils.clamp(this._lastPinch / dist, 0.965, 1.035);
          this._zoomScale *= pinchRatio;
        }
        this._lastPinch = dist;
      }
    };

    this._onPointerUp = (e) => {
      this._pointers.delete(e.pointerId);
      if (this._pointers.size < 2) this._lastPinch = null;
      try { this.domElement.releasePointerCapture?.(e.pointerId); } catch {}
    };

    this._onWheel = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      const wheel = THREE.MathUtils.clamp(e.deltaY, -120, 120);
      this._zoomScale *= Math.exp(wheel * this.zoomSpeed);
    };

    domElement.addEventListener('pointerdown', this._onPointerDown);
    domElement.addEventListener('pointermove', this._onPointerMove);
    domElement.addEventListener('pointerup', this._onPointerUp);
    domElement.addEventListener('pointercancel', this._onPointerUp);
    domElement.addEventListener('wheel', this._onWheel, { passive: false });
  }

  _pinchDistance() {
    const pts = [...this._pointers.values()];
    if (pts.length < 2) return null;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  update() {
    const offset = this.camera.position.clone().sub(this.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    spherical.theta += this._thetaDelta;
    spherical.phi += this._phiDelta;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.08, this.maxPolarAngle);
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius * this._zoomScale,
      this.minDistance,
      this.maxDistance
    );

    offset.setFromSpherical(spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);

    if (this.enableDamping) {
      const keep = Math.max(0, 1 - this.dampingFactor);
      this._thetaDelta *= keep;
      this._phiDelta *= keep;
      this._zoomScale += (1 - this._zoomScale) * this.dampingFactor;
    } else {
      this._thetaDelta = 0;
      this._phiDelta = 0;
      this._zoomScale = 1;
    }
  }
}

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
scene.background = new THREE.Color(0x30373d);
scene.fog = new THREE.Fog(0x30373d, 12, 23);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(10.7, 5.5, 7.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.60, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.16;
controls.minDistance = 7.5;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.49;

scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb2bf, 2.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
scene.add(keyLight);

// Normalised tweak factors.
const EFFECT_FACTORS = {
  backdropContrast: 1.18,
  arrowThickness: 1.35,
  arrowOpacity: 1.30,
  arrowSaturation: 1.22,
  arrowGlow: 1.18,
  traceVisibility: 1.55,

  // V13 particle-system factors. 1.00 = the Claude packing/motion reference.
  volumeNormalisedPacking: 1.00,
  restSeparation: 0.96,
  thermalSpacing: 0.67,
  packingRelaxation: 0.82,
  langevinMotion: 0.88,
  wallStandOff: 0.12,
  hydrostaticPackingBias: 0.00,
  customContinuityEqualisation: 0.00,

  // V14 geometry/startup factors. 1.00 = V13.
  poolWidth: 0.90,
  heaterTravel: 0.90,
  startupPackingPasses: 0.50,

  // V15 presentation/control factors. 1.00 = V14.2.
  cameraRotateSensitivity: 0.39,
  cameraZoomSensitivity: 0.38,
  cameraDamping: 2.67,
  farFlowArrowLength: 1.55,
};

const TANK = { width: 9.2 * EFFECT_FACTORS.poolWidth, height: 4.10, depth: 2.10 };
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
const HEATER_X_LIMIT = 3.55 * EFFECT_FACTORS.heaterTravel;
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
  drag: 0.48,
  vorticity: 1.52,
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
  new THREE.LineBasicMaterial({ color: 0xa9c2cf, transparent: true, opacity: 0.76 })
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


function halton(index, base) {
  let f = 1;
  let r = 0;
  let i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
}

function uniformVolumePositions(count) {
  // Low-discrepancy 3-D fill: every particle count occupies the WHOLE volume
  // instead of randomly dropping complete lattice cells.
  const width = BOUNDS.xMax - BOUNDS.xMin;
  const height = (SURFACE_Y - 0.025) - BOUNDS.yMin;
  const depth = BOUNDS.zMax - BOUNDS.zMin;
  const points = [];
  const offset = Math.floor(Math.random() * 997) + 1;

  for (let i = 0; i < count; i++) {
    const k = i + offset;
    const x = BOUNDS.xMin + (0.015 + 0.97 * halton(k, 2)) * width;
    const y = BOUNDS.yMin + (0.012 + 0.975 * halton(k, 3)) * height;
    const z = BOUNDS.zMin + (0.015 + 0.97 * halton(k, 5)) * depth;
    points.push({ x, y, z });
  }
  return points;
}

let gaussianSpare = null;
function gaussian() {
  if (gaussianSpare !== null) {
    const out = gaussianSpare;
    gaussianSpare = null;
    return out;
  }
  let u, v, r;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    r = u * u + v * v;
  } while (r === 0 || r >= 1);
  const f = Math.sqrt(-2 * Math.log(r) / r);
  gaussianSpare = v * f;
  return u * f;
}

const PARTICLE_DYNAMICS = {
  packing: 1.06 * EFFECT_FACTORS.restSeparation,
  spacingT: 0.30 * EFFECT_FACTORS.thermalSpacing,
  relaxIters: 2,
  relaxBeta: 0.34 * EFFECT_FACTORS.packingRelaxation,
  jitterTau: 0.26,
  jitterCold: 0.26 * EFFECT_FACTORS.langevinMotion,
  jitterHot: 1.05 * EFFECT_FACTORS.langevinMotion,
  parcelTau: 0.30,
};

const packingState = {
  spacing: 0.30,
  h0: 0.30,
  hmax: 0.50,
  GX: 1, GY: 1, GZ: 1,
  head: new Int32Array(1),
  next: new Int32Array(1),
};

const PACK_NEIGHBOUR_OFFSETS = (() => {
  const out = [];
  for (let oz = -1; oz <= 1; oz++) {
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        if (oz > 0 || (oz === 0 && oy > 0) || (oz === 0 && oy === 0 && ox > 0)) {
          out.push([ox, oy, oz]);
        }
      }
    }
  }
  return out;
})();

function configureVolumePacking(count) {
  const width = BOUNDS.xMax - BOUNDS.xMin;
  const height = (SURFACE_Y - 0.025) - BOUNDS.yMin;
  const depth = BOUNDS.zMax - BOUNDS.zMin;
  const volume = width * height * depth;

  packingState.spacing = Math.cbrt(volume / count);
  packingState.h0 = packingState.spacing * PARTICLE_DYNAMICS.packing * EFFECT_FACTORS.volumeNormalisedPacking;
  packingState.hmax = Math.max(
    1e-3,
    packingState.h0 * (1 + PARTICLE_DYNAMICS.spacingT) * 1.14
  );
  packingState.GX = Math.max(1, Math.ceil(width / packingState.hmax));
  packingState.GY = Math.max(1, Math.ceil(height / packingState.hmax));
  packingState.GZ = Math.max(1, Math.ceil(depth / packingState.hmax));
  packingState.head = new Int32Array(packingState.GX * packingState.GY * packingState.GZ);
  packingState.next = new Int32Array(count);
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

  configureVolumePacking(count);
  const positions = uniformVolumePositions(count);
  particles = positions.map((pos) => ({
    ...pos,
    vx: gaussian() * PARTICLE_DYNAMICS.jitterCold * 0.18,
    vy: gaussian() * PARTICLE_DYNAMICS.jitterCold * 0.18,
    vz: gaussian() * PARTICLE_DYNAMICS.jitterCold * 0.18 * DEPTH_MOTION_SCALE,
    temp: 0,
    seed: Math.random() * 1000,
    packJitter: THREE.MathUtils.lerp(0.95, 1.05, Math.random()),
    _pcx: 0, _pcy: 0, _pcz: 0,
  }));

  // Several position-only sweeps settle the low-discrepancy seed into the
  // count-normalised rest spacing before the first rendered frame.
  const startupPasses = Math.max(1, Math.round(4 * EFFECT_FACTORS.startupPackingPasses));
  for (let i = 0; i < startupPasses; i++) relaxVolumePacking(PARTICLE_DYNAMICS.relaxBeta);
  updateParticleInstances();
}

function resetSimulation() {
  elapsed = 0;
  fluid = new Fluid2D();
  makeParticles(Number(particleCount.value));
  if (traceToggle.checked) pickTracedParticles();
  explainText.textContent = 'The solved bulk flow now carries a volume-normalised particle packing: changing particle count does not create empty pockets because the preferred spacing is recalculated from the whole liquid volume.';
}

function confineParticle(p, localHeat = 0) {
  // V13 uses only a tiny boundary margin. There is no wide repulsive stand-off
  // layer, so the liquid can visually fill right up to the glass.
  const wallInset = Math.max(0.006, PARTICLE_RADIUS * 0.10 * EFFECT_FACTORS.wallStandOff);
  const sideBounce = 0.62;

  if (p.x < BOUNDS.xMin + wallInset) {
    p.x = BOUNDS.xMin + wallInset;
    p.vx = Math.abs(p.vx) * sideBounce;
  } else if (p.x > BOUNDS.xMax - wallInset) {
    p.x = BOUNDS.xMax - wallInset;
    p.vx = -Math.abs(p.vx) * sideBounce;
  }

  if (p.z < BOUNDS.zMin + wallInset) {
    p.z = BOUNDS.zMin + wallInset;
    p.vz = Math.abs(p.vz) * 0.58;
  } else if (p.z > BOUNDS.zMax - wallInset) {
    p.z = BOUNDS.zMax - wallInset;
    p.vz = -Math.abs(p.vz) * 0.58;
  }

  if (p.y < BOUNDS.yMin + wallInset) {
    p.y = BOUNDS.yMin + wallInset;
    p.vy = Math.abs(p.vy) * 0.58;
  }

  // Mostly contained free surface. Hot particles directly in the plume can
  // protrude a little, but the whole population cannot drain out of the top.
  const hotAllowance = 0.025 + 0.085 * localHeat * p.temp;
  const cap = SURFACE_Y + hotAllowance;
  if (p.y > SURFACE_Y) {
    const excess = p.y - SURFACE_Y;
    p.vy -= (4.8 * excess + Math.max(0, p.vy) * 1.35) * 0.016;
  }
  if (p.y > cap) {
    p.y = cap;
    p.vy = Math.min(0, p.vy) * 0.18;
  }
}

function buildPackingGrid() {
  const width = BOUNDS.xMax - BOUNDS.xMin;
  const height = (SURFACE_Y - 0.025) - BOUNDS.yMin;
  const depth = BOUNDS.zMax - BOUNDS.zMin;
  const { GX, GY, GZ, hmax, head, next } = packingState;
  head.fill(-1);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    let cx = Math.floor((p.x - BOUNDS.xMin) / hmax);
    let cy = Math.floor((Math.min(p.y, SURFACE_Y - 0.025) - BOUNDS.yMin) / hmax);
    let cz = Math.floor((p.z - BOUNDS.zMin) / hmax);
    cx = THREE.MathUtils.clamp(cx, 0, GX - 1);
    cy = THREE.MathUtils.clamp(cy, 0, GY - 1);
    cz = THREE.MathUtils.clamp(cz, 0, GZ - 1);
    p._pcx = cx; p._pcy = cy; p._pcz = cz;
    const c = cx + GX * (cy + GY * cz);
    next[i] = head[c];
    head[c] = i;
  }
}

function projectPair(p, q, beta) {
  let dx = q.x - p.x;
  let dy = q.y - p.y;
  let dz = q.z - p.z;
  let d2 = dx * dx + dy * dy + dz * dz;

  const thermal = 1 + PARTICLE_DYNAMICS.spacingT * 0.5 * (p.temp + q.temp);
  const rest = packingState.h0 * thermal * 0.5 * (p.packJitter + q.packJitter);
  if (d2 >= rest * rest) return;

  if (d2 < 1e-10) {
    const a = (p.seed + q.seed) * 0.713;
    dx = Math.cos(a) * 1e-4;
    dy = Math.sin(a * 1.47) * 1e-4;
    dz = Math.sin(a) * 1e-4;
    d2 = dx * dx + dy * dy + dz * dz;
  }
  const d = Math.sqrt(d2);
  const f = beta * (rest - d) * 0.5 / d;
  dx *= f; dy *= f; dz *= f;
  p.x -= dx; p.y -= dy; p.z -= dz;
  q.x += dx; q.y += dy; q.z += dz;
}

function relaxVolumePacking(beta = PARTICLE_DYNAMICS.relaxBeta) {
  if (particles.length < 2) return;
  buildPackingGrid();

  const { GX, GY, GZ, head, next } = packingState;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    let j = head[p._pcx + GX * (p._pcy + GY * p._pcz)];

    // Same cell: unordered pairs once.
    while (j !== -1) {
      if (j > i) projectPair(p, particles[j], beta);
      j = next[j];
    }

    // Thirteen forward neighbour cells.
    for (const [ox, oy, oz] of PACK_NEIGHBOUR_OFFSETS) {
      const cx = p._pcx + ox;
      const cy = p._pcy + oy;
      const cz = p._pcz + oz;
      if (cx < 0 || cx >= GX || cy < 0 || cy >= GY || cz < 0 || cz >= GZ) continue;
      j = head[cx + GX * (cy + GY * cz)];
      while (j !== -1) {
        projectPair(p, particles[j], beta);
        j = next[j];
      }
    }
  }

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const localHeat = Math.exp(-(dx * dx + dz * dz) / Math.pow(HEAT_EFFECT_RADIUS, 2));
    confineParticle(p, localHeat);
  }
}

function updateParticles(dt) {
  const heat = currentHeat();
  const substeps = dt > 0.024 ? 2 : 1;
  for (let s = 0; s < substeps; s++) fluid.step(dt / substeps, heaterX, heat);

  heaterLight.intensity = heaterOn ? 0.25 + heat * 5.1 : 0.0;
  coilMaterial.emissiveIntensity = heaterOn ? 0.35 + heat * 4.3 : 0.05;
  coilMaterial.color.setHex(heaterOn ? 0xa63f2d : 0x4d555a);

  const speedScale = Number(particleSpeed.value);
  const tau = PARTICLE_DYNAMICS.jitterTau;
  const sq = Math.sqrt(2 * dt / tau);
  const decay = Math.min(1, dt / tau);

  for (const p of particles) {
    const dx = p.x - heaterX;
    const dz = p.z - heaterZ;
    const r2 = dx * dx + dz * dz;
    const localHeat = Math.exp(-r2 / Math.pow(HEAT_EFFECT_RADIUS, 2));

    // Like the reference build, the solved 2-D liquid temperature is extruded
    // through the 3-D slab. Depth is used for parallax/random motion rather than
    // artificially weakening the temperature at the front/back.
    const solvedT = fluid.sample(fluid.T, p.x, Math.min(p.y, SURFACE_Y - 0.01));
    p.temp += (solvedT - p.temp) * Math.min(1, dt / PARTICLE_DYNAMICS.parcelTau);
    p.temp = THREE.MathUtils.clamp(p.temp, 0, 1);

    // Ornstein-Uhlenbeck / Langevin thermal jitter. It remains faster than the
    // slower bulk flow, while warmer particles have a larger RMS speed.
    const rms = (PARTICLE_DYNAMICS.jitterCold + PARTICLE_DYNAMICS.jitterHot * p.temp) * speedScale;
    p.vx += -p.vx * decay + gaussian() * rms * sq;
    p.vy += -p.vy * decay + gaussian() * rms * sq;
    p.vz += -p.vz * decay + gaussian() * rms * sq * DEPTH_MOTION_SCALE;

    // Same solved x-y velocity at every z-depth, matching the reference
    // 2-D-fluid / 3-D-tracer construction. This prevents front/back layers from
    // drifting into different packing states.
    const bulk = fluid.velocityAt(p.x, Math.min(p.y, SURFACE_Y - 0.01));

    const nearSurface = Math.exp(-Math.pow((p.y - SURFACE_Y) / 0.30, 2));
    const bubbleLift = heat * localHeat * nearSurface * p.temp * 0.22;

    p.x += (p.vx + bulk.x * FLOW_PARTICLE_SCALE) * dt;
    p.y += (p.vy + bulk.y * FLOW_PARTICLE_SCALE + bubbleLift) * dt;
    p.z += p.vz * dt;

    confineParticle(p, localHeat);
  }

  // The central V13 change: rest separation is derived from the whole water
  // volume and current particle count, then projected position-only. There is
  // no gravity patch and no wide wall-repulsion layer.
  for (let it = 0; it < PARTICLE_DYNAMICS.relaxIters; it++) {
    relaxVolumePacking(PARTICLE_DYNAMICS.relaxBeta);
  }

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


// V13 solved-flow arrows ------------------------------------------------------
const flowArrowGroup = new THREE.Group();
scene.add(flowArrowGroup);
const flowArrows = [];
const arrowRows = 6;
const arrowCols = 11;
const arrowShaftGeometry = new THREE.CylinderGeometry(0.016 * EFFECT_FACTORS.arrowThickness, 0.016 * EFFECT_FACTORS.arrowThickness, 1, 10);
const arrowConeGeometry = new THREE.ConeGeometry(0.045 * EFFECT_FACTORS.arrowThickness, 0.18 * EFFECT_FACTORS.arrowThickness, 14);
const arrowGlowGeometry = new THREE.CylinderGeometry(0.038 * EFFECT_FACTORS.arrowThickness, 0.038 * EFFECT_FACTORS.arrowThickness, 1, 10);
const arrowDir = new THREE.Vector3(0, 1, 0);
const arrowQuat = new THREE.Quaternion();
for (let row = 0; row < arrowRows; row++) {
  for (let col = 0; col < arrowCols; col++) {
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0xd44cff, transparent: true, opacity: 0.76, depthWrite: false });
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xff8df0, transparent: true, opacity: 0.88, depthWrite: false });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff58e6, transparent: true, opacity: 0.24 * EFFECT_FACTORS.arrowGlow, depthWrite: false, blending: THREE.AdditiveBlending });
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(arrowShaftGeometry, shaftMat);
    const cone = new THREE.Mesh(arrowConeGeometry, coneMat);
    const glow = new THREE.Mesh(arrowGlowGeometry, glowMat);
    shaft.renderOrder = 5; cone.renderOrder = 6; glow.renderOrder = 4;
    group.add(glow, shaft, cone);
    flowArrowGroup.add(group);
    flowArrows.push({ group, shaft, cone, glow, shaftMat, coneMat, glowMat, row, col });
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
    const plumeDistance = THREE.MathUtils.clamp(
      Math.abs(x - heaterX) / Math.max(0.1, TANK.width * 0.5),
      0, 1
    );
    const farBoost = THREE.MathUtils.lerp(1.0, EFFECT_FACTORS.farFlowArrowLength, Math.pow(plumeDistance, 0.78));
    const visibilityThreshold = THREE.MathUtils.lerp(0.035, 0.018, plumeDistance);
    if (speed < visibilityThreshold) {
      item.group.visible = false;
      continue;
    }
    item.group.visible = true;
    const dir = new THREE.Vector3(vel.x, vel.y, 0).normalize();
    const length = THREE.MathUtils.clamp((0.12 + speed * 0.40) * farBoost, 0.14, 0.78);
    const shaftLength = Math.max(0.06, length - 0.16 * EFFECT_FACTORS.arrowThickness);
    const coneLength = Math.min(0.18 * EFFECT_FACTORS.arrowThickness, length * 0.34);
    item.group.position.set(x, y, 0);
    arrowQuat.setFromUnitVectors(arrowDir, dir);
    item.group.quaternion.copy(arrowQuat);
    item.glow.scale.set(1, shaftLength, 1);
    item.glow.position.set(0, shaftLength * 0.5, 0);
    item.shaft.scale.set(1, shaftLength, 1);
    item.shaft.position.set(0, shaftLength * 0.5, 0);
    item.cone.scale.setScalar(1);
    item.cone.position.set(0, shaftLength + coneLength * 0.5, 0);
    item.cone.scale.set(1, coneLength / (0.18 * EFFECT_FACTORS.arrowThickness), 1);

    const alpha = THREE.MathUtils.clamp((0.42 + speed / 1.15) * EFFECT_FACTORS.arrowOpacity, 0.44, 0.98);
    item.shaftMat.opacity = Math.min(0.96, alpha * 0.94);
    item.coneMat.opacity = alpha;
    item.glowMat.opacity = Math.min(0.42, 0.16 + speed * 0.08) * EFFECT_FACTORS.arrowGlow;
  }
}

// V10 trace six actual particles ---------------------------------------------
const traceGroup = new THREE.Group();
scene.add(traceGroup);
traceGroup.visible = false;
const TRACE_COUNT = 6;
const TRACE_MAX_POINTS = 104;
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
      new THREE.LineBasicMaterial({ color: 0x77ff3a, transparent: true, opacity: 0.96, depthWrite: false })
    );
    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(PARTICLE_RADIUS * 2.55, PARTICLE_RADIUS * 0.32, 12, 30),
      new THREE.MeshBasicMaterial({ color: 0x7dff48, transparent: true, opacity: 0.99, depthWrite: false })
    );
    marker.renderOrder = 7;
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
    item.line.material.opacity = 0.88 + 0.08 * Math.sin(elapsed * 2.8 + item.index);
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
    text: 'The less-dense warm liquid rises. Follow the six highlighted green representative particles: their microscopic motion stays random, but the solved bulk flow carries them through the rising plume and across the tank.',
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
  explainText.textContent = 'The bulk current is solved from heating, buoyancy and pressure. The particles are also gently re-packed so the liquid continues to fill the vessel while still showing warmer regions as more spread out.';
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
if (loadNoticeEarly) {
  loadNoticeEarly.hidden = true;
  loadNoticeEarly.textContent = '';
}
console.info('Three.js loaded from:', threeSourceUsed);
requestAnimationFrame(animate);
