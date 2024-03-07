//import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/FBXLoader.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js'; // Updated URL

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5; //set camera on z axis and move by 5
_LoadAnimatedModel(){
  const loader = new FBXLoader();
  loader.setPath('./static/mutant/mutant idle.fbx');
}

const loader = new GLTFLoader()
const currentPath = window.location.pathname;
console.log(currentPath); 
loader.load('static/monster.glb', function(glb){
    console.log("monster",glb);
    const root=glb.scene;
    root.scale.set(0.1,0.1,0.1);
    scene.add(root);
},function(xhr){
    console.log(xhr.loaded/xhr.total *100)+"% loaded";
},function(error){
    console.log("error");
})

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const sceneBox = document.getElementById("scene-box");
sceneBox.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(10, 10);
planeGeometry.rotateX(30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const fogColor = "#000";
const fogNear = 2;
const fogFar = 8;
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

const threeJsShapes = [];
for (const el of shapes) {
  const { type, color } = el;
  console.log(type,color);
  let geometry;
  switch (type) {
    case 1:
      geometry = new THREE.SphereGeometry(1, 50, 50);
      break;
    case 2:
      geometry = new THREE.BoxGeometry(1, 1, 1);
      break;
    default:
        const radiusTop = 0.5;
      const radiusBottom = 0.5;
      const height = 1;
      const radialSegments = 50;
      geometry = new THREE.CylinderGeometry(radiusTop,radiusBottom ,height,radialSegments );
      break;
  }
  const material = new THREE.MeshPhongMaterial({ color: color }); //phong material requires lightning
  const shape = new THREE.Mesh(geometry, material);
  shape.position.x = (Math.random() - 0.5) * 10;
  shape.position.y = Math.random() * 2 + 1;
  shape.position.z = (Math.random() - 0.5) * 10;

  scene.add(shape);
  threeJsShapes.push(shape);
}
// const ambientLight = new THREE.AmbientLight("#ffffff",1.5);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff",2)
directionalLight.position.set(1,2,3);
scene.add(directionalLight);

const animate = () => {
  threeJsShapes.forEach(shape=>{
    shape.rotation.x += 0.01;
    shape.rotation.y += 0.01;

  })
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
const controls = new OrbitControls(camera, renderer.domElement)
animate();
console.log("main.js loaded");
