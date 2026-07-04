// 3D Interactive Hero Scene — Mooniverse VR theme
// Floating orbs representing AI, projects, and skills

(function () {
  // Viewport check
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  // Scene setup
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, precision: 'highp' });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0e1a, 0.95);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;

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

  // Solar System planets — real colors from our solar system
  var orbs = [
    {
      name: "Sun (AI Core)",
      color: 0xfdb813,  // Golden yellow
      size: 3.2,
      x: -8,
      y: 2,
      z: 0,
      info: "codeassist — agentic loop",
      hasRing: false
    },
    {
      name: "Earth (HIS)",
      color: 0x4b9fd8,  // Ocean blue
      size: 2.2,
      x: 8,
      y: 8,
      z: -6,
      info: "Production hospital system",
      hasRing: false
    },
    {
      name: "Mars (Projects)",
      color: 0xe27b58,  // Rusty red
      size: 2.0,
      x: -12,
      y: -6,
      z: -5,
      info: "Healthcare + AI engineering",
      hasRing: false
    },
    {
      name: "Saturn (Skills)",
      color: 0xfad5a5,  // Pale yellow
      size: 1.4,
      x: 10,
      y: -8,
      z: 3,
      info: "C#, .NET, Claude API",
      hasRing: true
    },
    {
      name: "Jupiter (3D)",
      color: 0xc88b3a,  // Orange-brown
      size: 1.8,
      x: -6,
      y: -10,
      z: 2,
      info: "Three.js, WebGL, immersive",
      hasRing: false
    }
  ];

  // Procedural planet texture generator
  function createPlanetTexture(name, color) {
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext("2d");

    // Base color
    ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Planet-specific details
    if (name.includes("Earth")) {
      // Add continents-like patterns
      ctx.fillStyle = "rgba(76,140,56,0.4)";
      for (var i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
        ctx.fill();
      }
      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 60 + 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (name.includes("Jupiter")) {
      // Add storm bands
      ctx.fillStyle = "rgba(200,140,60,0.3)";
      for (var y = 0; y < canvas.height; y += 40) {
        ctx.fillRect(0, y, canvas.width, 20);
      }
      ctx.fillStyle = "rgba(139,100,50,0.4)";
      for (var y = 20; y < canvas.height; y += 40) {
        ctx.fillRect(0, y, canvas.width, 20);
      }
    } else if (name.includes("Mars")) {
      // Rough surface
      ctx.fillStyle = "rgba(180,100,80,0.3)";
      for (var i = 0; i < 100; i++) {
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 20 + 5, Math.random() * 20 + 5);
      }
    } else if (name.includes("Saturn")) {
      // Banded appearance
      ctx.fillStyle = "rgba(200,180,100,0.2)";
      for (var y = 0; y < canvas.height; y += 35) {
        ctx.fillRect(0, y, canvas.width, 15);
      }
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  // Create planets with optional rings
  var orbMeshes = [];
  orbs.forEach(function (orbData) {
    var group = new THREE.Group();
    group.position.set(orbData.x, orbData.y, orbData.z);
    group.userData.targetPos = { x: orbData.x, y: orbData.y, z: orbData.z };
    group.userData.info = orbData.info;
    group.userData.name = orbData.name;

    // Planet body with texture
    var geometry = new THREE.SphereGeometry(orbData.size, 32, 32);
    var texture = createPlanetTexture(orbData.name, orbData.color);
    var material = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.1,
      roughness: 0.7,
      emissiveMap: texture,
      emissive: orbData.color,
      emissiveIntensity: 0.4
    });
    var planetMesh = new THREE.Mesh(geometry, material);
    group.add(planetMesh);

    // Planet rings (for some planets)
    if (orbData.hasRing) {
      var ringGeometry = new THREE.TorusGeometry(orbData.size * 1.8, orbData.size * 0.5, 16, 100);
      var ringTexture = createPlanetTexture(orbData.name + "_ring", orbData.color);
      var ringMaterial = new THREE.MeshStandardMaterial({
        map: ringTexture,
        metalness: 0.05,
        roughness: 0.8,
        emissive: orbData.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      var ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = 0.4 + Math.random() * 0.3;
      group.add(ringMesh);
    }

    scene.add(group);
    orbMeshes.push(group);
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

    // Animate planets — smooth floating with orbital motion
    orbMeshes.forEach(function (planet, idx) {
      var basePos = planet.userData.targetPos;
      var phase = idx * 0.4; // stagger animation phases

      // Subtle floating motion
      planet.position.x = basePos.x + Math.sin(time * 0.2 + phase) * 0.6;
      planet.position.y = basePos.y + Math.cos(time * 0.18 + phase) * 0.5;
      planet.position.z = basePos.z + Math.sin(time * 0.12 + phase) * 0.4;

      // Gentle self-rotation
      planet.children[0].rotation.x += 0.0006;
      planet.children[0].rotation.y += 0.001;

      // Ring rotation (if present)
      if (planet.children[1]) {
        planet.children[1].rotation.z += 0.0003;
      }
    });

    // Lights follow camera smoothly
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
