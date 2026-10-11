import * as THREE from 'three';
import { MAX_DPR } from './constants';

export interface ThreeScene {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  dispose: () => void;
  setScrollProgress: (p: number) => void;
  setMouseTilt: (mx: number, my: number) => void;
  setBlueprintMode: (on: boolean) => void;
}

// ── Easing ────────────────────────────────────────────────────────────────
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// ── Decorative Art-Deco cover texture (drawn on a 2D canvas) ────────────────
function makeCoverTexture(): THREE.CanvasTexture {
  const W = 620, H = 840;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;

  // Background — light blue, like an elegant cloth binding
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#d6eefb');
  bg.addColorStop(0.5, '#a9d8ef');
  bg.addColorStop(1, '#7cc0e2');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Subtle vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, 'rgba(255,255,255,0.25)');
  vg.addColorStop(1, 'rgba(10,60,90,0.28)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);

  const GOLD = '#c99a3a';     // deep gold frame
  const GOLD_DIM = '#a57c2c';
  const TITLE = '#0c3a5c';    // deep navy — reads clearly on light blue

  // Double gold frame
  g.strokeStyle = GOLD;
  g.lineWidth = 6;
  g.strokeRect(34, 34, W - 68, H - 68);
  g.lineWidth = 2.5;
  g.strokeStyle = GOLD_DIM;
  g.strokeRect(48, 48, W - 96, H - 96);

  // Art-Deco sunburst fan at top
  g.save();
  g.translate(W / 2, 150);
  g.strokeStyle = GOLD;
  g.lineWidth = 2;
  for (let i = -6; i <= 6; i++) {
    const a = (Math.PI / 2) + (i / 6) * (Math.PI * 0.42);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * 118, -Math.sin(a) * 118);
    g.stroke();
  }
  // crowning arcs
  g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 122, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.lineWidth = 1.5;
  g.beginPath(); g.arc(0, 0, 134, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  g.restore();

  // Title
  g.textAlign = 'center';
  g.fillStyle = TITLE;
  g.font = '700 92px Georgia, "Times New Roman", serif';
  g.shadowColor = 'rgba(255,255,255,0.45)';
  g.shadowBlur = 6;
  g.fillText('PREPD', W / 2, H / 2 - 20);

  // Thin rule between the two words
  g.shadowBlur = 0;
  g.strokeStyle = GOLD;
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(W / 2 - 150, H / 2 + 16); g.lineTo(W / 2 - 40, H / 2 + 16); g.stroke();
  g.beginPath(); g.moveTo(W / 2 + 40, H / 2 + 16); g.lineTo(W / 2 + 150, H / 2 + 16); g.stroke();
  // center diamond
  g.save();
  g.translate(W / 2, H / 2 + 16);
  g.rotate(Math.PI / 4);
  g.strokeRect(-7, -7, 14, 14);
  g.restore();

  g.fillStyle = TITLE;
  g.font = '700 80px Georgia, "Times New Roman", serif';
  g.fillText('STUDY', W / 2, H / 2 + 108);

  // Lower flourish + tagline
  g.save();
  g.translate(W / 2, H - 170);
  g.strokeStyle = GOLD;
  g.lineWidth = 2;
  for (let i = -5; i <= 5; i++) {
    const a = (Math.PI / 2) - (i / 5) * (Math.PI * 0.38);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * 70, Math.sin(a) * 70);
    g.stroke();
  }
  g.restore();

  g.fillStyle = GOLD_DIM;
  g.font = '600 30px Georgia, serif';
  g.fillText('· A P   E X A M   P R E P ·', W / 2, H - 70);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ── Ruled page texture ──────────────────────────────────────────────────────
