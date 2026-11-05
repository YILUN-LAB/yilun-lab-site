/**
 * Three.js scene for the Hug study model, drawn like a designer's pencil
 * sketch: graphite outlines found by edge detection, each traced twice with a
 * small hand wobble, hatching on the shaded side, and a marker wash in the
 * light's color temperature. The R13 shell morphs between open, half-open and
 * gathered. Loaded on demand by HugModelViewer, so three.js stays out of the
 * main bundle.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { morphWeights } from "./hug-opening";

export interface HugSceneInputs {
  progress: number;
  /** "r g b", 0 to 255 */
  glow: string;
  power: boolean;
  active: boolean;
}

/** Screen positions (CSS pixels) of the sketch guides drawn in SVG over the canvas. */
export interface HugSketchLayout {
  width: number;
  height: number;
  base: { cx: number; cy: number; rx: number; ry: number };
  dimension: { x: number; top: number; bottom: number };
}

export interface HugSceneOptions {
  canvas: HTMLCanvasElement;
  src: string;
  getInputs: () => HugSceneInputs;
  reducedMotion: boolean;
  onLayout: (layout: HugSketchLayout) => void;
  onInteract: () => void;
}

export interface HugScene {
  invalidate: () => void;
  rotateBy: (radians: number) => void;
  dispose: () => void;
}

const HEIGHT = 0.3; // metres, from the R13 model
const BASE_RADIUS = 0.17;
const DIMENSION_X = 0.2;
const START_YAW = -0.45;
const AUTO_ROTATE_SPEED = 0.18; // rad/s
const IDLE_BEFORE_AUTO_ROTATE = 4000; // ms

const normalVertexShader = /* glsl */ `
  #include <common>
  #include <morphtarget_pars_vertex>
  varying vec3 vNormalView;
  void main() {
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    vNormalView = normalize(normalMatrix * objectNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const normalFragmentShader = /* glsl */ `
  varying vec3 vNormalView;
  void main() {
    vec3 n = normalize(vNormalView);
    if (!gl_FrontFacing) n = -n;
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
  }
