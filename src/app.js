import * as THREE from 'three'
import {VRButton} from "three/examples/jsm/webxr/VRButton"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader"

import blimp from "../assets/Blimp.glb"
import chair from "../assets/medieval-chair.glb"
import {XRHandModelFactory} from "three/examples/jsm/webxr/XRHandModelFactory";
import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory";
import fork from "../assets/Fork.glb"

class App {
  fork;
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


    this.initScene()
    this.setupVR()

    this.renderer.setAnimationLoop(this.render.bind(this))
    window.addEventListener('resize', this.resize.bind(this))
  }


  initScene() {
    const geometry = new THREE.BoxBufferGeometry(.5, .5, .5)
    const material = new THREE.MeshStandardMaterial({color: 0xFF0000})
    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    const geometrySphere = new THREE.SphereGeometry(.7, 32, 16)
    const materialSphere = new THREE.MeshBasicMaterial({color: 0xffff00})
    const sphere = new THREE.Mesh(geometrySphere, materialSphere)
    this.scene.add(sphere)

    sphere.position.set(1.5, 0, 0)

   /* this.loadAsset(blimp, -.5, .5, 1, scene => {
      const scale = 5
      scene.scale.set(scale, scale, scale)
      self.blimp = scene
    })

    this.loadAsset(chair, .5, .5, 1, scene => {
      const scale = 1
      scene.scale.set(scale, scale, scale)
      self.chair = scene
    })*/
    const self = this
    this.loadAsset(fork, 0, 0.8, -2, scene => {
      const scale = 0.2
      scene.scale.set(scale, scale, scale)
      self.fork = scene
    })

  }

  loadAsset(gltfFilename, x, y, z, sceneHandler) {
    const self = this
    const loader = new GLTFLoader()
    // Provide a DRACOLoader instance to decode compressed mesh data
    const draco = new DRACOLoader()
    draco.setDecoderPath('draco/')
    loader.setDRACOLoader(draco)

    loader.load(gltfFilename, (gltf) => {
          const gltfScene = gltf.scene
          self.scene.add(gltfScene)
          gltfScene.position.set(x, y, z)
          if (sceneHandler) {
            sceneHandler(gltfScene)
          }
        },
        null,
        (error) => console.error(`An error happened: ${error}`)
    )
  }

  changeAngle(handedness) {
    if (this.fork) {
      this.fork.rotateY(45)

    }
  }
  changeAngle2(handedness) {
    if (this.fork) {
      this.fork.rotateX(45)

    }
  }


  setupVR() {
    this.renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(this.renderer))
   /* const grip = this.renderer.xr.getControllerGrip(0)
    grip.add(new XRControllerModelFactory().createControllerModel(grip))
    this.scene.add(grip)
    const grip2 = this.renderer.xr.getControllerGrip(1)
    grip2.add(new XRControllerModelFactory().createControllerModel(grip2))
    this.scene.add(grip2)
*/

    const hand1 = this.renderer.xr.getHand(0)
    hand1.add (new XRHandModelFactory().createHandModel(hand1, "mesh"))
    this.scene.add(hand1)
    hand1.addEventListener('selectstart',  evt => {
      self.changeAngle.bind(self, evt.handedness ).call();
    } )

    const hand2 = this.renderer.xr.getHand(1)
    hand2.add (new XRHandModelFactory().createHandModel(hand2, "mesh"))
    this.scene.add(hand2)
    hand2.addEventListener('selectstart',  evt => {
      self.changeAngle2.bind(self, evt.handedness ).call();
    } )


    const self = this

    hand1.addEventListener( 'pinchend', evt => {
      self.changeAngle.bind(self, evt.handedness ).call();
    } );

    hand2.addEventListener( 'pinchend', evt => {
      self.changeAngle2.bind(self, evt.handedness ).call();
    } );


  }


  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  render() {
    if (this.mesh) {
      this.mesh.rotateX(0.005)
      this.mesh.rotateY(0.01)
    }

    /*if (this.fork) {
      this.fork.rotateY(0.1 * xAxis)
      this.fork.translateY(.02 * yAxis)
    }*/

    this.renderer.render(this.scene, this.camera)
  }
}

export {App}
