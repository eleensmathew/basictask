import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js"; // Updated URL

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//set camera on z axis and move by 5
camera.position.z = 30;
camera.position.x = 0;
camera.position.y = -3;

const currentPath = window.location.pathname;
console.log(currentPath);

const renderer = new THREE.WebGLRenderer({ alpha: true }); //alpha = true makes background transparent
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setSize(200, 200); // to make character at bottom

//renderer.domElement.style.position = "fixed";
//renderer.domElement.style.bottom = "0px";
//renderer.domElement.style.right = "0px";

const sceneBox = document.getElementById("scene-box");
sceneBox.appendChild(renderer.domElement);

let mixer;
let shootAction;
let idleAction;
let possibleAnims;
let raycaster = new THREE.Raycaster();
let currentlyAnimating = false;
let neck;
let waist;

let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg'); //loading texture onto model

stacy_txt.flipY = false; // we flip the texture so that its the right way up

const stacy_mtl = new THREE.MeshPhongMaterial({
  map: stacy_txt,
  color: 0xffffff,
  skinning: true
});
const loader = new GLTFLoader();

//circle behind her
let geometry = new THREE.SphereGeometry(8, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e 
let sphere = new THREE.Mesh(geometry, material);
sphere.position.z = -15;
sphere.position.y = -2.5;
sphere.position.x = -0.25;
scene.add(sphere);

const loaderAnim = document.getElementById('js-loader');

loaderAnim.style.backgroundColor = 'red'; //doesnt work


//loading character
const MODEL_PATH = "static/Teacher_Nanami.glb";
loader.load(MODEL_PATH, function (gltf) {
  
  scene.add(gltf.scene);
  //loaderAnim.remove();//remove the loading sign once model has been added //doesnt work

  gltf.scene.position.y = -11;
  gltf.scene.scale.set(7, 7, 7);
  let fileAnimations = gltf.animations;

  mixer = new THREE.AnimationMixer(gltf.scene);
  let clips = fileAnimations.filter(val => val.name !== 'idle');//get all animtions that are not idle
  possibleAnims = clips.map(val => {
    let clip = THREE.AnimationClip.findByName(clips, val.name);
    clip.tracks.splice(3, 3);  //removing neck and spine from animations so we can manipulate later
    clip.tracks.splice(9, 3);
    clip = mixer.clipAction(clip);
    return clip;
   }
  );

  let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
  idleAnim.tracks.splice(3, 3); //here spine is 3, 4, 5
  idleAnim.tracks.splice(9, 3);  //neck movement is 12 13 14 but we removed 3 4 5 so 9 10 11
  idleAction = mixer.clipAction(idleAnim);
  idleAction.play();


  //add shadow
  renderer.shadowMap.enabled = true;
  // Enable shadows for the light source
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.castShadow = true;
  scene.add(light);
  let model = gltf.scene;
  model.traverse((o) => {
    // if (o.isBone) {
    //   console.log(o.name); //get the bone names and find neck and spine
    // }
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = stacy_mtl;
    }
    if (o.isBone && o.name === 'mixamorigNeck') { 
      neck = o;
    }
    if (o.isBone && o.name === 'mixamorigSpine') { 
      waist = o;
    }
  });

  //console.log(model);

  window.addEventListener('click', e => raycast(e));
  window.addEventListener('touchend', e => raycast(e, true));

  function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
      var object = intersects[0].object;

      if (object.name === 'stacy') {

        if (!currentlyAnimating) {
          currentlyAnimating = true;
          playOnClick();
        }
      }
    }
  }
  function playOnClick() {  //plays random animation when clicked
    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    playModifierAnimation(idleAction, 0.25, possibleAnims[anim], 0.25);
  }
  function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function() {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      currentlyAnimating = false;
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
  }
  document.addEventListener('mousemove', function(e) {
    var mousecoords = getMousePos(e);
  });
    
  function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
  }
  function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
  }
  function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    
      // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;  
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1; }
  // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = (xdiff / (w.x / 2)) * 100;
      dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
      }
    
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
  }
  document.addEventListener('mousemove', function(e) {
    var mousecoords = getMousePos(e);
  if (neck && waist) {
      moveJoint(mousecoords, neck, 50);
      moveJoint(mousecoords, waist, 30);
  }
  });

  // window.addEventListener(
  //   "dblclick",
  //   function (event) {
  //     //get the angle and rotate character
  //     var vector = new THREE.Vector3();
  //     vector.set(
  //       (event.clientX / window.innerWidth) * 2 - 1,
  //       -(event.clientY / window.innerHeight) * 2 + 1,
  //       0.5
  //     );
  //     vector.unproject(camera);
  //     var dir = vector.sub(camera.position).normalize();
  //     var distance = -camera.position.z / dir.z;
  //     var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  //     var angle = Math.atan2(
  //       pos.y - gltf.scene.position.y,
  //       pos.x - gltf.scene.position.x
  //     );
  //     gltf.scene.rotation.y = angle >= 0 ? angle : angle + 2 * Math.PI;

  //     if (mixer) {
  //       idleAction.enabled = false;
  //       shootAction.reset().play();
  //       shootAction.setLoop(THREE.LoopOnce);
  //       shootAction.clampWhenFinished = true;
  //     }
  //   },
  //   false
  // );
  // mixer.addEventListener("finished", function (e) {
  //   if (e.action === shootAction) {
  //     shootAction.crossFadeTo(idleAction, 1, true); // idle animation when the shoot animation is finished.
  //     //crossfade make animation smoother
  //     shootAction.stop();
  //   }
  // });
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
//const controls = new OrbitControls(camera, renderer.domElement);  //for orbital movement

animate();

// lighting
// const ambientLight = new THREE.AmbientLight("#404040");
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
// directionalLight.position.set(1, 2, 3);
// scene.add(directionalLight);

let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
scene.add(dirLight);

const pointLight = new THREE.PointLight("#ffffff", 1, 100);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);
console.log("main.js loaded");
