import GSAP from 'gsap'

import * as THREE from 'three'

import Assets from '@ts/common/singleton/Assets'
import DebugPane from '@ts/common/singleton/Pane'

import vertexShader from '@ts/webgl/shaders/vertex.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment.glsl'

import { TSizes } from '@ts/webgl'

export type TOption = {
  sizes: {
    width: number
    height: number
  }
  device: string
  totalLength: number
  offsetRange: number
  index: number
}

export default class Maincard {
  private sizes: {
    width: number
    height: number
  }

  private device: string
  private totalLength: number
  private totalHeight: number = 0
  private offsetRange: number
  private index: number
  private y: number = 0
  private gallerySection: number = 0
  private standardPosition: number = 0

  private geometry: THREE.PlaneGeometry | null = null

  private material: THREE.ShaderMaterial | null = null
  private mesh: THREE.Mesh | null = null
  private assets = Assets.getInstance()
  private textures: Record<number, THREE.Texture> | null = null
  private texture: THREE.Texture | null = null
  private textureAspect: number | null = null
  private cardAspect: number | null = null
  private pane: DebugPane | null = null

  constructor({ sizes, device, totalLength, offsetRange, index }: TOption) {
    this.sizes = sizes

    this.device = device

    this.totalLength = totalLength

    this.offsetRange = offsetRange

    this.index = index

    this.createTexture()

    this.createGeometry()

    this.createMaterial()

    this.createMesh()

    this.createPane()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  private createTexture() {
    this.textures = this.assets.getTextures() as Record<number, THREE.Texture>

    this.texture = this.textures[this.index + 1]

    this.textureAspect = this.texture.image.width / this.texture.image.height
  }

  private createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
  }

  private createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: this.texture },
        uAlpha: { value: 0 },
        uAspect: { value: 0 },
        uTextureAspect: { value: this.textureAspect }
      }
    })
  }

  private createMesh() {
    this.mesh = new THREE.Mesh(
      this.geometry as THREE.PlaneGeometry,
      this.material as THREE.ShaderMaterial
    )
  }

  private createPane() {
    this.pane = DebugPane.getInstance()
  }

  public getMesh() {
    return this.mesh as THREE.Mesh
  }

  private calculateBounds(values: { sizes: TSizes; device: string }) {
    const { sizes, device } = values

    this.sizes = sizes

    this.device = device

    this.updateScale()

    this.updateY()
  }

  private calculateDimension() {
    this.totalHeight = this.sizes.height * this.totalLength
  }

  /**
   * Animations
   */
  public show() {
    GSAP.fromTo(
      (this.mesh?.material as THREE.ShaderMaterial).uniforms.uAlpha,
      {
        value: 0
      },
      {
        value: 1
      }
    )
  }

  public hide() {
    GSAP.to((this.mesh?.material as THREE.ShaderMaterial).uniforms.uAlpha, {
      value: 0
    })
  }
  /**
   * events
   */
  onResize(values: { sizes: TSizes; device: string }) {
    this.calculateBounds({
      sizes: values.sizes,
      device: values.device
    })

    this.calculateDimension()

    if (!this.mesh) return

    this.gallerySection = Math.floor(this.y / this.sizes.height)

    this.standardPosition = -this.index * this.sizes.height
  }

  /**
   * update
   */

  updateScale() {
    const width = this.sizes.width * 0.5
    const height = width * 0.75

    this.cardAspect = width / height

    this.mesh?.scale.set(width, height, 1)

    const shaderMaterial = this.mesh?.material as THREE.ShaderMaterial

    shaderMaterial.uniforms.uAspect.value = this.cardAspect
  }

  updateY() {
    if (!this.mesh) return

    const offsetRange = this.offsetRange * this.sizes.height

    let targetPosition = this.standardPosition + this.y

    if (targetPosition > this.totalHeight - offsetRange) {
      targetPosition -= this.totalHeight

      this.standardPosition -= this.totalHeight

      if (this.index === 0) {
        console.log('wrap')
      }
    } else if (targetPosition < -offsetRange) {
      targetPosition += this.totalHeight

      this.standardPosition += this.totalHeight

      if (this.index === 0) {
        console.log('reverse wrap')
      }
    }

    this.mesh.position.y = targetPosition

    // if (this.index === 0) {
    //   console.log(
    //     `y:`,
    //     y,
    //     `positionY:`,
    //     this.mesh.position.y,
    //     `\n`,
    //     `total:`,
    //     this.totalHeight,
    //     `offsetRange:`,
    //     offsetRange,
    //     `total - offset:`,
    //     this.totalHeight - offsetRange,
    //     `standardPosition:`,
    //     this.standardPosition
    //   )
    // }
  }

  updateGallerySection() {
    this.gallerySection = Math.floor(this.y / this.sizes.height)
  }

  update(params: { y: number }) {
    if ((this.mesh?.material as THREE.ShaderMaterial).uniforms.uAlpha) {
      const shaderMaterial = this.mesh?.material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uAlpha.value = this.pane?.getParams().alpha
    }

    this.y = params.y

    this.updateY()

    this.updateGallerySection()
  }

  /**
   * destroy
   */

  public destroy() {}
}
