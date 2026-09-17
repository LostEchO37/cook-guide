/** Interactive 3D globe — textured Earth + labeled food destinations. */

import { FOOD_COUNTRIES } from './food-regions.js';

let THREE = null;
let renderer = null;
let scene = null;
let camera = null;
let globe = null;
let markers = [];
let animId = null;
let dragging = false;
let moved = false;
let lastX = 0;
let lastY = 0;
let rotY = 0.85;
let rotX = 0.18;
let targetRotY = 0.85;
let targetRotX = 0.18;
let onSelect = null;
let raycaster = null;
let pointer = null;
let containerEl = null;
let labelLayer = null;
let hoverId = null;

/** Rough continent silhouettes in equirectangular UV (0–1). */
const CONTINENTS = [
  [[0.12, 0.22], [0.22, 0.18], [0.28, 0.28], [0.26, 0.42], [0.18, 0.48], [0.12, 0.38]],
  [[0.26, 0.48], [0.32, 0.5], [0.3, 0.72], [0.24, 0.78], [0.22, 0.6]],
  [[0.48, 0.22], [0.56, 0.2], [0.58, 0.3], [0.52, 0.34], [0.46, 0.3]],
  [[0.48, 0.34], [0.56, 0.36], [0.58, 0.55], [0.52, 0.68], [0.46, 0.55]],
  [[0.58, 0.2], [0.78, 0.18], [0.88, 0.28], [0.82, 0.45], [0.7, 0.48], [0.58, 0.38]],
  [[0.78, 0.58], [0.88, 0.56], [0.9, 0.68], [0.8, 0.72]],
];

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function drawEarthTexture() {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, '#0b2a4a');
  ocean.addColorStop(0.5, '#123a5c');
  ocean.addColorStop(1, '#0a2240');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(120, 180, 220, 0.07)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 8; i += 1) {
    const y = (h / 8) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 1; i < 16; i += 1) {
    const x = (w / 16) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  CONTINENTS.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([u, v], i) => {
      const x = u * w;
      const y = v * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    const land = ctx.createRadialGradient(
      poly[0][0] * w, poly[0][1] * h, 20,
      poly[0][0] * w, poly[0][1] * h, 280,
    );
    land.addColorStop(0, '#4aa06a');
    land.addColorStop(0.55, '#2f7a4c');
    land.addColorStop(1, '#1e5536');
    ctx.fillStyle = land;
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 230, 180, 0.28)';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  const sheen = ctx.createRadialGradient(w * 0.35, h * 0.3, 40, w * 0.35, h * 0.3, 520);
  sheen.addColorStop(0, 'rgba(255,255,255,0.14)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMarker(country, radius) {
  const pos = latLngToVec3(country.lat, country.lng, radius);
  const group = new THREE.Group();
  group.position.copy(pos);
  group.lookAt(0, 0, 0);
  group.userData = { countryId: country.id };

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.4 }),
  );
  glow.position.z = 0.085;
  group.add(glow);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffe0c0 }),
  );
  core.position.z = 0.1;
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.055, 0.095, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff8c42,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  ring.position.z = 0.08;
  group.add(ring);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hit.position.z = 0.09;
  group.add(hit);

  globe.add(group);
  markers.push({ group, country, ring, glow, core });
}

function ensureLabelLayer() {
  if (labelLayer) return;
  labelLayer = document.createElement('div');
  labelLayer.className = 'globe-labels';
  containerEl.appendChild(labelLayer);

  FOOD_COUNTRIES.forEach((c) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'globe-label';
    el.dataset.country = c.id;
    el.innerHTML = `<span class="globe-label__emoji">${c.emoji}</span><span class="globe-label__name"></span>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onSelect) onSelect(c.id);
    });
    labelLayer.appendChild(el);
  });
}

function updateLabels(lang = 'zh-CN') {
  if (!labelLayer || !camera || !globe) return;
  const rect = containerEl.getBoundingClientRect();
  const tmp = new THREE.Vector3();
  const camDir = camera.position.clone().normalize();

  labelLayer.querySelectorAll('.globe-label').forEach((el) => {
    const country = FOOD_COUNTRIES.find((c) => c.id === el.dataset.country);
    if (!country) return;
    const marker = markers.find((m) => m.country.id === country.id);
    if (!marker) return;

    tmp.copy(marker.group.position);
    tmp.applyMatrix4(globe.matrixWorld);
    const worldNorm = tmp.clone().normalize();
    const facing = worldNorm.dot(camDir) > 0.12;
    tmp.project(camera);

    const x = (tmp.x * 0.5 + 0.5) * rect.width;
    const y = (-tmp.y * 0.5 + 0.5) * rect.height;
    const visible = facing && tmp.z < 1;

    el.classList.toggle('globe-label--hidden', !visible);
    el.classList.toggle('globe-label--hot', hoverId === country.id);
    if (visible) {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -130%)`;
      const name = country.names[lang] || country.names['zh-CN'] || country.names.en;
      el.querySelector('.globe-label__name').textContent = name;
    }
  });
}

