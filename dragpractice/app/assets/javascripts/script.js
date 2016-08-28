var dragTutorial = {
  scene: null, camera: null, renderer: null, container: null, controls: null, clock: null, stats: null, plane: null, selection: null, offset: new THREE.Vector3(), objects: [], raycaster: new THREE.Raycaster(),

  init: function() {

    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Create the camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(100, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.fog.color);

    //Create container
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);

    //Create events
    //THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    //Create Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.targe = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 150;


    //Create lights
    this.scene.add( new THREE.AmbientLight(0x444444));
    var dirLight = new THREE.DirectionalLight(0xffffff);
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    this.clock = new THREE.Clock();
    //Create random spheres
    var object, material, radius;
    var objGeometry = new THREE.SphereGeometry(1, 24, 24);
    for (var i = 0; i < 10; i++) {
      material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
      material.transparent = true;
      object = new THREE.Mesh(objGeometry.clone(), material);
      this.objects.push(object);

      radius = Math.random() * 4 + 2;
      object.scale.x = radius;
      object.scale.y = radius;
      object.scale.z = radius;

      object.position.x = Math.random() * 50 - 25;
      object.position.y = Math.random() * 50 - 25;
      object.position.z = Math.random() * 50 - 25;

      this.scene.add(object);
    }

    //plane helps up determine how we can navigate a 3d plane with a mouse
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}));
    this.plane.visible = false;
    this.scene.add(this.plane);
  },

  onDocumentMouseDown: function(event){
    //Find the mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = (event.clientY / window.innerHeight) *2 - 1;
    //Get the 3D vector via the mouse position
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(dragTutorial.camera);
    dragTutorial.raycaster.set(dragTutorial.camera.position, vector.sub( dragTutorial.camera.position).normalize());

    var intersects = dragTutorial.raycaster.intersectObjects(dragTutorial.objects);

    if (intersects.length > 0){
      dragTutorial.controls.enabled = false;

      dragTutorial.selection = intersects[0].object;

      var intersects = dragTutorial.raycaster.intersectObject(dragTutorial.plane);
      dragTutorial.offset.copy(intersects[0].point).sub(dragTutorial.plane.position);
    }
  },

  onDocumentMouseMove: function(event){
    event.preventDefault();
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(dragTutorial.camera);
    dragTutorial.raycaster.set(dragTutorial.camera.position, vector.sub( dragTutorial.camera.position).normalize());
    if (dragTutorial.selection){
      var intersects = dragTutorial.raycaster.intersectObject(dragTutorial.plane);
      dragTutorial.selection.position.copy(intersects[0].point.sub(dragTutorial.offset));
    }
    else
      var intersects = dragTutorial.raycaster.intersectObjects(dragTutorial.objects);
      if (intersects.length > 0) {
        dragTutorial.plane.position.copy(intersects[0].object.position);
        dragTutorial.plane.lookAt(dragTutorial.camera.position);
      }
  },

  onDocumentMouseUp: function(event){
    dragTutorial.controls.enabled = true;
    dragTutorial.selection = null;
  }
};

//Function to animate scene
function animate(){
  requestAnimationFrame(animate);
  render();
  update();
}
//Function to update controls
function update(){
  var delta = dragTutorial.clock.getDelta();
  dragTutorial.controls.update(delta);
}
//Function to call the render
function render(){
  if (dragTutorial.renderer){
    dragTutorial.renderer.render(dragTutorial.scene, dragTutorial.camera);
  }
}

//Function to call render on page load
function initialize(){
  dragTutorial.init();
  animate();
}

window.onload = initialize;
