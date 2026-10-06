import * as THREE from 'three';
import { EXPLODE_AMOUNT, MAX_DPR } from './constants';

export interface ThreeScene {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  dispose: () => void;
  setScrollProgress: (p: number) => void;
  setMouseTilt: (mx: number, my: number) => void;
  setBlueprintMode: (on: boolean) => void;
}

interface Disc {
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  baseY: number;
}

export function createThreeScene(canvas: HTMLCanvasElement): ThreeScene {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  const rimLight = new THREE.DirectionalLight(0xf5c89a, 2.2);
  rimLight.position.set(3, 4, 2);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x8ab4f8, 0.6);
  fillLight.position.set(-3, -1, 3);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x334466, 0.4);
  backLight.position.set(0, -4, -3);
  scene.add(backLight);

  // Materials
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x2a2724,
    metalness: 0.62,
    roughness: 0.52,
  });
  const edgeMat    = new THREE.LineBasicMaterial({ color: 0x5a5450 });
  const bpEdgeMat  = new THREE.LineBasicMaterial({ color: 0x2a2824 });

  // Build discs
  const discDefs = [
    { r: 1.12, h: 0.38, y: 0.7,  rOuter: 1.34 },
    { r: 1.22, h: 0.42, y: 0,    rOuter: 1.44 },
    { r: 1.12, h: 0.38, y: -0.7, rOuter: 1.34 },
  ];

  const group = new THREE.Group();
  const discs: Disc[] = [];

  discDefs.forEach(({ r, h, y }) => {
    const geo = new THREE.CylinderGeometry(r, r * 1.02, h, 48, 1, false);
    const mesh = new THREE.Mesh(geo, darkMat);
    mesh.position.y = y;

    const edgeGeo = new THREE.EdgesGeometry(geo, 20);
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.y = y;

    group.add(mesh);
    group.add(edges);
    discs.push({ mesh, edges, baseY: y });
  });

  // Thin spacer toruses
  const torusDefs = [
    { y: 0.46, r: 1.18, tube: 0.025 },
    { y: -0.46, r: 1.18, tube: 0.025 },
  ];
  torusDefs.forEach(({ y, r, tube }) => {
    const geo = new THREE.TorusGeometry(r, tube, 8, 64);
    const mesh = new THREE.Mesh(geo, darkMat);
    mesh.position.y = y;
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
  });

  // Bevel ring at top/bottom of middle disc
  const bevelDefs = [{ y: 0.21 }, { y: -0.21 }];
  bevelDefs.forEach(({ y }) => {
    const geo = new THREE.TorusGeometry(1.22, 0.018, 6, 64);
    const mesh = new THREE.Mesh(geo, darkMat);
    mesh.position.y = y;
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
  });

  scene.add(group);

  // Collect all meshes + edge sets for bulk toggling in blueprint mode
  const allMeshes: THREE.Mesh[] = [];
  const allEdges: THREE.LineSegments[] = [];
  group.traverse(obj => {
    if (obj instanceof THREE.Mesh)          allMeshes.push(obj);
    else if (obj instanceof THREE.LineSegments) allEdges.push(obj);
  });

  // State
  let currentP = 0;
  let targetP = 0;
  let mx = 0, my = 0, lmx = 0, lmy = 0;
  let animId: number;
  let isBlueprintMode = false;

  function setScrollProgress(p: number) { targetP = p; }
  function setMouseTilt(x: number, y: number) { mx = x; my = y; }
  function setBlueprintMode(on: boolean) {
    if (on === isBlueprintMode) return;
    isBlueprintMode = on;
    // In blueprint mode: hide all fill meshes, darken edges for beige bg contrast
    allMeshes.forEach(m => { m.visible = !on; });
    allEdges.forEach(e => {
      (e.material as THREE.LineBasicMaterial).color.setHex(on ? 0x2a2824 : 0x5a5450);
    });
    // Lights don't affect LineBasicMaterial; adjust ambient for fill meshes when they return
    ambient.intensity  = on ? 0 : 0.25;
    rimLight.intensity = on ? 0 : 2.2;
    fillLight.intensity = on ? 0 : 0.6;
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    currentP += (targetP - currentP) * 0.09;
    lmx += (mx - lmx) * 0.055;
    lmy += (my - lmy) * 0.055;

    const p = currentP;

    // Hero entrance: scale in over first 10%
    const scaleIn = p < 0.1 ? p / 0.1 : 1;
    group.scale.setScalar(scaleIn);

    // Continuous slow rotation
    group.rotation.y += 0.004;

    // Mouse tilt
    group.rotation.x = lmy * -0.14;
    group.rotation.z = lmx * -0.06;

    // Camera z: fly toward object from 6 → 4 over p 0.10–0.28
    const flyT = Math.max(0, Math.min(1, (p - 0.1) / 0.18));
    camera.position.z = 6 - flyT * 2;

    // Explode: p 0.32–0.42 → discs separate
    const explodeT = Math.max(0, Math.min(1, (p - 0.32) / 0.1));
    // Reassemble: p 0.68–0.76
    const reassembleT = Math.max(0, Math.min(1, (p - 0.68) / 0.08));
    const explodeAmt = (explodeT - reassembleT) * EXPLODE_AMOUNT;

    discs.forEach((d, i) => {
      const dir = i === 0 ? 1 : i === 2 ? -1 : 0;
      d.mesh.position.y = d.baseY + dir * explodeAmt;
      d.edges.position.y = d.baseY + dir * explodeAmt;
    });

    // Fade out: p 0.92–1.0 via scale
    const fadeOut = 1 - Math.max(0, Math.min(1, (p - 0.92) / 0.08));
    group.scale.setScalar(scaleIn * fadeOut);
    if (!isBlueprintMode) {
      rimLight.intensity  = 2.2  * fadeOut;
      ambient.intensity   = 0.25 * fadeOut;
      fillLight.intensity = 0.6  * fadeOut;
    }

    renderer.render(scene, camera);
  }
  loop();

  function dispose() {
    cancelAnimationFrame(animId);
    allMeshes.forEach(m  => m.geometry.dispose());
    allEdges.forEach(e   => e.geometry.dispose());
    darkMat.dispose();
    edgeMat.dispose();
    bpEdgeMat.dispose();
    renderer.dispose();
  }

  // Handle resize via ResizeObserver (catches CSS-driven size changes too)
  function syncSize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(syncSize);
  ro.observe(canvas);
  syncSize(); // force sync on first tick in case layout already settled

  const origDispose = dispose;
  const disposeAll = () => {
    ro.disconnect();
    origDispose();
  };

  return { renderer, camera, scene, dispose: disposeAll, setScrollProgress, setMouseTilt, setBlueprintMode };
}
