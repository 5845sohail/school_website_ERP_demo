import * as THREE from "../assets/vendor/three.module.js";

// A small, handmade school world. Everything is geometry; no model downloads are needed.
const host = document.querySelector("#campus-scene");
const paused = false; // Always play motion for the school pitch.
let visible = true;
let dragging = false;
let dragX = 0;
let turn = -0.3;
let pointerX = 0;
let pointerY = 0;

try {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  host.classList.add("scene-ready");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(9.7, 8.8, 12.8);
  camera.lookAt(0, 0.8, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa98c, 2.8));
  const sun = new THREE.DirectionalLight(0xfff1dc, 4.5);
  sun.position.set(-4, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
  sun.shadow.bias = -0.001;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdde7ff, 1.5);
  fill.position.set(7, 4, -4);
  scene.add(fill);

  const world = new THREE.Group();
  scene.add(world);
  const palette = {
    grass: "#a7bc89",
    earth: "#b6a07b",
    cream: "#fff2d7",
    roof: "#c87f60",
    blue: "#7b9ba8",
    trim: "#e4c8a1",
    tree: "#73976b",
    darkTree: "#5e855d",
    bark: "#987959",
    path: "#ead8b8",
  };
  const materials = new Map();
  function material(color) {
    if (!materials.has(color))
      materials.set(
        color,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.02,
        }),
      );
    return materials.get(color);
  }
  function mesh(geometry, color, x, y, z, parent = world) {
    const object = new THREE.Mesh(geometry, material(color));
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, color, x, y, z, parent) {
    return mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent);
  }
  function ball(r, color, x, y, z, parent) {
    return mesh(new THREE.SphereGeometry(r, 24, 18), color, x, y, z, parent);
  }

  // Soft island with a layered edge and a winding entrance path.
  mesh(
    new THREE.CylinderGeometry(4.6, 4.3, 0.5, 64),
    palette.earth,
    0,
    -0.25,
    0,
  );
  mesh(
    new THREE.CylinderGeometry(4.62, 4.55, 0.22, 64),
    palette.grass,
    0,
    0.1,
    0,
  );
  box(1.1, 0.04, 3.4, palette.path, 0, 0.24, 2.5);
  box(5.3, 0.04, 0.9, palette.path, 0, 0.25, 0.9);
  for (let i = 0; i < 6; i++)
    box(0.85, 0.045, 0.11, "#d9c9ae", 0, 0.27, 1.4 + i * 0.42);

  // Three wings, rows of windows, low steps, and a welcoming front door.
  box(4.8, 2.3, 1.9, palette.cream, 0, 1.4, -0.8);
  box(1.7, 2.85, 2.15, "#fff6e5", 0, 1.65, -0.65);
  box(4.95, 0.16, 2.05, palette.trim, 0, 0.42, -0.8);
  box(5.05, 0.16, 2.1, palette.trim, 0, 2.47, -0.8);
  const roofGeometry = new THREE.BufferGeometry();
  roofGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -2.6, 2.55, 0.35, -2.6, 2.55, -1.95, -2.6, 3.3, -0.8, 2.6, 2.55, 0.35,
        2.6, 2.55, -1.95, 2.6, 3.3, -0.8,
      ],
      3,
    ),
  );
  roofGeometry.setIndex([
    0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4, 0, 1, 4, 0, 4, 3,
  ]);
  roofGeometry.computeVertexNormals();
  mesh(roofGeometry, palette.roof, 0, 0, 0);
  box(1.95, 0.16, 2.35, palette.roof, 0, 3.12, -0.65);
  for (let side of [-1, 1]) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = side * (1.25 + col * 0.75);
        box(0.5, 0.63, 0.09, palette.blue, x, 0.95 + row * 0.94, 0.19);
        box(0.045, 0.65, 0.11, "#f4ead5", x, 0.95 + row * 0.94, 0.25);
        box(0.52, 0.045, 0.11, "#f4ead5", x, 0.95 + row * 0.94, 0.25);
      }
    }
  }
  box(0.75, 1.23, 0.1, "#678c86", 0, 0.99, 0.47);
  box(0.035, 1.23, 0.12, "#d9ccb0", 0, 0.99, 0.53);
  ball(0.035, "#d3ab63", 0.12, 1.0, 0.55);
  box(1.15, 0.12, 0.55, "#d7c6a4", 0, 0.33, 0.67);
  box(1.4, 0.1, 0.65, "#e5d6b7", 0, 0.26, 0.84);

  // Draw the school name on a canvas so the scene is self contained.
  const sign = document.createElement("canvas");
  sign.width = 512;
  sign.height = 180;
  const ctx = sign.getContext("2d");
  ctx.fillStyle = "#faf0d5";
  ctx.fillRect(0, 0, 512, 180);
  ctx.textAlign = "center";
  ctx.fillStyle = "#3d6255";
  ctx.font = "bold 58px sans-serif";
  ctx.fillText("Your School", 256, 92);
  ctx.font = "21px sans-serif";
  ctx.fillText("LEARN · DISCOVER · GROW", 256, 133);
  const signTexture = new THREE.CanvasTexture(sign);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.46, 0.53),
    new THREE.MeshStandardMaterial({ map: signTexture, roughness: 1 }),
  );
  signMesh.position.set(0, 2.43, 0.44);
  world.add(signMesh);
  const clock = mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32),
    "#fdfbf2",
    0,
    2.86,
    0.45,
  );
  clock.rotation.x = Math.PI / 2;
  box(0.025, 0.13, 0.02, "#5a6d61", 0, 2.9, 0.5);
  box(0.12, 0.025, 0.02, "#5a6d61", 0.05, 2.86, 0.5);

  function tree(x, z, scale = 1, color = palette.tree) {
    const group = new THREE.Group();
    group.position.set(x, 0.2, z);
    group.scale.setScalar(scale);
    world.add(group);
    mesh(
      new THREE.CylinderGeometry(0.09, 0.13, 0.95, 10),
      palette.bark,
      0,
      0.48,
      0,
      group,
    );
    ball(0.52, color, 0, 1.25, 0, group).scale.y = 1.25;
    ball(0.36, color, -0.25, 1.06, 0.05, group);
    return group;
  }
  tree(-3, 0.45, 1.15);
  tree(3, 0.1, 1.35, palette.darkTree);
  tree(-2.9, -2.2, 1.25);
  tree(2.8, -2.25, 0.9);
  tree(-2.4, 2.7, 0.75);
  tree(2.5, 2.2, 0.65);
  for (const x of [-1.5, 1.5]) {
    box(0.95, 0.09, 0.35, "#c09a72", x, 0.7, 1.6);
    box(0.95, 0.35, 0.08, "#c09a72", x, 0.95, 1.4);
    for (const dx of [-0.32, 0.32])
      box(0.07, 0.4, 0.07, "#6d7c68", x + dx, 0.47, 1.6);
  }
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    if (angle > 0.9 && angle < 2.2) continue;
    box(
      0.07,
      0.43,
      0.07,
      "#f9ebcf",
      Math.cos(angle) * 4.03,
      0.45,
      Math.sin(angle) * 4.03,
    );
  }
  mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 2.5, 10),
    "#efe4cc",
    0.8,
    4.37,
    -0.62,
  );
  const flag = box(0.67, 0.43, 0.035, "#7e97bb", 1.12, 5.26, -0.62);
  flag.rotation.y = -0.25;

  // Orbiting books and a tiny planet give depth without covering the school.
  const floating = [];
  function book(x, y, z, color, rotation) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.set(0.1, rotation, -0.25);
    box(0.7, 0.1, 0.92, color, 0, 0.11, 0, group);
    box(0.65, 0.12, 0.85, "#fff1d9", 0.015, 0, 0, group);
    box(0.7, 0.06, 0.92, color, 0, -0.1, 0, group);
    scene.add(group);
    floating.push({ object: group, y, offset: x });
  }
  book(-4.1, 4.3, 0.6, "#d4a37d", 0.4);
  book(3.3, 4.5, -1.8, "#8498c2", -0.8);
  const planet = new THREE.Group();
  planet.position.set(4.5, 2.6, 2.0);
  ball(0.38, "#b3a7d1", 0, 0, 0, planet);
  const ring = mesh(
    new THREE.TorusGeometry(0.62, 0.05, 10, 60),
    "#e7bf8f",
    0,
    0,
    0,
    planet,
  );
  ring.rotation.x = 1.0;
  ring.rotation.z = 0.5;
  scene.add(planet);
  floating.push({ object: planet, y: 2.6, offset: 3.1 });

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    const distance = Math.max(1, 1.2 / camera.aspect);
    camera.position.set(9.7 * distance, 8.8 * distance, 12.8 * distance);
    camera.lookAt(0, 0.8, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0 },
  ).observe(host);
  host.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragX = event.clientX;
    host.setPointerCapture(event.pointerId);
  });
  host.addEventListener("pointerup", () => {
    dragging = false;
  });
  host.addEventListener("pointercancel", () => {
    dragging = false;
  });
  host.addEventListener("pointermove", (event) => {
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    if (dragging) {
      turn += (event.clientX - dragX) * 0.008;
      dragX = event.clientX;
    }
  });
  let time = 0;
  let lastFrame = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!visible || document.hidden) return;
    if (!paused) time += delta;
    const targetY =
      turn + (paused ? 0 : Math.sin(time * 0.23) * 0.12 + pointerX * 0.12);
    world.rotation.y += (targetY - world.rotation.y) * 0.04;
    world.position.y = paused ? 0 : Math.sin(time * 0.9) * 0.065;
    world.rotation.x +=
      ((paused ? 0 : pointerY * 0.035) - world.rotation.x) * 0.04;
    floating.forEach(({ object, y, offset }) => {
      object.position.y = y + Math.sin(time * 1.05 + offset) * 0.18;
      object.rotation.y += paused ? 0 : delta * 0.13;
    });
    renderer.render(scene, camera);
  }
  resize();
  requestAnimationFrame(frame);
  host.addEventListener(
    "webglcontextlost",
    () => {
      host.classList.remove("scene-ready");
    },
    { once: true },
  );
} catch (error) {
  // The real school photo remains visible on devices without WebGL.
  host.classList.remove("scene-ready");
  document.querySelector(".scene-hint").textContent =
    "Our school in your community";
}
