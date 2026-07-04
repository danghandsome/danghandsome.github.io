// 3D Interactive Hero Scene — Mooniverse VR theme
// Floating orbs representing AI, projects, and skills

(function () {
  // Viewport check
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  // Scene setup
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0e1a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  camera.position.z = 40;

  // Lighting
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  var pointLight1 = new THREE.PointLight(0x00d9ff, 1.5, 100);
  pointLight1.position.set(20, 20, 20);
  scene.add(pointLight1);

  var pointLight2 = new THREE.PointLight(0xff006e, 1.2, 100);
  pointLight2.position.set(-20, 15, 10);
  scene.add(pointLight2);

  // Orbs data
  var orbs = [
    {
      name: "AI Agent",
      color: 0x00d9ff,
      size: 3.5,
      x: 0,
      y: 0,
      z: 0,
      info: "codeassist — tool-use loop"
    },
    {
      name: "HIS Platform",
      color: 0x00f5a0,
      size: 2.5,
      x: 20,
      y: 12,
      z: -10,
      info: "Production hospital system"
    },
    {
      name: "Projects",
      color: 0xff006e,
      size: 2.5,
      x: -18,
      y: 10,
      z: -8,
      info: "Healthcare + AI engineering"
    },
    {
      name: "Skills",
      color: 0x00d9ff,
      size: 1.8,
      x: 15,
      y: -15,
      z: 5,
      info: "C#, .NET, Claude API, WinForms"
    },
    {
      name: "3D & Web",
      color: 0x00f5a0,
      size: 1.8,
      x: -16,
      y: -13,
      z: 3,
      info: "Three.js, responsive design"
    }
  ];

  // Create orbs with glow
  var orbMeshes = [];
  orbs.forEach(function (orbData) {
    var geometry = new THREE.IcosahedronGeometry(orbData.size, 5);
    var material = new THREE.MeshStandardMaterial({
      color: orbData.color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: orbData.color,
      emissiveIntensity: 0.5
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(orbData.x, orbData.y, orbData.z);
    mesh.userData.info = orbData.info;
    mesh.userData.name = orbData.name;
    mesh.userData.velocity = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };
    mesh.userData.targetPos = { x: orbData.x, y: orbData.y, z: orbData.z };
    scene.add(mesh);
    orbMeshes.push(mesh);
  });

  // Mouse interaction
  var mouse = { x: 0, y: 0, down: false };
  var rotation = { x: 0, y: 0 };
  var targetRotation = { x: 0, y: 0 };

  document.addEventListener("mousemove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  document.addEventListener("mousedown", function () {
    mouse.down = true;
  });

  document.addEventListener("mouseup", function () {
    mouse.down = false;
  });

  // Scroll zoom
  var zoom = 1;
  document.addEventListener("wheel", function (e) {
    zoom += e.deltaY * -0.001;
    zoom = Math.max(0.5, Math.min(3, zoom));
    camera.position.z = 40 / zoom;
  }, { passive: true });

  // Floating motion
  var time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.0016;

    // Rotate scene based on mouse
    if (mouse.down) {
      targetRotation.y += mouse.x * 0.05;
      targetRotation.x += mouse.y * 0.05;
    }
    rotation.y += (targetRotation.y - rotation.y) * 0.08;
    rotation.x += (targetRotation.x - rotation.x) * 0.08;
    scene.rotation.y = rotation.y;
    scene.rotation.x = rotation.x;

    // Animate orbs
    orbMeshes.forEach(function (orb) {
      // Floating motion
      var basePos = orb.userData.targetPos;
      orb.position.x = basePos.x + Math.sin(time * 0.5 + orb.position.x) * 1.5;
      orb.position.y = basePos.y + Math.cos(time * 0.4 + orb.position.y) * 1.5;
      orb.position.z = basePos.z + Math.sin(time * 0.3 + orb.position.z) * 1.2;

      // Rotation
      orb.rotation.x += 0.002;
      orb.rotation.y += 0.003;

      // Pulse effect
      var scale = 1 + Math.sin(time * 2) * 0.08;
      orb.scale.set(scale, scale, scale);
    });

    // Lights follow camera
    pointLight1.position.copy(camera.position).normalize().multiplyScalar(50);
    pointLight2.position.copy(camera.position).normalize().multiplyScalar(-40);

    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Mobile fallback: disable 3D on small screens
  if (window.innerWidth < 768) {
    renderer.domElement.style.opacity = "0.3";
    document.querySelector(".hero-canvas-wrap").style.background = "linear-gradient(135deg, rgba(0,217,255,.1), rgba(255,0,110,.08))";
  }
})();