function onPointerDown(e) {
  dragging = true;
  moved = false;
  lastX = e.clientX;
  lastY = e.clientY;
  if (renderer) renderer.domElement.style.cursor = 'grabbing';
}

function onPointerMove(e) {
  if (!dragging) {
    updateHover(e);
    return;
  }
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  targetRotY += dx * 0.005;
  targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX + dy * 0.004));
  lastX = e.clientX;
  lastY = e.clientY;
}

function onPointerUp(e) {
  if (!dragging) return;
  dragging = false;
  if (renderer) renderer.domElement.style.cursor = hoverId ? 'pointer' : 'grab';
  if (!moved) tryPick(e);
}

function updateHover(e) {
  if (!raycaster || !camera || !containerEl) return;
  const rect = containerEl.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markers.map((m) => m.group), true);
  let id = null;
  if (hits.length) {
    let obj = hits[0].object;
    while (obj && !obj.userData?.countryId) obj = obj.parent;
    id = obj?.userData?.countryId || null;
  }
  if (id !== hoverId) {
    hoverId = id;
    markers.forEach(({ country, glow, core }) => {
      const hot = country.id === hoverId;
      glow.material.opacity = hot ? 0.7 : 0.4;
      core.scale.setScalar(hot ? 1.4 : 1);
    });
    if (renderer) renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
  }
}

function tryPick(e) {
  if (!raycaster || !camera || !containerEl) return;
  const rect = containerEl.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markers.map((m) => m.group), true);
  if (!hits.length) return;
  let obj = hits[0].object;
  while (obj && !obj.userData?.countryId) obj = obj.parent;
  if (obj?.userData?.countryId && onSelect) onSelect(obj.userData.countryId);
}

function tick() {
  if (!renderer) return;
  animId = requestAnimationFrame(tick);
  if (!dragging) targetRotY += 0.0014;
  rotY += (targetRotY - rotY) * 0.08;
  rotX += (targetRotX - rotX) * 0.08;
  if (globe) {
    globe.rotation.y = rotY;
    globe.rotation.x = rotX;
  }
  const t = performance.now();
  markers.forEach(({ ring }, i) => {
    const pulse = 1 + Math.sin(t * 0.003 + i * 0.7) * 0.2;
    ring.scale.set(pulse, pulse, 1);
  });
  updateLabels(containerEl?.dataset?.lang || 'zh-CN');
  renderer.render(scene, camera);
}

async function loadThree() {
  if (THREE) return THREE;
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  return THREE;
}

export async function initGlobe(container, { onCountrySelect, lang = 'zh-CN' } = {}) {
  destroyGlobe();
  containerEl = container;
  onSelect = onCountrySelect;
  container.dataset.lang = lang;
  await loadThree();

  const w = Math.max(container.clientWidth || 600, 280);
  const h = Math.max(container.clientHeight || 420, 280);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const hint = document.createElement('p');
  hint.className = 'map-globe-hint';
  hint.textContent = String(lang).startsWith('zh')
    ? '拖动旋转 · 点击光点或标签探索美食'
    : 'Drag to spin · tap a glow or label to explore';
  container.appendChild(hint);

  ensureLabelLayer();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.z = 2.65;

  const starGeo = new THREE.BufferGeometry();
  const starCount = 500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 1) starPos[i] = (Math.random() - 0.5) * 24;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.025, transparent: true, opacity: 0.55,
  })));

  globe = new THREE.Group();
  scene.add(globe);

  const radius = 1;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshPhongMaterial({
      map: drawEarthTexture(),
      specular: 0x335577,
      shininess: 18,
      emissive: 0x081828,
      emissiveIntensity: 0.35,
    }),
  );
  globe.add(earth);

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.06, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x4aa3ff, transparent: true, opacity: 0.12, side: THREE.BackSide,
    }),
  ));

  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.12, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff6b35, transparent: true, opacity: 0.06, side: THREE.BackSide,
    }),
  ));

  scene.add(new THREE.AmbientLight(0x6688aa, 0.85));
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.35);
  sun.position.set(4, 2.5, 3);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aadd, 0.35);
  fill.position.set(-3, -1, -2);
  scene.add(fill);

  FOOD_COUNTRIES.forEach((c) => makeMarker(c, radius));

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', () => { dragging = false; hoverId = null; });
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  tick();
}

export function focusCountry(countryId) {
  const country = FOOD_COUNTRIES.find((c) => c.id === countryId);
  if (!country) return;
  targetRotY = (-country.lng * Math.PI) / 180 + Math.PI;
  targetRotX = (country.lat * Math.PI) / 360;
}

export function resizeGlobe() {
  if (!renderer || !camera || !containerEl) return;
  const w = Math.max(containerEl.clientWidth || 600, 280);
  const h = Math.max(containerEl.clientHeight || 420, 280);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

export function setGlobeLang(lang) {
  if (containerEl) containerEl.dataset.lang = lang;
  updateLabels(lang);
}

export function destroyGlobe() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
  }
  if (renderer) {
    renderer.dispose();
    renderer.domElement?.remove();
  }
  labelLayer?.remove();
  labelLayer = null;
  renderer = scene = camera = globe = null;
  markers = [];
  containerEl = null;
  hoverId = null;
}