`;

const compositeVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const compositeFragmentShader = /* glsl */ `
  #include <packing>
  uniform sampler2D tNormal;
  uniform sampler2D tDepth;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uNear;
  uniform float uFar;
  uniform vec3 uPaper;
  uniform vec3 uGraphite;
  uniform vec3 uWash;
  uniform float uWashAmount;
  uniform vec3 uLight;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float depthAt(vec2 uv) {
    return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar);
  }

  // Outline strength at uv: the silhouette against the paper, creases in the
  // normals (wing edges, the rim) and steps in depth (one wing over the other).
  float edgeAt(vec2 uv, float radius) {
    vec2 t = radius * uPixelRatio / uResolution;
    vec4 l = texture2D(tNormal, uv - vec2(t.x, 0.0));
    vec4 r = texture2D(tNormal, uv + vec2(t.x, 0.0));
    vec4 d = texture2D(tNormal, uv - vec2(0.0, t.y));
    vec4 u = texture2D(tNormal, uv + vec2(0.0, t.y));
    float inside = l.a * r.a * d.a * u.a;
    float silhouette = clamp(abs(l.a - r.a) + abs(u.a - d.a), 0.0, 1.0);
    float crease = smoothstep(0.35, 0.8, length(l.xyz - r.xyz) + length(u.xyz - d.xyz)) * inside;
    float depthStep = abs(depthAt(uv - vec2(t.x, 0.0)) - depthAt(uv + vec2(t.x, 0.0)))
               + abs(depthAt(uv - vec2(0.0, t.y)) - depthAt(uv + vec2(0.0, t.y)));
    float overlap = smoothstep(0.008, 0.025, depthStep) * inside;
    return max(silhouette, max(crease * 0.85, overlap * 0.8));
  }

  float hatchLines(float v) {
    return 1.0 - smoothstep(0.1, 0.24, abs(fract(v) - 0.5));
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uPixelRatio; // CSS pixels
    vec2 toUv = uPixelRatio / uResolution;

    // Two passes of the same outline with different hand wobble.
    vec2 wobbleA = (vec2(noise(px * 0.03), noise(px * 0.03 + 17.3)) - 0.5) * 3.2;
    vec2 wobbleB = (vec2(noise(px * 0.045 + 41.0), noise(px * 0.045 + 7.0)) - 0.5) * 4.5;
    float strokeA = edgeAt(vUv + wobbleA * toUv, 1.3);
    float strokeB = edgeAt(vUv + wobbleB * toUv, 0.9);
    float grain = 0.55 + 0.45 * (0.6 * noise(px * 0.85) + 0.4 * noise(px * 0.23));
    float stroke = max(strokeA, strokeB * 0.55) * grain;

    vec4 normalSample = texture2D(tNormal, vUv);
    float mask = normalSample.a;
    vec3 n = normalize(normalSample.xyz * 2.0 - 1.0);
    float lit = clamp(dot(n, uLight), 0.0, 1.0);
    float shade = (1.0 - lit) * mask;

    float drift = noise(px * 0.02) * 0.7;
    float hatchA = hatchLines((px.x * 0.5 + px.y * 0.866) / 5.0 + drift) * smoothstep(0.42, 0.78, shade);
    float hatchB = hatchLines((px.x * 0.866 - px.y * 0.5) / 6.0 + drift) * smoothstep(0.7, 0.95, shade);
    float hatch = max(hatchA, hatchB * 0.7) * (0.35 + 0.65 * noise(px * 0.5));

    float tooth = 0.965 + 0.035 * noise(px * 1.6) + 0.015 * noise(px * 0.12);
    vec3 color = uPaper * tooth;

    // Marker wash for the light, laid in vertical strokes and left open where
    // the surface catches the most light.
    float streak = 0.7 + 0.3 * noise(vec2(px.x * 0.09, px.y * 0.006));
    float highlight = smoothstep(0.72, 0.95, lit);
    float wash = uWashAmount * mask * streak * (1.0 - 0.75 * highlight)
               * (0.55 + 0.45 * clamp(n.z, 0.0, 1.0));
    color *= mix(vec3(1.0), uWash, wash);

    float graphite = clamp(stroke * 0.92 + hatch * 0.28, 0.0, 1.0);
    color = mix(color, uGraphite, graphite);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface BakedPart {
  base: Float32Array;
  targets: Float32Array[];
  index: THREE.BufferAttribute;
}

/**
 * Copies a loaded mesh into plain float arrays in metres. Meshopt quantization
 * stores positions as normalized integers with a node transform; baking that
 * transform in keeps the model at its real size.
 */
function bake(mesh: THREE.Mesh): BakedPart {
  const geometry = mesh.geometry;
  if (!geometry.index) throw new Error(`Hug model part "${mesh.name}" has no index`);
  if (!geometry.morphTargetsRelative) {
    throw new Error(`Hug model part "${mesh.name}" must use relative morph targets`);
  }
  const position = geometry.attributes.position;
  const linear = new THREE.Matrix3().setFromMatrix4(mesh.matrixWorld);
  const v = new THREE.Vector3();
  const base = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i)
      .applyMatrix4(mesh.matrixWorld)
      .toArray(base, i * 3);
  }
  const targets = (geometry.morphAttributes.position ?? []).map((attribute) => {
    const delta = new Float32Array(attribute.count * 3);
    for (let i = 0; i < attribute.count; i++) {
      v.fromBufferAttribute(attribute, i)
        .applyMatrix3(linear)
        .toArray(delta, i * 3);
    }
    return delta;
  });
  if (targets.length !== 2) {
    throw new Error(`Hug model part "${mesh.name}" needs 2 morph targets, found ${targets.length}`);
  }
  return { base, targets, index: geometry.index.clone() };
}

function normalsFor(positions: Float32Array, index: THREE.BufferAttribute): Float32Array {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal.array as Float32Array;
  geometry.dispose();
  return normals;
}

