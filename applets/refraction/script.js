import * as THREE from './vendor/three.module.min.js';

const DEG = Math.PI / 180;
const sceneBounds = { x: 6.5, y: 2.65, z: 4.25 };
const baseSpeed = 2.9; // scene units per second for n = 1
const sourceFrequency = 1.18; // fixed model frequency; intentionally not student-adjustable
const media = {
  air: { name: 'Air', n: 1.00 },
  water: { name: 'Water', n: 1.33 },
  glass: { name: 'Glass', n: 1.50 },
  diamond: { name: 'Diamond', n: 2.42 }
};

const state = {
  medium1: 'air',
  medium2: 'glass',
  angle: 0,
  running: true,
  timeScale: 1,
  elapsed: 0,
  mode: 'explore',
  guideStep: 0,
  revealed: true,
  view: '3d'
};

const $ = id => document.getElementById(id);
const els = {
  stage: $('three-stage'), m1: $('medium1-select'), m2: $('medium2-select'), n1: $('n1-value'), n2: $('n2-value'),
  angle: $('angle-slider'), angleValue: $('angle-value'), i: $('i-readout'), r: $('r-readout'), swap: $('swap-media'),
  speed: $('speed-readout'), speedNote: $('speed-note'), wavelength: $('wavelength-readout'), wavelengthNote: $('wavelength-note'),
  direction: $('direction-readout'), directionNote: $('direction-note'), status: $('status-badge'), m1Label: $('medium1-label'), m2Label: $('medium2-label'),
  criticalTrack: $('critical-track'), criticalMarker: $('critical-marker'), criticalLabel: $('critical-label'), airEquation: $('air-equation'), criticalEquation: $('critical-equation'),
  wavefronts: $('toggle-wavefronts'), markers: $('toggle-markers'), ray: $('toggle-ray'), normal: $('toggle-normal'), angles: $('toggle-angles'), rulers: $('toggle-rulers'),
  play: $('play-toggle'), slow: $('slow-toggle'), reset: $('reset-sim'), view3d: $('view-3d'), viewFront: $('view-front'), resetView: $('reset-view'),
  guided: $('guided-card'), guideNumber: $('guide-step-number'), guideTitle: $('guide-title'), guideCopy: $('guide-copy'), guideBack: $('guide-back'), guideNext: $('guide-next'),
  test: $('test-card'), feedback: $('prediction-feedback')
};

for (const [key, item] of Object.entries(media)) {
  els.m1.add(new Option(item.name, key));
  els.m2.add(new Option(item.name, key));
}
els.m1.value = state.medium1; els.m2.value = state.medium2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(els.stage.clientWidth, els.stage.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x07162f, 1);
els.stage.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07162f, 12, 24);
const camera = new THREE.PerspectiveCamera(37, els.stage.clientWidth / els.stage.clientHeight, 0.1, 100);
camera.up.set(0, 0, 1);
// Lightweight local camera controls: no Three.js addons are required.
// Mouse/one-finger drag = orbit, wheel/pinch = zoom.
const cameraControls = (() => {
  const canvas = renderer.domElement;
  const target = new THREE.Vector3(0, 0, 0);
  const pointers = new Map();
  let radius = 14.7;
  let azimuth = -0.945;
  let elevation = 0.435;
  let lastPinchDistance = 0;

  function syncFromCamera(){
    const offset = camera.position.clone().sub(target);
    radius = Math.max(7, Math.min(25, offset.length()));
    azimuth = Math.atan2(offset.y, offset.x);
    elevation = Math.asin(Math.max(-1, Math.min(1, offset.z / radius)));
  }
  function update(){
    const ce = Math.cos(elevation);
    camera.position.set(
      target.x + radius * ce * Math.cos(azimuth),
      target.y + radius * ce * Math.sin(azimuth),
      target.z + radius * Math.sin(elevation)
    );
    camera.lookAt(target);
  }
  function orbit(dx, dy){
    azimuth -= dx * 0.006;
    elevation = Math.max(-1.15, Math.min(1.25, elevation + dy * 0.005));
    state.view = '3d';
    els.view3d.classList.add('active');
    els.viewFront.classList.remove('active');
    update();
  }
  function zoom(delta){
    radius = Math.max(7, Math.min(25, radius * Math.exp(delta * 0.0012)));
    update();
  }
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      lastPinchDistance = Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
    }
  });
  canvas.addEventListener('pointermove', e => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const current = {x:e.clientX, y:e.clientY};
    pointers.set(e.pointerId, current);
    if (pointers.size === 1) {
      orbit(current.x-prev.x, current.y-prev.y);
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const d = Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
      if (lastPinchDistance > 0) zoom((lastPinchDistance-d) * 4);
      lastPinchDistance = d;
    }
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinchDistance = 0;
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY); }, {passive:false});

  return {
    target,
    syncFromCamera,
    update,
    setSpherical(r, a, el){ radius=r; azimuth=a; elevation=el; update(); }
  };
})();

