// 3D Hero Background — Node Network (Dynamic)
// Mooniverse theme: cyan/magenta accent lines, subtle animated nodes

(function () {
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, precision: 'highp' });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0e1a, 0.95);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  camera.position.z = 50;

  // Lighting
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  var pointLight = new THREE.PointLight(0x00d9ff, 0.8, 150);
  pointLight.position.set(30, 30, 30);
  scene.add(pointLight);

  // Create node network
  var nodeCount = 40;
  var nodes = [];
  var nodeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  var nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00d9ff,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0x00d9ff,
    emissiveIntensity: 0.4
  });

  for (var i = 0; i < nodeCount; i++) {
    var nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    var x = (Math.random() - 0.5) * 100;
    var y = (Math.random() - 0.5) * 100;
    var z = (Math.random() - 0.5) * 80;
    nodeMesh.position.set(x, y, z);
    nodeMesh.userData.targetPos = { x: x, y: y, z: z };
    nodeMesh.userData.velocity = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };
    scene.add(nodeMesh);
    nodes.push(nodeMesh);
  }

  // Create connecting lines between nearby nodes
  var lineGeometry = new THREE.BufferGeometry();
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00d9ff,
    transparent: true,
    opacity: 0.2,
    fog: false
  });
  var lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse interaction
  var mouse = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 };
  var targetRotation = { x: 0, y: 0 };

  document.addEventListener("mousemove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
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

  // Animation loop
  var time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.0016;

    // Subtle auto-rotation
    scene.rotation.y += 0.0002;
    scene.rotation.x += Math.sin(time * 0.5) * 0.0001;

    // Animate nodes
    nodes.forEach(function (node) {
      var basePos = node.userData.targetPos;
      // Gentle floating
      node.position.x = basePos.x + Math.sin(time * 0.3 + basePos.x) * 2;
      node.position.y = basePos.y + Math.cos(time * 0.25 + basePos.y) * 2;
      node.position.z = basePos.z + Math.sin(time * 0.2 + basePos.z) * 1.5;

      // Subtle rotation
      node.rotation.x += 0.0005;
      node.rotation.y += 0.0008;

      // Pulse glow
      var glow = 0.3 + Math.sin(time * 2 + basePos.x) * 0.2;
      node.material.emissiveIntensity = glow;
    });

    // Update connecting lines
    var positions = [];
    var maxDist = 30;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < maxDist) {
          positions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
          positions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    // Lights follow scene
    pointLight.position.copy(camera.position).normalize().multiplyScalar(50);

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
