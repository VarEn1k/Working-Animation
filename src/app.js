import * as THREE from '../libs/three124/three.module'
import {VRButton} from "../libs/three124/jsm/VRButton.js"
import {GLTFLoader} from "../libs/three124/jsm/GLTFLoader";
import {DRACOLoader} from "../libs/three124/jsm/DRACOLoader"

import blimp from "../assets/Blimp.glb"
import chair from "../assets/medieval-chair.glb"
import {XRHandModelFactory} from "../libs/three124/jsm/XRHandModelFactory";
import {XRControllerModelFactory} from "../libs/three124/jsm/XRControllerModelFactory";
import fork from "../assets/Fork.glb"
import monster from "../assets/monster.glb"
import knight from "../src/knight.glb"
import {LoadingBar} from "../libs/LoadingBar";


 class App {
   tmpVector1 = new THREE.Vector3()
   tmpVector2 = new THREE.Vector3()
   fork;
   grabbing = false;
   scaling = {
     active: false,
     initialDistance: 0,
     object: null,
     initialScale: 1
   };
   clock = new THREE.Clock();
   spheres = []
   hand1
   hand2
   SphereRadius = 0.05
   world;
   gltf;
   loadingBar;

  constructor() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    this.camera = new THREE.PerspectiveCamera(50,
        window.innerWidth / window.innerHeight, 0.1, 200)
    this.camera.position.set(0, 1.6, 3)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x505050)

    const ambient = new THREE.HemisphereLight(0x606060, 0x404040, 1)
    this.scene.add(ambient)

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    this.scene.add(light)

    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputEncoding = THREE.sRGBEncoding
    container.appendChild(this.renderer.domElement)

    this.loadingBar = new LoadingBar();
    this.initScene()
    this.setupVR()

    this.renderer.setAnimationLoop(this.render.bind(this))
    window.addEventListener('resize', this.resize.bind(this))


  }


  initScene() {
    this.loadGLTF( knight );

    const self = this

    const geometry = new THREE.BoxBufferGeometry(.5, .5, .5)
    const material = new THREE.MeshStandardMaterial({color: 0xFF0000})
    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    const geometrySphere = new THREE.SphereGeometry(.7, 32, 16)
    const materialSphere = new THREE.MeshBasicMaterial({color: 0xffff00})
    const sphere = new THREE.Mesh(geometrySphere, materialSphere)
    this.scene.add(sphere)

    sphere.position.set(1.5, 0, 0)


    // this.loadAsset(fork, 0, 0.8, -2, scene => {
    //   const gltfScene = this.gltf.scene
    //   self.scene.add(gltfScene)
    //   const scale = 0.2
    //   scene.scale.set(scale, scale, scale)
    //   self.fork = scene
    // })
    //
    // this.loadAsset(monster, 0.8, 0.8, -1, scene => {
    //   const gltfScene = this.gltf.scene
    //   self.scene.add(gltfScene)
    //   const scale = 0.5
    //   scene.scale.set(scale, scale, scale)
    //   self.monster = scene
    // })

    // this.loadAsset(this.knight, gltf => {
    //   const gltfScene = gltf.scene.children[3]
    //   gltfScene.position.set(0, 0, -1.5)
    //
    //   self.knight = gltfScene
    //   const scale = 0.01;
    //   self.knight.scale.set(scale, scale, scale);
    //
    //   self.scene.add(gltfScene)
    //
    //   // animations
    //   self.animations = {};
    //
    //   gltf.animations.forEach( (anim)=>{
    //     self.animations[anim.name] = anim;
    //   })
    //
    //   self.mixer = new THREE.AnimationMixer(self.knight)
    //   // self.action = "Dance";
    //   // self.action = "Idle";
    //   self.action = "walk";
    // })

  }

   loadAsset(gltfFilename,sceneHandler) {
     const loader = new GLTFLoader()
     // Provide a DRACOLoader instance to decode compressed mesh data
     const draco = new DRACOLoader()
     draco.setDecoderPath('draco/')
     loader.setDRACOLoader(draco)

     loader.load(gltfFilename, (gltf) => {

           if (sceneHandler) {
             sceneHandler(gltf)
           }
         },
         null,
         (error) => console.error(`An error happened: ${error}`)
     )
   }


   set action(name){
     if (this.actionName === name) return;

     const clip = this.animations[name];

     if (clip !== undefined) {
       const action = this.mixer.clipAction(clip);

       if (name === 'kick') {
         action.loop = THREE.LoopOnce;
         action.clampWhenFinished = true;
       }

       this.actionName = name;
       if (this.curAction) this.curAction.crossFadeTo(action, 4);

       action.enabled = true;
       action.play();

       this.curAction = action;
     }
   }

  setupVR() {
    this.renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(this.renderer))
    const grip = this.renderer.xr.getControllerGrip(0)
    grip.add(new XRControllerModelFactory().createControllerModel(grip))
    this.scene.add(grip)
    const grip2 = this.renderer.xr.getControllerGrip(1)
    grip2.add(new XRControllerModelFactory().createControllerModel(grip2))
    this.scene.add(grip2)

    // const hand1 = this.renderer.xr.getHand(0)
    // hand1.add (new XRHandModelFactory().createHandModel(hand1, "mesh"))
    // this.scene.add(hand1)
    // hand1.addEventListener('selectstart',  evt => {
    //   self.changeAngle.bind(self, evt.handedness ).call();
    // } )

    // const hand2 = this.renderer.xr.getHand(1)
    // hand2.add (new XRHandModelFactory().createHandModel(hand2, "mesh"))
    // this.scene.add(hand2)

    // this.hand1 = hand1
    // this.hand2 = hand2
    this.grip = grip
    this.grip2 = grip2


    const self = this

    // hand1.addEventListener( 'pinchstart', event => {
    //   self.onPinchStartLeft.bind(self, event).call()
    // } );
    // hand1.addEventListener( 'pinchend', () => {
    //   self.scaling.active = false;
    // } );
    //
    // hand2.addEventListener( 'pinchstart', (event) => {
    //   self.onPinchStartRight.bind(self, event).call()
    // } );
    // hand2.addEventListener( 'pinchend',  (event) => {
    //   self.onPinchEndRight.bind(self, event).call()
    // } )

    this.addActions()
  }

   onPinchStartLeft( event ) {

     const controller = event.target;

     if ( this.grabbing ) {

       const indexTip = controller.joints[ 'index-finger-tip' ];
       const sphere = this.collideObject( indexTip );

       if ( sphere ) {

         const sphere2 = this.hand2.userData.selected;
         console.log( 'sphere1', sphere, 'sphere2', sphere2 );
         if ( sphere === sphere2 ) {

           this.scaling.active = true;
           this.scaling.object = sphere;
           this.scaling.initialScale = sphere.scale.x;
           this.scaling.initialDistance = indexTip.position.distanceTo( this.hand2.joints[ 'index-finger-tip' ].position );
           return;

         }

       }

     }

     const geometry = new THREE.BoxGeometry( this.SphereRadius, this.SphereRadius, this.SphereRadius );
     const material = new THREE.MeshStandardMaterial( {
       color: Math.random() * 0xffffff,
       roughness: 1.0,
       metalness: 0.0
     } );
     const spawn = new THREE.Mesh( geometry, material );
     spawn.geometry.computeBoundingSphere();

     const indexTip = controller.joints[ 'index-finger-tip' ];
     spawn.position.copy( indexTip.position );
     spawn.quaternion.copy( indexTip.quaternion );

     this.spheres.push( spawn );

     this.scene.add( spawn );

   }

   onPinchStartRight( event ) {

     const controller = event.target;
     const indexTip = controller.joints[ 'index-finger-tip' ];
     const object = this.collideObject( indexTip );
     if ( object ) {

       this.grabbing = true;
       indexTip.attach( object );
       controller.userData.selected = object;
       console.log( 'Selected', object );

     }

   }

   onPinchEndRight( event ) {

     const controller = event.target;

     if ( controller.userData.selected !== undefined ) {

       const object = controller.userData.selected;
       object.material.emissive.b = 0;
       this.scene.attach( object );

       controller.userData.selected = undefined;
       this.grabbing = false;

     }

     this.scaling.active = false;

   }

   collideObject( indexTip ) {

     for ( let i = 0; i < this.spheres.length; i ++ ) {

       const sphere = this.spheres[ i ];
       const distance = indexTip.getWorldPosition( this.tmpVector1 ).distanceTo( sphere.getWorldPosition( this.tmpVector2 ) );

       if ( distance < sphere.geometry.boundingSphere.radius * sphere.scale.x ) {

         return sphere;

       }

     }

     return null;

   }

   addActions() {
     const self = this;

     this.grip.addEventListener('selectstart', () => {
       self.action = 'jump'
     })

     this.grip.addEventListener('squeezestart', () => {
       self.action = 'walk'
     })

     this.grip2.addEventListener('selectstart', () => {
       self.action = 'dance'
     })

     this.grip2.addEventListener('squeezestart', () => {
       self.action = 'kick'
     })


   }

   loadGLTF(filename){
     const loader = new GLTFLoader( );
     const dracoLoader = new DRACOLoader();
     dracoLoader.setDecoderPath( 'draco/' );
     loader.setDRACOLoader( dracoLoader );

     const self = this;

     // Load a glTF resource
     loader.load(
         // resource URL
         filename,
         // called when the resource is loaded
         function ( gltf ) {
           self.animations = {};

           gltf.animations.forEach( (anim)=>{
             self.animations[anim.name] = anim;
           })

           self.knight = gltf.scene.children[3];

           self.mixer = new THREE.AnimationMixer( self.knight )

           self.scene.add( self.knight );

           self.loadingBar.visible = false;

           self.knight.position.set(0, 0.5, -1.5)
           const scale = 0.01;
           self.knight.scale.set(scale, scale, scale);
           self.action = "Idle";

           self.renderer.setAnimationLoop( self.render.bind(self) );
         },
         // called while loading is progressing
         function ( xhr ) {

           self.loadingBar.progress = (xhr.loaded / xhr.total);

         },
         // called when loading has errors
         function ( error ) {

           console.log( 'An error happened' );

         }
     );
   }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  render() {

    const delta = this.clock.getDelta();
    // const elapsedTime = this.clock.elapsedTime;
    // this.renderer.xr.updateCamera(this.camera);
    // this.world.execute(delta, elapsedTime);
    this.renderer.render(this.scene, this.camera);

    if (this.mixer) {
      this.mixer.update(delta)
    }

    if ( this.scaling.active ) {

      const indexTip1Pos = this.hand1.joints[ 'index-finger-tip' ].position;
      const indexTip2Pos = this.hand2.joints[ 'index-finger-tip' ].position;
      const distance = indexTip1Pos.distanceTo( indexTip2Pos );
      const newScale = this.scaling.initialScale + distance / this.scaling.initialDistance - 1;
      this.scaling.object.scale.setScalar( newScale );

    }

    /*if (this.fork) {
      this.fork.rotateY(0.1 * xAxis)
      this.fork.translateY(.02 * yAxis)
    }*/

    this.renderer.render(this.scene, this.camera)
  }
}

export {App}
