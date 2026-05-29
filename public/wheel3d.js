(function () {
  'use strict';

  const container = document.getElementById('wheel3d-container');
  if (!container || typeof THREE === 'undefined') return;

  // ------------------------------------------------
  // Scene
  // ------------------------------------------------
  const scene = new THREE.Scene();

  // ------------------------------------------------
  // Camera (90° rotated to right)
  // ------------------------------------------------
  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  // Side view (90° right)
  camera.position.set(4.8, 0.4, 0);
  camera.lookAt(0, 0, 0);

  // ------------------------------------------------
  // Renderer
  // ------------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);

  // ------------------------------------------------
  // Lighting (studio render)
  // ------------------------------------------------
  scene.add(
     new THREE.AmbientLight(
       0xffffff,
       0.7
     )
  );

  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
       1.2
    );

  keyLight.position.set(5, 6, 5);

  scene.add(keyLight);

  const fillLight =
    new THREE.DirectionalLight(
      0xffffff,
       0.5
    );

  fillLight.position.set(
    -5,
    3,
    4
  );

  scene.add(fillLight);

  const rimLight =
    new THREE.DirectionalLight(
      0xffffff,
       0.6
    );

  rimLight.position.set(
      -4,
      2,
      -5
  );

  scene.add(rimLight);

  // ------------------------------------------------
  // Texture Loader
  // ------------------------------------------------
  const textureLoader =
    new THREE.TextureLoader();

  // CHANGE THIS PATH
  const wheelTexture =
    textureLoader.load(
      '/assets/wheel-reference.png'
    );

  wheelTexture.colorSpace =
    THREE.SRGBColorSpace;

  wheelTexture.anisotropy =
    renderer.capabilities.getMaxAnisotropy();

  // ------------------------------------------------
  // Wheel Geometry
  // ------------------------------------------------
  const wheelRadius = 1.15;
  const wheelWidth = 0.85;

  const wheelGeometry =
    new THREE.CylinderGeometry(
      wheelRadius,
      wheelRadius,
      wheelWidth,
      64
    );

  // Make wheel face camera
  wheelGeometry.rotateZ(
    Math.PI / 2
  );

  wheelGeometry.scale(
    0.6,
    0.6,
    0.6
  );

  // ------------------------------------------------
  // Materials
  // ------------------------------------------------

  // Glossy black urethane sidewall
  const wheelMaterial =
    new THREE.MeshPhysicalMaterial({
      color: '#1a1a1a',
      roughness: 0.2,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15
    });

  // Front / Back graphic
  const graphicMaterial =
    new THREE.MeshStandardMaterial({
      map: wheelTexture,
      roughness: 0.55
    });

  // Cylinder material order:
  // [side, top, bottom]
  const materials = [
    wheelMaterial,
    graphicMaterial,
    graphicMaterial
  ];

  const wheel =
    new THREE.Mesh(
      wheelGeometry,
      materials
    );

  // Face the camera
  wheel.rotation.y =
    0;

  scene.add(wheel);

  // ------------------------------------------------
  // Bearing hole
  // ------------------------------------------------
  const holeGeometry =
    new THREE.CylinderGeometry(
      0.18,
      0.18,
      wheelWidth + 0.08,
      32
    );

  holeGeometry.scale(
    0.6,
    0.6,
    0.6
  );

  const holeMaterial =
    new THREE.MeshStandardMaterial({
      color: '#111111',
      roughness: 1
    });

  const hole =
    new THREE.Mesh(
      holeGeometry,
      holeMaterial
    );

  hole.rotation.z =
    Math.PI / 2;

  scene.add(hole);

  // ------------------------------------------------
  // Resize
  // ------------------------------------------------
  function onResize() {
    const width =
      container.clientWidth;

    const height =
      container.clientHeight;

    if (!width || !height)
      return;

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
      width,
      height
    );
  }

  window.addEventListener(
    'resize',
    onResize
  );

  // ------------------------------------------------
  // Animation
  // ------------------------------------------------
  const clock =
    new THREE.Clock();

  function animate() {
    requestAnimationFrame(
      animate
    );

    const t =
      clock.getElapsedTime();

    // subtle floating motion
    const floatY =
      Math.sin(t * 2) *
      0.03;

    wheel.position.y =
      floatY;

    wheel.rotation.x =
      t * 2;

    hole.position.y =
      floatY;

    hole.rotation.x =
      t * 2;

    renderer.render(
      scene,
      camera
    );
  }

  animate();
})();