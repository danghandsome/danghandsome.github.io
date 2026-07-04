// Three.js WebGL background with Perlin noise — organic, realistic effect
(function () {
  // Wait for DOM to be ready
  function initNoise() {
    var canvas = document.getElementById("bg");
    if (!canvas) {
      setTimeout(initNoise, 100);
      return;
    }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0e1a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  camera.position.z = 1;

  // Noise vertex shader
  var vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Noise fragment shader (Perlin-like noise)
  var fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;

    // Simplex noise (optimized for WebGL)
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy) );
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 sx = sign(x);
      vec3 sh = step(h, vec3(0.0));
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 st = vUv;

      // Multi-layer noise for organic feel
      float n1 = snoise(st * 3.0 + uTime * 0.1);
      float n2 = snoise(st * 7.0 + uTime * 0.15);
      float n3 = snoise(st * 15.0 + uTime * 0.2);

      float noise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);
      noise = smoothstep(-0.5, 0.5, noise);

      // Mouse interaction (subtle)
      vec2 mouseEffect = uMouse * 0.3;
      float dist = length(st - (vec2(0.5) + mouseEffect));
      float mouseFactor = 1.0 - smoothstep(0.0, 0.8, dist);

      noise += mouseFactor * 0.15 * sin(uTime);

      // Color gradient
      vec3 col1 = vec3(0.04, 0.07, 0.15); // deep blue
      vec3 col2 = vec3(0.1, 0.14, 0.2);   // slightly lighter
      vec3 col3 = vec3(0.0, 0.85, 1.0) * 0.1; // hint of cyan

      vec3 color = mix(col1, col2, noise);
      color += col3 * (noise * 0.3 + mouseFactor * 0.2);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Create plane with noise shader
  var geometry = new THREE.PlaneGeometry(2, 2);
  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
    },
    side: THREE.FrontSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Mouse tracking
  var mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation loop
  var time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.0016;

    material.uniforms.uTime.value = time;
    material.uniforms.uMouse.value.copy(new THREE.Vector2(mouse.x, mouse.y));

    renderer.render(scene, camera);
  }
  animate();

    // Handle window resize
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Initialize when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNoise);
  } else {
    initNoise();
  }
})();