scene.add(new THREE.HemisphereLight(0x9fc9ff, 0x16345c, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(5, -4, 9); scene.add(key);

const simGroup = new THREE.Group(); scene.add(simGroup);
const waveGroup = new THREE.Group(); simGroup.add(waveGroup);
const markerGroup = new THREE.Group(); simGroup.add(markerGroup);
const rayGroup = new THREE.Group(); simGroup.add(rayGroup);
const overlayGroup = new THREE.Group(); simGroup.add(overlayGroup);
const rulerGroup = new THREE.Group(); simGroup.add(rulerGroup);
const sourceGroup = new THREE.Group(); simGroup.add(sourceGroup);

const mediumMat1 = new THREE.MeshPhysicalMaterial({ color: 0x3e8ef7, transparent: true, opacity: 0.065, roughness: .28, transmission: .1, depthWrite: false, side: THREE.DoubleSide });
const mediumMat2 = new THREE.MeshPhysicalMaterial({ color: 0x6a7cff, transparent: true, opacity: 0.13, roughness: .25, transmission: .08, depthWrite: false, side: THREE.DoubleSide });
const boxGeo = new THREE.BoxGeometry(sceneBounds.x * 2, sceneBounds.y * 2, sceneBounds.z);
const upperBox = new THREE.Mesh(boxGeo, mediumMat1); upperBox.position.z = sceneBounds.z / 2; simGroup.add(upperBox);
const lowerBox = new THREE.Mesh(boxGeo, mediumMat2); lowerBox.position.z = -sceneBounds.z / 2; simGroup.add(lowerBox);

const interfacePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(sceneBounds.x * 2.03, sceneBounds.y * 2.04),
  new THREE.MeshBasicMaterial({ color: 0x9bd8ff, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false })
);
interfacePlane.rotation.x = Math.PI / 2; interfacePlane.position.z = 0; simGroup.add(interfacePlane);

const grid = new THREE.GridHelper(13, 13, 0x37648e, 0x1d3859); grid.rotation.x = Math.PI / 2; grid.position.z = .003; grid.material.opacity = .17; grid.material.transparent = true; simGroup.add(grid);

function dashedLine(a, b, colour=0xd9efff, opacity=.65) {
  const g = new THREE.BufferGeometry().setFromPoints([a,b]);
  const m = new THREE.LineDashedMaterial({ color: colour, dashSize:.18, gapSize:.12, transparent:true, opacity });
  const l = new THREE.Line(g,m); l.computeLineDistances(); return l;
}
const normalLine = dashedLine(new THREE.Vector3(0,0,-3.6), new THREE.Vector3(0,0,3.6)); overlayGroup.add(normalLine);

const sourcePanel = new THREE.Mesh(new THREE.BoxGeometry(3.3, .32, .16), new THREE.MeshStandardMaterial({ color:0x84d9ff, emissive:0x238ccc, emissiveIntensity:1.6, metalness:.08, roughness:.32 }));
sourceGroup.add(sourcePanel);
const sourceGlow = new THREE.PointLight(0x62cfff, 2.2, 5); sourceGroup.add(sourceGlow);

const frontMaterial = new THREE.MeshBasicMaterial({ color:0x79dcff, transparent:true, opacity:.88, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
const transmittedMaterial = new THREE.MeshBasicMaterial({ color:0xbfeeff, transparent:true, opacity:.95, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
const reflectedMaterial = new THREE.MeshBasicMaterial({ color:0xffb49f, transparent:true, opacity:.48, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
const markerMat1 = new THREE.MeshBasicMaterial({ color:0xdaf7ff });
const markerMat2 = new THREE.MeshBasicMaterial({ color:0xffffff });
const markerMatR = new THREE.MeshBasicMaterial({ color:0xffc3b4 });
const markerGeo = new THREE.SphereGeometry(.055, 8, 8);

const maxFronts = 12;
const waveObjects = [];
for (let k=0;k<maxFronts;k++) {
  const parts = {};
  for (const kind of ['incident','transmitted','reflected']) {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), kind==='incident'?frontMaterial:(kind==='transmitted'?transmittedMaterial:reflectedMaterial));
    mesh.frustumCulled = false; waveGroup.add(mesh);
    parts[kind] = mesh;
  }
  const markers = {};
  for (const kind of ['incident','transmitted','reflected']) {
    const arr=[];
    for(let j=0;j<11;j++){ const s=new THREE.Mesh(markerGeo, kind==='incident'?markerMat1:(kind==='transmitted'?markerMat2:markerMatR)); markerGroup.add(s); arr.push(s); }
    markers[kind]=arr;
  }
  waveObjects.push({ parts, markers });
}

function clearGroup(group) { while(group.children.length) group.remove(group.children[0]); }
function makeLine(points, colour, width=1, opacity=1) {
  const g=new THREE.BufferGeometry().setFromPoints(points); const m=new THREE.LineBasicMaterial({color:colour,transparent:opacity<1,opacity}); const l=new THREE.Line(g,m); l.userData.width=width; return l;
}

function refractData() {
  const n1 = media[state.medium1].n, n2 = media[state.medium2].n;
  const i = state.angle * DEG;
  const sinR = n1/n2 * Math.sin(i);
  const tir = n1 > n2 && sinR > 1 - 1e-9;
  const critical = n1 > n2 ? Math.asin(n2/n1)/DEG : null;
  const r = tir ? null : Math.asin(Math.max(-1,Math.min(1,sinR)))/DEG;
  return { n1,n2,iDeg:state.angle,rDeg:r,tir,critical,v1:1/n1,v2:1/n2 };
}

function segmentForFront(thetaDeg, speed, timePhase, mediumSign, reflected=false) {
  const th = thetaDeg * DEG;
  const d = new THREE.Vector2(Math.sin(th), reflected ? Math.cos(th) : -Math.cos(th)); // x,z
  const t = new THREE.Vector2(Math.cos(th), reflected ? -Math.sin(th) : Math.sin(th));
  const s = speed * timePhase;
  const c = d.clone().multiplyScalar(s);
  const pts=[];
  for(let j=0;j<160;j++) {
    const u=-10 + 20*j/159;
    const p=c.clone().add(t.clone().multiplyScalar(u));
    const inMedium = mediumSign>0 ? p.y>=0 : p.y<=0;
    if(inMedium && Math.abs(p.x)<=sceneBounds.x+0.3 && Math.abs(p.y)<=sceneBounds.z+0.3) pts.push(new THREE.Vector3(p.x,0,p.y));
  }
  return pts;
}

function ribbonGeometry(points) {
  if(points.length<2) return new THREE.BufferGeometry();
  const yA=-sceneBounds.y*.88, yB=sceneBounds.y*.88;
  const pos=[];
  for(let i=0;i<points.length;i++) { const p=points[i]; pos.push(p.x,yA,p.z,p.x,yB,p.z); }
  const idx=[];
  for(let i=0;i<points.length-1;i++){ const a=i*2,b=a+1,c=a+2,d=a+3; idx.push(a,b,c,b,d,c); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

function setMeshPoints(mesh, points){ mesh.geometry.dispose(); mesh.geometry=ribbonGeometry(points); mesh.visible = points.length>1; }
function setMarkers(arr, points) {
  const usable=points.length>2;
  for(let j=0;j<arr.length;j++) {
    const m=arr[j];
    if(!usable){m.visible=false;continue;}
    const idx=Math.floor(j*(points.length-1)/(arr.length-1)); const p=points[idx];
    m.position.set(p.x,0,p.z); m.visible=true;
  }
}

function updateWavefronts() {
  const D=refractData();
  const i=D.iDeg, r=D.rDeg ?? 0;
  const v1=baseSpeed/D.n1, v2=baseSpeed/D.n2;
  const lambda1=v1/sourceFrequency;
  const period=1/sourceFrequency;
  const t0=state.elapsed;
  const showTransmission = !D.tir && state.revealed;
  const showReflection = state.revealed && (D.n1>D.n2 || D.tir);
  const reflectionOpacity = D.tir ? .92 : .28;
  reflectedMaterial.opacity=reflectionOpacity;

  for(let k=0;k<maxFronts;k++) {
    // Negative phase offsets create a train of fronts. Shift so fronts populate both media after steady-state.
    const timePhase=t0 - k*period + 2.2;
    let inc=[],trans=[],refl=[];
    if(Math.abs(i)<0.01) {
      const zInc=sceneBounds.z - v1*timePhase;
      const zTrans= -v2*Math.max(0, timePhase-sceneBounds.z/v1);
      if(zInc>=0 && zInc<=sceneBounds.z) inc=[new THREE.Vector3(-sceneBounds.x,0,zInc),new THREE.Vector3(sceneBounds.x,0,zInc)];
      if(timePhase>=sceneBounds.z/v1 && zTrans>=-sceneBounds.z) trans=[new THREE.Vector3(-sceneBounds.x,0,zTrans),new THREE.Vector3(sceneBounds.x,0,zTrans)];
    } else {
      inc=segmentForFront(i,v1,timePhase,1,false);
      if(showTransmission) trans=segmentForFront(r,v2,timePhase,-1,false);
      if(showReflection) refl=segmentForFront(i,v1,timePhase,1,true);
    }
    setMeshPoints(waveObjects[k].parts.incident,inc);
    setMeshPoints(waveObjects[k].parts.transmitted,trans);
    setMeshPoints(waveObjects[k].parts.reflected,refl);
    setMarkers(waveObjects[k].markers.incident,inc);
    setMarkers(waveObjects[k].markers.transmitted,trans);
    setMarkers(waveObjects[k].markers.reflected,refl);
  }
  waveGroup.visible=els.wavefronts.checked;
  markerGroup.visible=els.markers.checked && els.wavefronts.checked;
  void lambda1;
}

function raySegment(start, dir, length, colour, opacity=1) {
  const end=start.clone().add(dir.clone().multiplyScalar(length));
  const line=makeLine([start,end],colour,1,opacity); rayGroup.add(line);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.1,.32,12),new THREE.MeshBasicMaterial({color:colour,transparent:opacity<1,opacity}));
  cone.position.copy(end.clone().add(start).multiplyScalar(.5));
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  rayGroup.add(cone);
}
function updateRays() {
  clearGroup(rayGroup);
  if(!els.ray.checked) return;
  const D=refractData(); const i=D.iDeg*DEG;
  const d1=new THREE.Vector3(Math.sin(i),0,-Math.cos(i));
  const start=new THREE.Vector3(-Math.tan(i)*3.7,0,3.7);
  const hit=new THREE.Vector3(0,0,0);
  raySegment(start,d1,start.distanceTo(hit),0x87e7ff,.95);
  if(!state.revealed) return;
  if(D.tir){ const dr=new THREE.Vector3(Math.sin(i),0,Math.cos(i)); raySegment(hit,dr,5.3,0xff9d88,1); }
  else { const rr=(D.rDeg??0)*DEG; const dt=new THREE.Vector3(Math.sin(rr),0,-Math.cos(rr)); raySegment(hit,dt,5.3,0xb8f2ff,1);
    if(D.n1>D.n2 && D.iDeg>0){ const dr=new THREE.Vector3(Math.sin(i),0,Math.cos(i)); raySegment(hit,dr,4.2,0xff9d88,.32); }
  }
}

function arcPoints(radius,a1,a2,zSign){ const pts=[]; for(let j=0;j<=28;j++){ const a=a1+(a2-a1)*j/28; pts.push(new THREE.Vector3(Math.sin(a)*radius,0,zSign*Math.cos(a)*radius)); } return pts; }
function updateOverlays() {
  clearGroup(overlayGroup); clearGroup(rulerGroup);
  if(els.normal.checked) overlayGroup.add(dashedLine(new THREE.Vector3(0,0,-3.6),new THREE.Vector3(0,0,3.6)));
  const D=refractData();
  if(els.angles.checked && D.iDeg>0){
    overlayGroup.add(makeLine(arcPoints(.78,0,D.iDeg*DEG,1),0x8fe9ff));
    if(!D.tir && state.revealed) overlayGroup.add(makeLine(arcPoints(.72,0,(D.rDeg??0)*DEG,-1),0xc9f6ff));
  }
  if(els.rulers.checked){
    const spacing1=(baseSpeed/D.n1)/sourceFrequency, spacing2=(baseSpeed/D.n2)/sourceFrequency;
    const x=-4.9;
    const p1=[new THREE.Vector3(x,0,2.65),new THREE.Vector3(x,0,2.65-spacing1)];
    const p2=[new THREE.Vector3(x,0,-1.2),new THREE.Vector3(x,0,-1.2-spacing2)];
    rulerGroup.add(makeLine(p1,0x6edcff)); rulerGroup.add(makeLine(p2,0xffffff));
    for(const p of [...p1,...p2]){ const tick=makeLine([new THREE.Vector3(p.x-.18,0,p.z),new THREE.Vector3(p.x+.18,0,p.z)],0xffffff); rulerGroup.add(tick); }
  }
}

function updateSource(){ const i=state.angle*DEG; sourceGroup.rotation.y=-i; sourceGroup.position.set(-Math.tan(i)*3.7,0,3.82); }

function fmt(x,d=2){return Number(x).toFixed(d)}
function updateUI() {
  const D=refractData(), m1=media[state.medium1],m2=media[state.medium2];
  els.n1.textContent=fmt(D.n1); els.n2.textContent=fmt(D.n2);
  els.angleValue.textContent=`${D.iDeg.toFixed(0)}°`; els.i.textContent=`${D.iDeg.toFixed(0)}°`; els.r.textContent=(!state.revealed && state.mode==='test')?'?':(D.tir?'—':`${(D.rDeg??0).toFixed(1)}°`);
  els.m1Label.textContent=`Medium 1 · ${m1.name} · n = ${fmt(D.n1)}`; els.m2Label.textContent=`Medium 2 · ${m2.name} · n = ${fmt(D.n2)}`;
  const s1=1/D.n1,s2=1/D.n2;
  els.speed.textContent=`${fmt(s1)}c → ${fmt(s2)}c`; els.wavelength.textContent=`${fmt(s1)}λ₀ → ${fmt(s2)}λ₀`;
  if(Math.abs(s1-s2)<1e-4){ els.speedNote.textContent='unchanged'; els.wavelengthNote.textContent='unchanged'; }
  else if(s2<s1){ els.speedNote.textContent='decreases'; els.wavelengthNote.textContent='decreases'; }
  else { els.speedNote.textContent='increases'; els.wavelengthNote.textContent='increases'; }

  els.status.className='status-badge';
  if(!state.revealed && state.mode==='test'){
    els.direction.textContent='PREDICT'; els.directionNote.textContent='choose before revealing'; els.status.textContent='Prediction mode'; els.status.classList.add('neutral');
  } else if(D.iDeg===0){ els.direction.textContent='UNCHANGED'; els.directionNote.textContent='normal incidence'; els.status.textContent='Normal incidence'; els.status.classList.add('neutral'); }
  else if(D.tir){ els.direction.textContent='TIR'; els.directionNote.textContent='no transmitted ray'; els.status.textContent='Total internal reflection'; els.status.classList.add('tir'); }
  else if(D.rDeg < D.iDeg-.05){ els.direction.textContent='TOWARDS'; els.directionNote.textContent='towards the normal'; els.status.textContent='Bends towards normal'; els.status.classList.add('towards'); }
  else if(D.rDeg > D.iDeg+.05){ els.direction.textContent='AWAY'; els.directionNote.textContent='away from normal'; els.status.textContent='Bends away from normal'; els.status.classList.add('away'); }
  else { els.direction.textContent='UNCHANGED'; els.directionNote.textContent='same wave speed'; els.status.textContent='No refraction'; }

  if(D.n1>D.n2){
    els.criticalTrack.hidden=false; const pct=Math.min(100,D.critical/80*100); els.criticalMarker.style.left=`${pct}%`; els.criticalLabel.style.left=`${pct}%`; els.criticalLabel.textContent=`c = ${D.critical.toFixed(1)}°`;
  } else els.criticalTrack.hidden=true;

  const airToMaterial=D.n1<=1.01 && D.n2>D.n1;
  els.airEquation.hidden=!airToMaterial;
  els.criticalEquation.hidden=!(D.n2<=1.01 && D.n1>D.n2);
}

function expectedPrediction(){ const D=refractData(); if(D.tir) return 'tir'; if(D.iDeg===0 || Math.abs(D.n1-D.n2)<1e-5) return 'straight'; return D.rDeg<D.iDeg?'towards':'away'; }
function clearPrediction(){ state.revealed=state.mode!=='test'; els.feedback.textContent=state.mode==='test'?'Choose before revealing the result.':''; els.feedback.className='prediction-feedback'; document.querySelectorAll('[data-prediction]').forEach(b=>b.classList.remove('correct','wrong')); }

const guideSteps=[
  ['Watch the source','Each wavefront is emitted after the same time interval. The source frequency stays fixed.'],
  ['Cross normally','At normal incidence the direction stays the same, but the wave moves at a different speed in the new medium.'],
  ['Compare spacing','Because frequency is unchanged, a lower wave speed means a shorter wavelength.'],
  ['Enter at an angle','One part of the wavefront reaches the boundary first. Its speed changes before the rest of the front has crossed.'],
  ['Follow the wavefront','The changed spacing and wavefront orientation give the new direction. The ray is drawn perpendicular to the wavefront.']
];
function updateGuide(){ const [title,copy]=guideSteps[state.guideStep]; els.guideNumber.textContent=`${state.guideStep+1} / ${guideSteps.length}`; els.guideTitle.textContent=title; els.guideCopy.textContent=copy; els.guideBack.disabled=state.guideStep===0; els.guideNext.textContent=state.guideStep===guideSteps.length-1?'Finish':'Next'; }

function setMode(mode){ state.mode=mode; document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode)); els.guided.hidden=mode!=='guided'; els.test.hidden=mode!=='test'; if(mode==='guided'){state.guideStep=0;updateGuide();state.revealed=true;} clearPrediction(); updateUI(); updateRays(); updateOverlays(); updateWavefronts(); }
function setPreset(name){ document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',b.dataset.preset===name));
  if(name==='normal'){state.medium1='air';state.medium2='glass';state.angle=0;}
  if(name==='higher'){state.medium1='air';state.medium2='glass';state.angle=35;}
  if(name==='lower'){state.medium1='glass';state.medium2='air';state.angle=30;}
  if(name==='critical'){state.medium1='glass';state.medium2='air';state.angle=Math.asin(1/1.5)/DEG;}
  if(name==='tir'){state.medium1='glass';state.medium2='air';state.angle=52;}
  state.angle=Math.max(0,Math.min(80,state.angle)); els.m1.value=state.medium1;els.m2.value=state.medium2;els.angle.value=Math.round(state.angle);state.elapsed=0;clearPrediction();refreshAll(); }

function refreshAll(){ updateUI();updateSource();updateRays();updateOverlays();updateWavefronts(); }

els.m1.addEventListener('change',()=>{state.medium1=els.m1.value;state.elapsed=0;clearPrediction();refreshAll()});
els.m2.addEventListener('change',()=>{state.medium2=els.m2.value;state.elapsed=0;clearPrediction();refreshAll()});
els.swap.addEventListener('click',()=>{[state.medium1,state.medium2]=[state.medium2,state.medium1];els.m1.value=state.medium1;els.m2.value=state.medium2;state.elapsed=0;clearPrediction();refreshAll()});
els.angle.addEventListener('input',()=>{state.angle=Number(els.angle.value);state.elapsed=0;clearPrediction();refreshAll()});
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
[els.wavefronts,els.markers,els.ray,els.normal,els.angles,els.rulers].forEach(el=>el.addEventListener('change',refreshAll));
els.play.addEventListener('click',()=>{state.running=!state.running;els.play.textContent=state.running?'Pause':'Play'});
els.slow.addEventListener('click',()=>{state.timeScale=state.timeScale===1?.5:1;els.slow.textContent=state.timeScale===1?'½ speed':'Normal speed'});
els.reset.addEventListener('click',()=>{state.elapsed=0;state.running=true;state.timeScale=1;els.play.textContent='Pause';els.slow.textContent='½ speed';clearPrediction();refreshAll()});
els.guideBack.addEventListener('click',()=>{if(state.guideStep>0){state.guideStep--;updateGuide()}});
els.guideNext.addEventListener('click',()=>{if(state.guideStep<guideSteps.length-1){state.guideStep++;updateGuide()}else setMode('explore')});
document.querySelectorAll('[data-prediction]').forEach(b=>b.addEventListener('click',()=>{ const p=b.dataset.prediction, exp=expectedPrediction(); document.querySelectorAll('[data-prediction]').forEach(x=>x.classList.remove('correct','wrong')); b.classList.add(p===exp?'correct':'wrong'); els.feedback.textContent=p===exp?'Correct — now compare the wavefront spacing and direction.':'Not quite — reveal the wavefronts and follow what happens at the boundary.'; els.feedback.className=`prediction-feedback ${p===exp?'good':'bad'}`; state.revealed=true; updateUI(); updateRays(); updateOverlays(); updateWavefronts(); }));

function setTeachingView(){ camera.position.set(7.8,-10.8,6.2);camera.up.set(0,0,1);cameraControls.target.set(0,0,0);cameraControls.syncFromCamera();camera.lookAt(cameraControls.target);state.view='3d';els.view3d.classList.add('active');els.viewFront.classList.remove('active'); }
function setFrontView(){ camera.position.set(0,-14.4,.1);camera.up.set(0,0,1);cameraControls.target.set(0,0,0);cameraControls.syncFromCamera();camera.lookAt(cameraControls.target);state.view='front';els.viewFront.classList.add('active');els.view3d.classList.remove('active'); }
els.view3d.addEventListener('click',setTeachingView); els.viewFront.addEventListener('click',setFrontView); els.resetView.addEventListener('click',()=>state.view==='front'?setFrontView():setTeachingView());

function resize(){ const w=els.stage.clientWidth,h=els.stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix(); }
window.addEventListener('resize',resize);

setTeachingView(); setMode('explore'); setPreset('normal');
window.__refractionReady=true; $('load-error').hidden=true;
let last=performance.now();
function animate(now){ requestAnimationFrame(animate); const dt=Math.min(.04,(now-last)/1000);last=now;if(state.running){state.elapsed+=dt*state.timeScale;updateWavefronts();}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
