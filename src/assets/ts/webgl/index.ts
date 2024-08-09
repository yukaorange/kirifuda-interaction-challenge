import GSAP from 'gsap'
import * as THREE from 'three'

import { Pane } from 'tweakpane'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Gallery from '@ts/webgl/Gallery'

export type TCanvas = {
  template: string
  dom: HTMLElement
  device: string
}

export type TSizes = {
  height: number
  width: number
}

export default class Canvas {
  //config
  private template: string
  private device: string

  //container
  private container: HTMLElement

  //parameters
  private sizes: TSizes
  private x: { start: number; end: number }
  private y: { start: number; end: number }
  private isTouchDown: boolean = false

  //pages
  private gallery: Gallery | null = null

  //three.js objects
  private renderer: THREE.WebGLRenderer | null
  private scene: THREE.Scene | null
  private camera: THREE.PerspectiveCamera | null
  private controls: OrbitControls | null
  private pane: Pane | null
  private paneParams: { [key: string]: any } | null = null

  constructor({ template, dom, device }: TCanvas) {
    //config
    this.template = template
    this.device = device

    //container
    this.container = dom

    //three.js objects
    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null
    this.pane = null

    //parameter
    this.sizes = {
      height: 0,
      width: 0
    }

    this.x = {
      start: 0,
      end: 0
    }

    this.y = {
      start: 0,
      end: 0
    }

    //create objects
    this.createRenderer()

    this.createScene()

    this.createCamera()

    // this.createControls()

    this.createGallery()
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })

    this.renderer.setClearColor(0x000000, 0)

    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.container.appendChild(this.renderer.domElement)
  }

  private createScene() {
    this.scene = new THREE.Scene()
  }

  private createCamera() {
    const fov = 45
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1
    const far = 1000

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    this.camera.position.z = 5
  }

  private createControls() {
    this.controls = new OrbitControls(
      this.camera as THREE.PerspectiveCamera,
      this.renderer?.domElement as HTMLElement
    )
  }

  /**Gallery */
  private createGallery() {
    this.gallery = new Gallery({
      scene: this.scene as THREE.Scene,
      sizes: this.sizes as TSizes,
      device: this.device as string
    })
  }

  public destroyGallery() {
    this.gallery?.destroy()
  }

  /**
   * events
   */

  public onPreloaded() {
    this.onChangeEnd(this.template)
  }

  public onChangeStart(template: string) {
    this.template = template
  }

  public onChangeEnd(template: string) {}

  public onResize({ device }: { device: string }) {
    this.device = device

    this.updateScale()

    const params = {
      sizes: this.sizes,
      device: this.device
    }

    this.gallery?.onResize(params)
  }

  private updateScale() {
    this.renderer?.setSize(window.innerWidth, window.innerHeight) //expand canvas to full screen.

    const aspect: number = window.innerWidth / window.innerHeight

    const fov: number = this.camera ? this.camera?.fov * (Math.PI / 180) : 0 // default camera.fov = 45deg. result fov is in radians. (1/4 PI rad)

    const height: number = this.camera
      ? 2 * Math.tan(fov / 2) * this.camera?.position.z
      : 0 //z = 5 is setted at this.createCamera

    const width: number = height * aspect //viewport size in screen.

    this.sizes = {
      //Calclated viewport space sizes.
      height: height,
      width: width
    }

    if (this.camera) {
      this.camera.aspect = aspect

      this.camera.updateProjectionMatrix()
    }
  }

  public onTouchDown() {}

  public onTouchMove() {}

  /**loop */

  public update(params: any) {
    this.gallery?.update()

    this.renderer?.render(
      this.scene as THREE.Scene,
      this.camera as THREE.Camera
    )
  }
}
