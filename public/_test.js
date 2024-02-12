<!DOCTYPE html>
<html lang="en">
  <head>
    <title>three.js webgl - earth</title>
    <meta charset="utf-8" />
    <script src="three.js/Detector.js"></script>
    <script src="three.js/Three.js"></script>
  </head>
  <body>
    <script>
      if (!Detector.webgl) Detector.addGetWebGLMessage();

      var radius = 6371;
      var tilt = 0.41;
      var rotationSpeed = 0.02;
      var cloudsScale = 1.005;
      var SCREEN_HEIGHT = window.innerHeight;
      var SCREEN_WIDTH = window.innerWidth;
      var container, camera, scene, renderer;
      var meshPlanet, meshClouds, dirLight, ambientLight;
      var clock = new THREE.Clock();

      init();
      animate();

      function init() {
        container = document.createElement('div');
        document.body.appendChild(container);

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

        camera = new THREE.PerspectiveCamera(
          25,
          SCREEN_WIDTH / SCREEN_HEIGHT,
          50,
          1e7,
        );
        camera.position.z = radius * 5;
        scene.add(camera);

        dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(-20, 0, 2).normalize();
        scene.add(dirLight);

        ambientLight = new THREE.AmbientLight(0x000000);
        scene.add(ambientLight);

        //initialize the earth
        var planetTexture = THREE.ImageUtils.loadTexture(
            'textures/earth-day.jpg',
          ),
          nightTexture = THREE.ImageUtils.loadTexture(
            'textures/earthNight.gif',
          ),
          cloudsTexture = THREE.ImageUtils.loadTexture('textures/clouds.gif'),
          normalTexture = THREE.ImageUtils.loadTexture(
            'textures/earth-map.jpg',
          ),
          specularTexture = THREE.ImageUtils.loadTexture(
            'textures/earth-specular.jpg',
          );
        var shader = THREE.ShaderUtils.lib['normal'];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms['tNormal'].texture = normalTexture;
        uniforms['uNormalScale'].value = 0.85;
        uniforms['tDiffuse'].texture = planetTexture;
        uniforms['tDiffuse2'].texture = nightTexture;
        uniforms['tSpecular'].texture = specularTexture;
        uniforms['enableAO'].value = false;
        uniforms['enableDiffuse'].value = true;
        uniforms['enableSpecular'].value = true;
        uniforms['uDiffuseColor'].value.setHex(0xffffff);
        uniforms['uSpecularColor'].value.setHex(0x333333);
        uniforms['uAmbientColor'].value.setHex(0x000000);
        uniforms['uShininess'].value = 15;
        var parameters = {
          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: uniforms,
          lights: true,
          fog: true,
        };
        var materialNormalMap = new THREE.ShaderMaterial(parameters);
        geometry = new THREE.SphereGeometry(radius, 100, 50);
        geometry.computeTangents();
        meshPlanet = new THREE.Mesh(geometry, materialNormalMap);
        meshPlanet.rotation.y = 0;
        meshPlanet.rotation.z = tilt;
        scene.add(meshPlanet);

        // clouds
        var materialClouds = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: cloudsTexture,
          transparent: true,
        });
        meshClouds = new THREE.Mesh(geometry, materialClouds);
        meshClouds.scale.set(cloudsScale, cloudsScale, cloudsScale);
        meshClouds.rotation.z = tilt;
        scene.add(meshClouds);

        renderer = new THREE.WebGLRenderer({
          clearColor: 0x000000,
          clearAlpha: 1,
        });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.sortObjects = false;
        renderer.autoClear = false;
        container.appendChild(renderer.domElement);
      }

      function animate() {
        requestAnimationFrame(animate);
        render();
      }

      function render() {
        // rotate the planet and clouds
        var delta = clock.getDelta();
        meshPlanet.rotation.y += rotationSpeed * delta;
        meshClouds.rotation.y += 1.25 * rotationSpeed * delta;
        //render the scene
        renderer.clear();
        renderer.render(scene, camera);
      }
    </script>
  </body>
</html>