function makePageTexture(): THREE.CanvasTexture {
  const W = 360, H = 480;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;

  g.fillStyle = '#f6efdc';
  g.fillRect(0, 0, W, H);

  // faint ruled lines
  g.strokeStyle = 'rgba(120,140,160,0.28)';
  g.lineWidth = 1;
  for (let y = 70; y < H - 40; y += 30) {
    g.beginPath(); g.moveTo(44, y); g.lineTo(W - 34, y); g.stroke();
  }
  // margin line
  g.strokeStyle = 'rgba(210,120,120,0.35)';
  g.beginPath(); g.moveTo(44, 40); g.lineTo(44, H - 34); g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createThreeScene(canvas: HTMLCanvasElement): ThreeScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ── Lights — brighter than before so the cover art reads ──────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff4d8, 2.4);
  keyLight.position.set(2, 3.5, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8fd4e0, 0.8);
  fillLight.position.set(-2.5, -1, 3);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x14324a, 0.5);
  backLight.position.set(0, -3, -2);
  scene.add(backLight);

  // Warm halo near the cover
  const glowLight = new THREE.PointLight(0xf5c842, 1.6, 7, 2);
  glowLight.position.set(0.3, 0.4, 2.2);
  scene.add(glowLight);

  const baseLight = {
    ambient: ambient.intensity,
    key: keyLight.intensity,
    fill: fillLight.intensity,
    glow: glowLight.intensity,
  };

  // ── Textures + materials ──────────────────────────────────────────────────
  const coverTex = makeCoverTexture();
  const pageTex  = makePageTexture();

  const coverFaceMat = new THREE.MeshStandardMaterial({
    map: coverTex, roughness: 0.55, metalness: 0.2,
  });
  const coverSideMat = new THREE.MeshStandardMaterial({
    color: 0x7cc0e2, roughness: 0.6, metalness: 0.12,
  });
  const coverBackMat = new THREE.MeshStandardMaterial({
    color: 0x9ad0ec, roughness: 0.65, metalness: 0.08,
  });
  const pagesMat = new THREE.MeshStandardMaterial({
    color: 0xf2e9d2, roughness: 0.92, metalness: 0,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    map: pageTex, color: 0xffffff, roughness: 0.95, metalness: 0,
    side: THREE.DoubleSide,
  });
  const goldEdgeMat = new THREE.LineBasicMaterial({ color: 0xc99a3a });

  // Front cover: decorative art only on the outward (+z) face
  const frontFaceMats = [
    coverSideMat, coverSideMat,       // +x, -x
    coverSideMat, coverSideMat,       // +y, -y
    coverFaceMat, coverBackMat,       // +z (art), -z
  ];

  // ── Geometry ──────────────────────────────────────────────────────────────
  const SPINE_X  = -0.775;
  const COVER_W  = 1.55;
  const COVER_H  = 2.10;
  const COVER_D  = 0.07;
  const PAGES_W  = 1.42;
  const PAGES_H  = 2.00;
  const PAGES_D  = 0.40;
  const PAGES_TOP_Z = PAGES_D / 2;              // +0.20

  const group = new THREE.Group();

  // Back cover (static)
  const backGeo  = new THREE.BoxGeometry(COVER_W, COVER_H, COVER_D);
  const backMesh = new THREE.Mesh(backGeo, coverSideMat);
  backMesh.position.set(0.02, 0, -(PAGES_D / 2 + COVER_D / 2));
  group.add(backMesh);

  // Pages block (static fore-edge / gilt)
  const pagesGeo  = new THREE.BoxGeometry(PAGES_W, PAGES_H, PAGES_D);
  const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
  pagesMesh.position.set(0.04, 0, 0);
  group.add(pagesMesh);

  const pagesEdgeGeo = new THREE.EdgesGeometry(pagesGeo, 20);
  const pagesEdges   = new THREE.LineSegments(pagesEdgeGeo, goldEdgeMat);
  pagesEdges.position.copy(pagesMesh.position);
  group.add(pagesEdges);

  // Spine (static)
  const spineGeo  = new THREE.BoxGeometry(COVER_D, COVER_H, PAGES_D + COVER_D * 2);
  const spineMesh = new THREE.Mesh(spineGeo, coverSideMat);
  spineMesh.position.set(SPINE_X, 0, 0);
  group.add(spineMesh);

  // ── Turning leaves (individual pages hinged at the spine) ─────────────────
  const NLEAVES = 9;
  const leafPivots: THREE.Group[] = [];
  // leaves are a touch smaller than the covers so they tuck neatly inside
  const leafW = PAGES_W - 0.14;   // 1.28
  const leafH = PAGES_H - 0.14;   // 1.86
  // leaves live in the thin gap between the top of the page block and the front cover
  const leafZ0 = PAGES_TOP_Z + 0.002;
  const leafGap = 0.004;

  for (let i = 0; i < NLEAVES; i++) {
    const pivot = new THREE.Group();
    pivot.position.set(SPINE_X, 0, leafZ0 + i * leafGap);

    const leafGeo = new THREE.PlaneGeometry(leafW, leafH);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    // hinge at the spine: the plane's centre sits half a width to the +x of the pivot
    leaf.position.set((leafW / 2) + 0.05, 0, 0);
    pivot.add(leaf);
    group.add(pivot);
    leafPivots.push(pivot);
  }

  // Front cover pivot — rotates around spine for the "open book" effect
  const frontPivot = new THREE.Group();
  frontPivot.position.set(SPINE_X, 0, PAGES_D / 2 + COVER_D / 2);
  group.add(frontPivot);

  const frontGeo  = new THREE.BoxGeometry(COVER_W, COVER_H, COVER_D);
  const frontMesh = new THREE.Mesh(frontGeo, frontFaceMats);
  frontMesh.position.set(-SPINE_X, 0, 0); // offset so it hinges at the spine
  frontPivot.add(frontMesh);

  const frontEdgeGeo = new THREE.EdgesGeometry(frontGeo, 20);
  const frontEdges   = new THREE.LineSegments(frontEdgeGeo, goldEdgeMat);
  frontEdges.position.copy(frontMesh.position);
  frontPivot.add(frontEdges);

  scene.add(group);

  // Collect meshes + edges for blueprint toggle
  const allMeshes: THREE.Mesh[]        = [];
  const allEdges: THREE.LineSegments[] = [];
  group.traverse(obj => {
    if (obj instanceof THREE.Mesh)              allMeshes.push(obj);
    else if (obj instanceof THREE.LineSegments) allEdges.push(obj);
  });

  // ── State ─────────────────────────────────────────────────────────────────
  let targetP = 0, currentP = 0;
  let mx = 0, my = 0, lmx = 0, lmy = 0;
  let isBlueprintMode = false;
  let animId: number;
  const clock = new THREE.Clock();

  function setScrollProgress(p: number) { targetP = p; }
  function setMouseTilt(x: number, y: number) { mx = x; my = y; }

  function setBlueprintMode(on: boolean) {
    if (on === isBlueprintMode) return;
    isBlueprintMode = on;
    allMeshes.forEach(m => { m.visible = !on; });
    allEdges.forEach(e => {
      (e.material as THREE.LineBasicMaterial).color.setHex(on ? 0x1a2040 : 0xc99a3a);
    });
    ambient.intensity   = on ? 0 : baseLight.ambient;
    keyLight.intensity  = on ? 0 : baseLight.key;
    fillLight.intensity = on ? 0 : baseLight.fill;
    glowLight.intensity = on ? 0 : baseLight.glow;
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    const elapsed = clock.getElapsedTime();

    currentP += (targetP - currentP) * 0.085;
    lmx += (mx - lmx) * 0.055;
    lmy += (my - lmy) * 0.055;

    const p = currentP;

    // Scale in over first 10%
    const scaleIn = p < 0.1 ? p / 0.1 : 1;

    // Floating Y oscillation + gentle breathing
    group.position.y = Math.sin(elapsed * 0.6) * 0.09;

    // Slow Y rotation + mouse parallax
    group.rotation.y += 0.0022;
    group.rotation.x  = lmy * -0.12;
    group.rotation.z  = lmx * -0.05;

    // Camera fly-in: p 0.10–0.28 → z 6→4
    const flyT = easeInOut(clamp01((p - 0.1) / 0.18));
    camera.position.z = 6 - flyT * 2;

    // Cover open: p 0.30–0.42, close back: p 0.66–0.80 (both eased)
    const openT  = easeInOut(clamp01((p - 0.30) / 0.12));
    const closeT = easeInOut(clamp01((p - 0.66) / 0.14));
    const coverOpen = openT - closeT;
    frontPivot.rotation.y = coverOpen * -2.75;

    // Gentle page riffle while the book is open — a travelling lift that
    // sweeps across the stack and back, so pages flutter without any single
    // sheet swinging out toward the camera. Triangle 0→1→0 over p 0.40–0.66.
    const riffM = clamp01((p - 0.40) / 0.26);
    const riffle = riffM < 0.5 ? riffM * 2 : (1 - riffM) * 2; // 0 → 1 → 0
    for (let i = 0; i < NLEAVES; i++) {
      // wave position for this leaf; each lifts in turn as the wave passes
      const phase = riffle * (NLEAVES + 2) - i;
      const bump  = Math.sin(clamp01(phase / 2) * Math.PI); // 0 → 1 → 0 hump
      // slight resting fan when the book is open so the stack looks layered
      const rest  = coverOpen * 0.05 * ((i + 1) / NLEAVES);
      leafPivots[i].rotation.y = -(rest + bump * 0.30); // max ~20°, stays tucked
    }

    // Fade out: p 0.92–1.0
    const fadeOut = 1 - easeInOut(clamp01((p - 0.92) / 0.08));
    group.scale.setScalar(scaleIn * fadeOut);
    if (!isBlueprintMode) {
      keyLight.intensity  = baseLight.key   * fadeOut;
      ambient.intensity   = baseLight.ambient * fadeOut;
      fillLight.intensity = baseLight.fill  * fadeOut;
      glowLight.intensity = baseLight.glow  * fadeOut;
    }

    renderer.render(scene, camera);
  }
  loop();

  function dispose() {
    cancelAnimationFrame(animId);
    allMeshes.forEach(m => m.geometry.dispose());
    allEdges.forEach(e  => e.geometry.dispose());
    coverFaceMat.dispose();
    coverSideMat.dispose();
    coverBackMat.dispose();
    pagesMat.dispose();
    leafMat.dispose();
    goldEdgeMat.dispose();
    coverTex.dispose();
    pageTex.dispose();
    renderer.dispose();
  }

  function syncSize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(syncSize);
  ro.observe(canvas);
  syncSize();

  return {
    renderer, camera, scene,
    dispose: () => { ro.disconnect(); dispose(); },
    setScrollProgress, setMouseTilt, setBlueprintMode,
  };
}