/** Builds the morphing geometry, with normals computed for each state. */
function buildGeometry(part: BakedPart, offset: THREE.Vector3): THREE.BufferGeometry {
  const base = part.base.slice();
  for (let i = 0; i < base.length; i += 3) {
    base[i] -= offset.x;
    base[i + 1] -= offset.y;
    base[i + 2] -= offset.z;
  }
  const baseNormals = normalsFor(base, part.index);
  const normalDeltas = part.targets.map((delta) => {
    const positions = new Float32Array(base.length);
    for (let i = 0; i < base.length; i++) positions[i] = base[i] + delta[i];
    const normals = normalsFor(positions, part.index);
    for (let i = 0; i < normals.length; i++) normals[i] -= baseNormals[i];
    return normals;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(base, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(baseNormals, 3));
  geometry.setIndex(part.index);
  geometry.morphAttributes.position = part.targets.map((t) => new THREE.BufferAttribute(t, 3));
  geometry.morphAttributes.normal = normalDeltas.map((n) => new THREE.BufferAttribute(n, 3));
  geometry.morphTargetsRelative = true;
  return geometry;
}

/** Centre of the footprint across all three states, so the model turns on its own axis. */
function footprintCentre(parts: BakedPart[]): THREE.Vector3 {
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (const part of parts) {
    for (const delta of [null, ...part.targets]) {
      for (let i = 0; i < part.base.length; i += 3) {
        v.set(part.base[i], part.base[i + 1], part.base[i + 2]);
        if (delta) v.x += delta[i];
        if (delta) v.y += delta[i + 1];
        if (delta) v.z += delta[i + 2];
        box.expandByPoint(v);
      }
    }
  }
  return new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
}

function rgb(glow: string, out: THREE.Vector3) {
  const [r, g, b] = glow.split(" ").map((n) => Number(n) / 255);
  return out.set(r, g, b);
}

export async function mountHugModel(options: HugSceneOptions): Promise<HugScene> {
  const { canvas, src, getInputs, reducedMotion, onLayout, onInteract } = options;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(src);
  gltf.scene.updateMatrixWorld(true);

  const sources: THREE.Mesh[] = [];
  gltf.scene.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) sources.push(object as THREE.Mesh);
  });
  if (sources.length === 0) throw new Error(`No meshes in ${src}`);
  const parts = sources.map(bake);
  const centre = footprintCentre(parts);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 3);
  const scene = new THREE.Scene();
  const lamp = new THREE.Group();
  scene.add(lamp);
  const normalMaterial = new THREE.ShaderMaterial({
    vertexShader: normalVertexShader,
    fragmentShader: normalFragmentShader,
    side: THREE.DoubleSide,
  });
  const meshes = parts.map((part) => {
    const mesh = new THREE.Mesh(buildGeometry(part, centre), normalMaterial);
    lamp.add(mesh);
    return mesh;
  });

  const target = new THREE.WebGLRenderTarget(1, 1, {
    depthTexture: new THREE.DepthTexture(1, 1),
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const composite = new THREE.ShaderMaterial({
    vertexShader: compositeVertexShader,
    fragmentShader: compositeFragmentShader,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tNormal: { value: target.texture },
      tDepth: { value: target.depthTexture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uNear: { value: camera.near },
      uFar: { value: camera.far },
      uPaper: { value: new THREE.Vector3(0.949, 0.929, 0.894) },
      uGraphite: { value: new THREE.Vector3(0.2, 0.19, 0.18) },
      uWash: { value: new THREE.Vector3(1, 1, 1) },
      uWashAmount: { value: 0 },
      uLight: { value: new THREE.Vector3(-0.55, 0.55, 0.63).normalize() },
    },
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), composite);
  const screen = new THREE.Scene();
  screen.add(quad);
  const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const focus = new THREE.Vector3(0, HEIGHT * 0.47, 0);
  const elevation = THREE.MathUtils.degToRad(11);
  const point = new THREE.Vector3();

  const toScreen = (x: number, y: number, z: number, width: number, height: number) => {
    point.set(x, y, z).project(camera);
    return { x: ((point.x + 1) / 2) * width, y: ((1 - point.y) / 2) * height };
  };

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    const ratio = renderer.getPixelRatio();
    target.setSize(Math.round(width * ratio), Math.round(height * ratio));
    composite.uniforms.uResolution.value.set(Math.round(width * ratio), Math.round(height * ratio));
    composite.uniforms.uPixelRatio.value = ratio;

    camera.aspect = width / height;
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const distance = 0.25 / Math.sin(Math.min(vertical, horizontal) / 2);
    camera.position.set(
      0,
      focus.y + Math.sin(elevation) * distance,
      Math.cos(elevation) * distance
    );
    camera.lookAt(focus);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const left = toScreen(-BASE_RADIUS, 0, 0, width, height);
    const right = toScreen(BASE_RADIUS, 0, 0, width, height);
    const front = toScreen(0, 0, BASE_RADIUS, width, height);
    const back = toScreen(0, 0, -BASE_RADIUS, width, height);
    const top = toScreen(DIMENSION_X, HEIGHT, 0, width, height);
    const bottom = toScreen(DIMENSION_X, 0, 0, width, height);
    onLayout({
      width,
      height,
      base: {
        cx: (left.x + right.x) / 2,
        cy: (front.y + back.y) / 2,
        rx: (right.x - left.x) / 2,
        ry: (front.y - back.y) / 2,
      },
      dimension: { x: bottom.x, top: top.y, bottom: bottom.y },
    });
    dirty = true;
  }

  let yaw = START_YAW;
  let targetYaw = START_YAW;
  let lastInteraction = -Infinity;
  let dragging = false;
  let lastX = 0;
  let dirty = true;
  let power = getInputs().power ? 1 : 0;
  const wash = rgb(getInputs().glow, new THREE.Vector3());
  const washTarget = new THREE.Vector3();
  let lastProgress = Number.NaN;

  const interact = () => {
    lastInteraction = performance.now();
    onInteract();
  };

  function onPointerDown(event: PointerEvent) {
    dragging = true;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
    interact();
  }
  function onPointerMove(event: PointerEvent) {
    if (!dragging) return;
    targetYaw += (event.clientX - lastX) * 0.01;
    lastX = event.clientX;
    lastInteraction = performance.now();
  }
  function onPointerUp(event: PointerEvent) {
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  let raf = 0;
  let last = performance.now();
  let onScreen = true;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const inputs = getInputs();
    if (!inputs.active) return;

    if (!reducedMotion && !dragging && now - lastInteraction > IDLE_BEFORE_AUTO_ROTATE) {
      targetYaw += AUTO_ROTATE_SPEED * dt;
    }
    const ease = reducedMotion ? 1 : Math.min(1, dt * 8);
    const previousYaw = yaw;
    yaw += (targetYaw - yaw) * ease;

    const fade = reducedMotion ? 1 : Math.min(1, dt * 5);
    const previousPower = power;
    power += ((inputs.power ? 1 : 0) - power) * fade;
    rgb(inputs.glow, washTarget);
    const washChange = wash.distanceTo(washTarget);
    wash.lerp(washTarget, fade);

    const changed =
      dirty ||
      Math.abs(yaw - previousYaw) > 1e-5 ||
      Math.abs(power - previousPower) > 1e-4 ||
      washChange > 1e-4 ||
      inputs.progress !== lastProgress;
    if (!changed) return;

    dirty = false;
    lastProgress = inputs.progress;
    lamp.rotation.y = yaw;
    const [half, gathered] = morphWeights(inputs.progress);
    for (const mesh of meshes) {
      if (!mesh.morphTargetInfluences) continue;
      mesh.morphTargetInfluences[0] = half;
      mesh.morphTargetInfluences[1] = gathered;
    }
    composite.uniforms.uWash.value.copy(wash);
    composite.uniforms.uWashAmount.value = power * (0.34 + 0.3 * inputs.progress);

    renderer.setRenderTarget(target);
    renderer.setClearColor(0x8080ff, 0);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(screen, screenCamera);
  }

  function start() {
    if (raf || !onScreen || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibility = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    if (onScreen) start();
    else stop();
  });
  visibility.observe(canvas);
  const onVisibilityChange = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibilityChange);

  resize();
  start();

  return {
    invalidate: () => {
      dirty = true;
    },
    rotateBy: (radians: number) => {
      targetYaw += radians;
      interact();
    },
    dispose: () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      for (const mesh of meshes) mesh.geometry.dispose();
      normalMaterial.dispose();
      quad.geometry.dispose();
      composite.dispose();
      target.depthTexture?.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}
