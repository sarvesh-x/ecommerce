(function () {
  'use strict';

  const container = document.getElementById('skateboard3d-container');
  if (!container || typeof THREE === 'undefined') return;

  // ------------------------------------------------
  // Scene
  // ------------------------------------------------
  const scene = new THREE.Scene();

  // ------------------------------------------------
  // Camera
  // ------------------------------------------------
  const camera = new THREE.PerspectiveCamera(
    32,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  camera.position.set(3.6, 2.2, 4.8);
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
  // Lighting
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
      2.2
    );

  keyLight.position.set(6, 8, 4);
  scene.add(keyLight);

  const fillLight =
    new THREE.DirectionalLight(
      0xffffff,
      0.8
    );

  fillLight.position.set(
    -4,
    3,
    5
  );

  scene.add(fillLight);

  const rimLight =
    new THREE.DirectionalLight(
      0xffffff,
      0.6
    );

  rimLight.position.set(
    -3,
    1,
    -6
  );

  scene.add(rimLight);

  // ------------------------------------------------
  // Load GLB Model
  // ------------------------------------------------
  const skateboard =
    new THREE.Group();

  const loader =
    new THREE.GLTFLoader();

  loader.load(
    '/assets/skateboard.glb',
    function (gltf) {
      const model =
        gltf.scene;

      const box =
        new THREE.Box3().setFromObject(
          model
        );

      const center =
        box.getCenter(
          new THREE.Vector3()
        );

      model.position.sub(center);

      const size =
        box.getSize(
          new THREE.Vector3()
        );

      const maxDim =
        Math.max(
          size.x,
          size.y,
          size.z
        );

      const targetScale =
        3.3 / maxDim;

      model.scale.set(
        targetScale,
        targetScale,
        targetScale
      );

      skateboard.add(model);
    }
  );

  skateboard.position.y =
    -0.1;

  scene.add(skateboard);

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

    const floatY =
      Math.sin(t * 1.2) *
      0.04;

    skateboard.position.y =
      -0.1 + floatY;

    skateboard.rotation.y =
      Math.sin(t * 0.3) * 0.15;

    skateboard.rotation.x =
      Math.sin(t * 0.5) * 0.02;

    renderer.render(
      scene,
      camera
    );
  }

  animate();
})();
