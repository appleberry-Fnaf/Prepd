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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

type Season = 'spring' | 'summer' | 'fall' | 'winter';
function currentSeason(): Season {
  const m = new Date().getMonth(); // 0 = Jan
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
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

  // ── Lights — bright, with a cool rim so the white cat pops off dark bg ─────
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.1);
  keyLight.position.set(2.5, 3.5, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9fd0f0, 0.6);
  fillLight.position.set(-3, -0.5, 2.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xbfe4ff, 1.8);
  rimLight.position.set(-1.5, 2.5, -3);
  scene.add(rimLight);

  const baseLight = { ambient: 0.6, key: 2.1, fill: 0.6, rim: 1.8 };

  // ── Material registry (for the blueprint wireframe toggle) ────────────────
  const mats: THREE.MeshStandardMaterial[] = [];
  const origHex: number[] = [];
  function reg(m: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
    mats.push(m);
    origHex.push(m.color.getHex());
    return m;
  }

  // Palette
  const FUR    = reg(new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.95, metalness: 0 }));
  const FUR2   = reg(new THREE.MeshStandardMaterial({ color: 0xe9e7e2, roughness: 0.95, metalness: 0 }));
  const PINK   = reg(new THREE.MeshStandardMaterial({ color: 0xf1a8bb, roughness: 0.8,  metalness: 0 }));
  const EYE    = reg(new THREE.MeshStandardMaterial({ color: 0x2b6aa0, roughness: 0.25, metalness: 0.1, emissive: 0x0b2b4a, emissiveIntensity: 0.3 }));
  const PUPIL  = reg(new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: 0.3,  metalness: 0 }));
  const SHINE  = reg(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2,  metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.4 }));

  const whiskerMat = new THREE.LineBasicMaterial({ color: 0xcfd6dd });

  // ── Cat group hierarchy ───────────────────────────────────────────────────
  const group    = new THREE.Group();   // whole cat
  const headGroup = new THREE.Group();  // pivots at the neck so the head can look around
  const tailGroup = new THREE.Group();  // pivots at the tail base so it can wag
  const eyeMeshes: THREE.Mesh[] = [];

  function add(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  // Body — sitting ovoid
  const body = add(new THREE.SphereGeometry(0.72, 32, 24), FUR, 0, -0.25, 0, group);
  body.scale.set(1.02, 1.18, 0.92);
  // chest fluff
  const chest = add(new THREE.SphereGeometry(0.5, 24, 18), FUR, 0, -0.35, 0.34, group);
  chest.scale.set(0.9, 1.0, 0.7);

  // Front legs + paws
  for (const sx of [-1, 1]) {
    const leg = add(new THREE.CylinderGeometry(0.15, 0.17, 0.5, 18), FUR, sx * 0.26, -0.78, 0.42, group);
    leg.rotation.x = 0.06;
    const paw = add(new THREE.SphereGeometry(0.19, 18, 14), FUR, sx * 0.27, -1.0, 0.52, group);
    paw.scale.set(1, 0.7, 1.15);
    // toe lines (tiny indentations via small spheres)
    add(new THREE.SphereGeometry(0.03, 8, 8), FUR2, sx * 0.21, -1.02, 0.66, group);
    add(new THREE.SphereGeometry(0.03, 8, 8), FUR2, sx * 0.33, -1.02, 0.66, group);
  }

  // Tail (tube along a curve, in its own pivot group)
  tailGroup.position.set(0.12, -0.5, -0.32);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.22, -0.05, -0.22),
    new THREE.Vector3(0.55, 0.18, -0.15),
    new THREE.Vector3(0.72, 0.6, 0.12),
    new THREE.Vector3(0.52, 0.92, 0.4),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 40, 0.12, 12, false);
  tailGroup.add(new THREE.Mesh(tailGeo, FUR));
  add(new THREE.SphereGeometry(0.12, 14, 12), FUR2, 0.52, 0.92, 0.4, tailGroup); // soft tip
  group.add(tailGroup);

  // ── Head ──────────────────────────────────────────────────────────────────
  headGroup.position.set(0, 0.45, 0);
  group.add(headGroup);

  const head = add(new THREE.SphereGeometry(0.56, 32, 26), FUR, 0, 0.34, 0.16, headGroup);
  head.scale.set(1.08, 1.0, 1.0);
  // cheeks
  add(new THREE.SphereGeometry(0.22, 18, 14), FUR, -0.33, 0.18, 0.4, headGroup).scale.set(1, 0.9, 0.9);
  add(new THREE.SphereGeometry(0.22, 18, 14), FUR,  0.33, 0.18, 0.4, headGroup).scale.set(1, 0.9, 0.9);
  // muzzle
  add(new THREE.SphereGeometry(0.2, 18, 14), FUR, 0, 0.14, 0.52, headGroup).scale.set(1.2, 0.85, 0.8);

  // Ears (outer + pink inner)
  for (const sx of [-1, 1]) {
    const ear = add(new THREE.ConeGeometry(0.22, 0.4, 20), FUR, sx * 0.32, 0.78, 0.08, headGroup);
    ear.rotation.z = sx * -0.18;
    ear.rotation.x = -0.12;
    const inner = add(new THREE.ConeGeometry(0.12, 0.26, 16), PINK, sx * 0.32, 0.76, 0.17, headGroup);
    inner.rotation.z = sx * -0.18;
    inner.rotation.x = -0.12;
  }

  // Eyes (blue ball + pupil + highlight)
  for (const sx of [-1, 1]) {
    const e = add(new THREE.SphereGeometry(0.135, 20, 16), EYE, sx * 0.21, 0.4, 0.56, headGroup);
    e.scale.set(0.95, 1.1, 0.7);
    eyeMeshes.push(e);
    const pupil = add(new THREE.SphereGeometry(0.075, 16, 12), PUPIL, sx * 0.21, 0.4, 0.66, headGroup);
    pupil.scale.set(0.8, 1.2, 0.6);
    add(new THREE.SphereGeometry(0.03, 10, 8), SHINE, sx * 0.24, 0.45, 0.70, headGroup);
  }

  // Nose + mouth hint
  const nose = add(new THREE.SphereGeometry(0.058, 14, 12), PINK, 0, 0.21, 0.70, headGroup);
  nose.scale.set(1.3, 0.9, 0.9);

  // Whiskers
  const whiskerPts: number[] = [];
  const wy = 0.17;
  for (const sx of [-1, 1]) {
    for (const dy of [0.05, 0, -0.05]) {
      whiskerPts.push(sx * 0.14, wy + dy, 0.62,  sx * 0.62, wy + dy * 2 + 0.02, 0.46);
    }
  }
  const whiskerGeo = new THREE.BufferGeometry();
  whiskerGeo.setAttribute('position', new THREE.Float32BufferAttribute(whiskerPts, 3));
  const whiskers = new THREE.LineSegments(whiskerGeo, whiskerMat);
  headGroup.add(whiskers);

  // ── Seasonal accessories ──────────────────────────────────────────────────
  const accessories: Record<Season, THREE.Group> = {
    spring: new THREE.Group(),
    summer: new THREE.Group(),
    fall:   new THREE.Group(),
    winter: new THREE.Group(),
  };

  // Spring — flower tucked by the ear
  {
    const g = accessories.spring;
    const center = reg(new THREE.MeshStandardMaterial({ color: 0xf7d14e, roughness: 0.6 }));
    const petal  = reg(new THREE.MeshStandardMaterial({ color: 0xf06fa6, roughness: 0.7 }));
    add(new THREE.SphereGeometry(0.06, 14, 12), center, 0, 0, 0, g);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.07, 14, 12), petal, Math.cos(a) * 0.11, Math.sin(a) * 0.11, -0.02, g)
        .scale.set(1, 1, 0.5);
    }
    g.position.set(0.34, 0.74, 0.28);
    headGroup.add(g);
  }

  // Summer — sunglasses over the eyes
  {
    const g = accessories.summer;
    const lensMat  = reg(new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.2, metalness: 0.4 }));
    const frameMat = reg(new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.3, metalness: 0.5 }));
    for (const sx of [-1, 1]) {
      const lens = add(new THREE.SphereGeometry(0.16, 20, 16), lensMat, sx * 0.21, 0.41, 0.64, g);
      lens.scale.set(1, 0.92, 0.32);
    }
    // bridge
    add(new THREE.BoxGeometry(0.14, 0.035, 0.04), frameMat, 0, 0.44, 0.69, g);
    // arms
    for (const sx of [-1, 1]) {
      const arm = add(new THREE.BoxGeometry(0.42, 0.03, 0.03), frameMat, sx * 0.4, 0.44, 0.4, g);
      arm.rotation.y = sx * 0.5;
    }
    g.position.set(0, 0, 0);
    headGroup.add(g);
  }

  // Fall — cozy knit scarf around the neck
  {
    const g = accessories.fall;
    const knit = reg(new THREE.MeshStandardMaterial({ color: 0xb5432f, roughness: 0.98 }));
    const loop = add(new THREE.TorusGeometry(0.44, 0.13, 14, 32), knit, 0, 0.42, 0.12, g);
    loop.rotation.x = Math.PI / 2 - 0.25;
    loop.scale.set(1, 1, 0.8);
    // hanging tail of the scarf
    const hang = add(new THREE.BoxGeometry(0.2, 0.44, 0.1), knit, 0.2, 0.06, 0.5, g);
    hang.rotation.z = 0.12;
    add(new THREE.BoxGeometry(0.2, 0.08, 0.1), knit, 0.22, -0.18, 0.5, g).rotation.z = 0.12; // fringe hint
    headGroup.add(g); // sits at neck, which is headGroup's origin area
  }

  // Winter — Santa hat
  {
    const g = accessories.winter;
    const red   = reg(new THREE.MeshStandardMaterial({ color: 0xcc2d2d, roughness: 0.85 }));
    const white = reg(new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.95 }));
    const coneM = add(new THREE.ConeGeometry(0.34, 0.6, 24), red, 0, 1.08, 0.02, g);
    coneM.rotation.x = -0.18;
    coneM.position.z = 0.1;
    const brim = add(new THREE.TorusGeometry(0.33, 0.08, 14, 28), white, 0, 0.82, 0.06, g);
    brim.rotation.x = Math.PI / 2;
    brim.scale.set(1, 1, 0.9);
    add(new THREE.SphereGeometry(0.1, 16, 14), white, 0.12, 1.34, 0.18, g); // pom-pom
    headGroup.add(g);
  }

  // Show only the current season's accessory
  const season = currentSeason();
  (Object.keys(accessories) as Season[]).forEach(k => { accessories[k].visible = k === season; });

  scene.add(group);

  // Collect meshes for blueprint toggle
  const allMeshes: THREE.Mesh[] = [];
  group.traverse(o => { if (o instanceof THREE.Mesh) allMeshes.push(o); });

  // ── State ─────────────────────────────────────────────────────────────────
  let targetP = 0, currentP = 0;
  let mx = 0, my = 0, lmx = 0, lmy = 0;
  let isBlueprintMode = false;
  let animId: number;
  const clock = new THREE.Clock();
  let nextBlink = 1.5 + Math.random() * 3;

  function setScrollProgress(p: number) { targetP = p; }
  function setMouseTilt(x: number, y: number) { mx = x; my = y; }

  function setBlueprintMode(on: boolean) {
    if (on === isBlueprintMode) return;
    isBlueprintMode = on;
    mats.forEach((m, i) => {
      m.wireframe = on;
      m.color.setHex(on ? 0x2a4a74 : origHex[i]);
      m.emissiveIntensity = on ? 0 : (m === EYE ? 0.3 : (m === SHINE ? 0.4 : m.emissiveIntensity));
    });
    whiskerMat.color.setHex(on ? 0x2a4a74 : 0xcfd6dd);
    ambient.intensity  = on ? 0.2 : baseLight.ambient;
    keyLight.intensity = on ? 0.4 : baseLight.key;
    fillLight.intensity = on ? 0.2 : baseLight.fill;
    rimLight.intensity = on ? 0 : baseLight.rim;
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();

    currentP += (targetP - currentP) * 0.085;
    lmx += (mx - lmx) * 0.06;
    lmy += (my - lmy) * 0.06;
    const p = currentP;

    const scaleIn = p < 0.1 ? p / 0.1 : 1;

    // Gentle float + idle sway (cat stays facing the camera, not spinning)
    group.position.y = Math.sin(t * 0.8) * 0.07;
    group.rotation.y = Math.sin(t * 0.35) * 0.18 + lmx * 0.25 + (p - 0.5) * 0.3;
    group.rotation.x = lmy * 0.08 + Math.sin(t * 0.6) * 0.015;

    // Head looks toward the mouse + a soft bob
    headGroup.rotation.y = lmx * 0.22;
    headGroup.rotation.x = -lmy * 0.14 + Math.sin(t * 0.9) * 0.03;
    headGroup.rotation.z = Math.sin(t * 0.5) * 0.02;

    // Tail wag
    tailGroup.rotation.z = Math.sin(t * 1.6) * 0.18;
    tailGroup.rotation.y = Math.sin(t * 1.2) * 0.12;

    // Blink
    if (t > nextBlink) {
      const since = t - nextBlink;
      const blink = since < 0.14 ? 1 - since / 0.14 : since < 0.28 ? (since - 0.14) / 0.14 : 1;
      const sy = 0.1 + 0.9 * blink;
      eyeMeshes.forEach(e => { e.scale.y = 1.1 * sy; });
      if (since > 0.28) { nextBlink = t + 2 + Math.random() * 4; eyeMeshes.forEach(e => { e.scale.y = 1.1; }); }
    }

    // Camera fly-in: p 0.10–0.28 → z 6→4.4
    const flyT = clamp01((p - 0.1) / 0.18);
    camera.position.z = 6 - flyT * 1.6;

    // Fade out at the very end
    const fadeOut = 1 - clamp01((p - 0.92) / 0.08);
    group.scale.setScalar(scaleIn * fadeOut * 1.05);
    if (!isBlueprintMode) {
      keyLight.intensity  = baseLight.key  * fadeOut;
      ambient.intensity   = baseLight.ambient * Math.max(0.3, fadeOut);
      rimLight.intensity  = baseLight.rim  * fadeOut;
    }

    renderer.render(scene, camera);
  }
  loop();

  function dispose() {
    cancelAnimationFrame(animId);
    allMeshes.forEach(m => m.geometry.dispose());
    whiskerGeo.dispose();
    mats.forEach(m => m.dispose());
    whiskerMat.dispose();
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
