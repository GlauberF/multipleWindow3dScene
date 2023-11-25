import WindowManager from './WindowManager.js';

const t = THREE;
let camera, scene, renderer, world;
let spheres = [];
let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };
let windowManager;
let near, far;

// Função para obter o tempo em segundos desde o início do dia
function getTime() {
  return (new Date().getTime() - today) / 1000.0;
}

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

function init() {
  initialized = true;

  // Adicione um curto atraso porque window.offsetX relata valores incorretos antes de um curto período
  setTimeout(() => {
    setupScene();
    setupWindowManager();
    resize();
    updateWindowShape(false);
    render();
    window.addEventListener('resize', resize);
  }, 500);
}

function setupScene() {
  camera = new t.OrthographicCamera(
    0,
    0,
    window.innerWidth,
    window.innerHeight,
    -10000,
    10000
  );

  camera.position.z = 2.5;
  near = camera.position.z - 0.5;
  far = camera.position.z + 0.5;

  scene = new t.Scene();
  scene.background = new t.Color(0.0);
  scene.add(camera);

  renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
  renderer.setPixelRatio(
    window.devicePixelRatio ? window.devicePixelRatio : 1
  );

  world = new t.Object3D();
  scene.add(world);

  renderer.domElement.setAttribute('id', 'scene');
  document.body.appendChild(renderer.domElement);
}

function setupWindowManager() {
  windowManager = new WindowManager();
  windowManager.setWinShapeChangeCallback(updateWindowShape);
  windowManager.setWinChangeCallback(windowsUpdated);

  let metaData = { foo: 'bar' };

  windowManager.init(metaData);

  windowsUpdated();
}

function windowsUpdated() {
  updateNumberOfSpheres();
}

function updateNumberOfSpheres() {
  let wins = windowManager.getWindows();

  spheres.forEach((s) => {
    world.remove(s);
  });

  spheres = [];

  for (let i = 0; i < wins.length; i++) {
    let win = wins[i];

    let c = new t.Color();
    c.setHSL(i * 0.1, 1.0, 0.5);

    let radius = 50 + i * 25;
    let sphere = new t.Mesh(
      new t.SphereGeometry(radius, 32, 32),
      new t.MeshBasicMaterial({ color: c, wireframe: true })
    );
    sphere.position.x = win.shape.x + win.shape.w * 0.5;
    sphere.position.y = win.shape.y + win.shape.h * 0.5;

    world.add(sphere);
    spheres.push(sphere);
  }
}

function updateWindowShape(easing = true) {
  sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
  if (!easing) sceneOffset = sceneOffsetTarget;
}

function render() {
    let t = getTime();
  
    windowManager.update();
    updateSpheresPositions(); // Nova chamada para atualizar posições mais frequentemente
  
    let falloff = 0.05;
    sceneOffset.x += (sceneOffsetTarget.x - sceneOffset.x) * falloff;
    sceneOffset.y += (sceneOffsetTarget.y - sceneOffset.y) * falloff;
  
    world.position.x = sceneOffset.x;
    world.position.y = sceneOffset.y;
  
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  
  function updateSpheresPositions() {
    let wins = windowManager.getWindows();
  
    for (let i = 0; i < spheres.length; i++) {
      let sphere = spheres[i];
      let win = wins[i];
      let _t = getTime();
  
      let posTarget = {
        x: win.shape.x + win.shape.w * 0.5,
        y: win.shape.y + win.shape.h * 0.5,
      };
  
      sphere.position.x += (posTarget.x - sphere.position.x) * 0.05;
      sphere.position.y += (posTarget.y - sphere.position.y) * 0.05;
      sphere.rotation.x = _t * 0.5;
      sphere.rotation.y = _t * 0.3;
    }
  }

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new t.OrthographicCamera(
    0,
    width,
    0,
    height,
    -10000,
    10000
  );
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

let initialized = false;

// Código essencial para evitar que alguns navegadores pré-carreguem o conteúdo de algumas páginas antes que você realmente a acesse
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState != 'hidden' && !initialized) {
    init();
  }
});

window.onload = () => {
  if (document.visibilityState != 'hidden') {
    init();
  }
};
