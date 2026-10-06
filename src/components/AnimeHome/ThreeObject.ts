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

export function createThreeScene(canvas: HTMLCanvasElement): ThreeScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ── Lights ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambient);

  const rimLight = new THREE.DirectionalLight(0xf5c842, 3.2);
  rimLight.position.set(2, 3.5, 2);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x1a50d0, 0.65);
  fillLight.position.set(-2.5, -1, 3);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x0a1840, 0.45);
  backLight.position.set(0, -3, -2);
  scene.add(backLight);

  // Point light close to book surface creates the glow halo
  const glowLight = new THREE.PointLight(0xf5c842, 2.8, 6, 2);
  glowLight.position.set(0.3, 0.4, 1.8);
  scene.add(glowLight);

  // ── Materials ────────────────────────────────────────────────────────────
  const coverMat = new THREE.MeshStandardMaterial({
    color: 0x070c1a,
    emissive: 0x0d1a50,
    emissiveIntensity: 0.7,
    metalness: 0.15,
    roughness: 0.82,
  });
  const pagesMat = new THREE.MeshStandardMaterial({
    color: 0x0a1020,
    emissive: 0x081030,
    emissiveIntensity: 0.3,
    roughness: 0.95,
    metalness: 0,
  });
  const goldEdgeMat = new THREE.LineBasicMaterial({ color: 0xf5c842 });
  const bpEdgeMat   = new THREE.LineBasicMaterial({ color: 0x1a2040 });

  // ── Geometry ─────────────────────────────────────────────────────────────
  // Spine center x = -0.775 (left edge), book face = x +0.775 from spine
  const SPINE_X     = -0.775;
  const COVER_W     = 1.55;
  const COVER_H     = 2.10;
  const COVER_D     = 0.075;
  const PAGES_W     = 1.44;
  const PAGES_H     = 2.00;
  const PAGES_D     = 0.475;

  const group = new THREE.Group();

  // Back cover (static)
  const backGeo  = new THREE.BoxGeometry(COVER_W, COVER_H, COVER_D);
  const backMesh = new THREE.Mesh(backGeo, coverMat);
  backMesh.position.set(0.02, 0, -(PAGES_D / 2 + COVER_D / 2));
  group.add(backMesh);

  // Pages block (static)
  const pagesGeo  = new THREE.BoxGeometry(PAGES_W, PAGES_H, PAGES_D);
  const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
  pagesMesh.position.set(0.04, 0, 0);
  group.add(pagesMesh);

  const pagesEdgeGeo = new THREE.EdgesGeometry(pagesGeo, 10);
  const pagesEdges   = new THREE.LineSegments(pagesEdgeGeo, goldEdgeMat);
  pagesEdges.position.copy(pagesMesh.position);
  group.add(pagesEdges);

  // Spine (static)
  const spineGeo  = new THREE.BoxGeometry(COVER_D, COVER_H, PAGES_D + COVER_D * 2);
  const spineMesh = new THREE.Mesh(spineGeo, coverMat);
  spineMesh.position.set(SPINE_X, 0, 0);
  group.add(spineMesh);

  // Front cover pivot — rotates around spine for "open book" effect
  const frontPivot = new THREE.Group();
  frontPivot.position.set(SPINE_X, 0, PAGES_D / 2 + COVER_D / 2);
  group.add(frontPivot);

  const frontGeo  = new THREE.BoxGeometry(COVER_W, COVER_H, COVER_D);
  const frontMesh = new THREE.Mesh(frontGeo, coverMat);
  frontMesh.position.set(-SPINE_X, 0, 0); // offset from pivot so it hinges at spine
  frontPivot.add(frontMesh);

  const frontEdgeGeo = new THREE.EdgesGeometry(frontGeo, 10);
  const frontEdges   = new THREE.LineSegments(frontEdgeGeo, goldEdgeMat);
  frontEdges.position.copy(frontMesh.position);
  frontPivot.add(frontEdges);

  scene.add(group);

  // Collect meshes + edges for blueprint toggle
  const allMeshes: THREE.Mesh[]         = [];
  const allEdges: THREE.LineSegments[]  = [];
  group.traverse(obj => {
    if (obj instanceof THREE.Mesh)          allMeshes.push(obj);
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
      (e.material as THREE.LineBasicMaterial).color.setHex(on ? 0x1a2040 : 0xf5c842);
    });
    ambient.intensity   = on ? 0 : 0.12;
    rimLight.intensity  = on ? 0 : 3.2;
    fillLight.intensity = on ? 0 : 0.55;
    glowLight.intensity = on ? 0 : 2.8;
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    const elapsed = clock.getElapsedTime();

    currentP += (targetP - currentP) * 0.09;
    lmx += (mx - lmx) * 0.055;
    lmy += (my - lmy) * 0.055;

    const p = currentP;

    // Scale in over first 10%
    const scaleIn = p < 0.1 ? p / 0.1 : 1;
    group.scale.setScalar(scaleIn);

    // Floating Y oscillation
    group.position.y = Math.sin(elapsed * 0.65) * 0.10;

    // Slow Y rotation + mouse tilt
    group.rotation.y += 0.003;
    group.rotation.x  = lmy * -0.12;
    group.rotation.z  = lmx * -0.05;

    // Camera fly-in: p 0.10–0.28 → z 6→4
    const flyT = Math.max(0, Math.min(1, (p - 0.1) / 0.18));
    camera.position.z = 6 - flyT * 2;

    // Book open: p 0.32–0.42
    const openT      = Math.max(0, Math.min(1, (p - 0.32) / 0.10));
    // Book close: p 0.68–0.76
    const closeT     = Math.max(0, Math.min(1, (p - 0.68) / 0.08));
    const openAmount = (openT - closeT);
    frontPivot.rotation.y = openAmount * -2.65;

    // Fade out: p 0.92–1.0
    const fadeOut = 1 - Math.max(0, Math.min(1, (p - 0.92) / 0.08));
    group.scale.setScalar(scaleIn * fadeOut);
    if (!isBlueprintMode) {
      rimLight.intensity  = 3.2  * fadeOut;
      ambient.intensity   = 0.12 * fadeOut;
      fillLight.intensity = 0.55 * fadeOut;
      glowLight.intensity = 2.8  * fadeOut;
    }

    renderer.render(scene, camera);
  }
  loop();

  function dispose() {
    cancelAnimationFrame(animId);
    allMeshes.forEach(m => m.geometry.dispose());
    allEdges.forEach(e  => e.geometry.dispose());
    coverMat.dispose();
    pagesMat.dispose();
    goldEdgeMat.dispose();
    bpEdgeMat.dispose();
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
