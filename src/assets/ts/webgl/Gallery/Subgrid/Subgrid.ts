import GSAP from 'gsap'

import * as THREE from 'three'

import { DrawCanvasManager } from '@ts/webgl/Gallery/Subgrid/DrawCanvas'

import DebugPane from '@ts/common/singleton/Pane'

import vertexShader from '@ts/webgl/shaders/subgrid-vertex.glsl'
import fragmentShader from '@ts/webgl/shaders/subgrid-fragment.glsl'

import { TSizes } from '@ts/webgl'

export type TOption = {
  sizes: {
    width: number
    height: number
  }
  device: string
}

export default class Subgrid {
  private sizes: {
    width: number
    height: number
  }
  private device: string

  private geometry: THREE.PlaneGeometry | null = null
  private mainMaterial: THREE.ShaderMaterial | null = null
  private subMaterial: THREE.ShaderMaterial | null = null
  private mesh: THREE.Mesh | null = null
  private group = new THREE.Group()
  private meshes: THREE.Mesh[] = []
  private amountX: number = 10
  private amountY: number = 10

  private centerX: number = 0
  private centerY: number = 0
  private gridWidth: number = 0
  private gridHeight: number = 0

  private texture: THREE.Texture | null = null
  private textureAspect: number | null = null

  private progress: number = 0
  private direction: number = 0

  private drawCanvasManager: DrawCanvasManager | null = null

  private pane: DebugPane | null = null

  constructor({ sizes, device }: TOption) {
    this.sizes = sizes

    this.device = device

    this.createDrawCanvasManager()

    this.createTexture()

    this.createGeometry()

    this.createMaterial()

    this.createMeshes()

    this.createPane()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  private createDrawCanvasManager() {
    this.drawCanvasManager = new DrawCanvasManager()
  }

  private createTexture() {
    this.texture = this.drawCanvasManager?.getCanvasTexture() || null

    this.textureAspect = this.texture?.image.width / this.texture?.image.height
  }

  private createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10)
  }

  private createMaterial() {
    this.subMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: this.texture },
        uAlpha: { value: 0 },
        uAspect: { value: 0 },
        uProgress: { value: 0 },
        uMain: { value: false },
        uTextureAspect: { value: this.textureAspect },
        uViewPortSize: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height)
        }
      }
    })

    this.mainMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: this.texture },
        uAlpha: { value: 0 },
        uAspect: { value: 0 },
        uProgress: { value: 0 },
        uMain: { value: false },
        uTextureAspect: { value: this.textureAspect },
        uViewPortSize: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height)
        }
      }
    })
  }

  private createMeshes() {
    for (let xi = 0; xi < this.amountX; xi++) {
      for (let yi = 0; yi < this.amountY; yi++) {
        let mesh

        if (xi === 4 && yi === 5) {
          mesh = new THREE.Mesh(
            this.geometry as THREE.PlaneGeometry,
            this.mainMaterial as THREE.ShaderMaterial
          )

          const mainShaderMaterial = mesh.material as THREE.ShaderMaterial

          mainShaderMaterial.uniforms.uMain.value = true
        } else {
          mesh = new THREE.Mesh(
            this.geometry as THREE.PlaneGeometry,
            this.subMaterial as THREE.ShaderMaterial
          )

          const subShaderMaterial = mesh.material as THREE.ShaderMaterial

          subShaderMaterial.uniforms.uMain.value = false
        }

        mesh.userData.xi = xi
        mesh.userData.yi = yi

        mesh.position.set(xi, yi, 0)

        this.meshes.push(mesh)
        this.group?.add(mesh)
      }
    }
  }

  private createPane() {
    this.pane = DebugPane.getInstance()
  }

  public getMesh() {
    return this.mesh as THREE.Mesh
  }

  public getGroup() {
    return this.group as THREE.Group
  }

  private calculateBounds(values: { sizes: TSizes; device: string }) {
    const { sizes, device } = values

    this.sizes = sizes

    this.device = device

    this.updateScale()
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
  public onResize(values: { sizes: TSizes; device: string }) {
    this.calculateBounds({
      sizes: values.sizes,
      device: values.device
    })

    this.drawCanvasManager?.onResize({
      sizes: values.sizes,
      device: values.device
    })

    if (!this.group) return

    this.meshes.forEach(mesh => {
      if (this.device == 'pc') {
        if (mesh.userData.xi == 4 && mesh.userData.yi == 5) {
          mesh.material = this.mainMaterial as THREE.ShaderMaterial
        } else {
          mesh.material = this.subMaterial as THREE.ShaderMaterial
        }
      } else {
        if (mesh.userData.xi == 5 && mesh.userData.yi == 3) {
          mesh.material = this.mainMaterial as THREE.ShaderMaterial
        } else {
          mesh.material = this.subMaterial as THREE.ShaderMaterial
        }
      }
    })
  }

  /**
   * update
   */

  public setContentIndex(index: number) {
    this.drawCanvasManager?.setContentIndex(index)
  }

  public setDirection(direction: number) {
    this.direction = direction
  }

  private updateScale() {
    this.gridWidth = 0
    this.gridHeight = 0
    if (this.device == 'pc') {
      this.gridWidth = this.sizes.width * 0.2
      this.gridHeight = (this.gridWidth * 4) / 3
    } else {
      this.gridWidth = this.sizes.width * 0.25
      this.gridHeight = (this.gridWidth * 4) / 3
    }

    this.group?.scale.set(this.gridWidth, this.gridHeight, 1)

    this.mainMaterial!.uniforms.uViewPortSize.value = new THREE.Vector2(
      this.sizes.width,
      this.sizes.height
    )

    this.subMaterial!.uniforms.uViewPortSize.value = new THREE.Vector2(
      this.sizes.width,
      this.sizes.height
    )
  }

  private updatePosition() {
    if (!this.group) return

    const boundsBox = new THREE.Box3().setFromObject(this.group)

    const bounding = boundsBox.getSize(new THREE.Vector3())

    this.centerY = bounding.y / 2

    this.centerX = bounding.x / 2

    this.group?.position.set(-this.centerX, -this.centerY, 0)

    if (this.direction == 1) {
      this.group!.position.y += (bounding.y / 10) * this.progress
    } else {
      this.group!.position.y -= (bounding.y / 10) * this.progress
    }
  }

  public update(progress: number, step: number) {
    if (!this.group) return

    this.progress = progress

    this.drawCanvasManager?.draw(this.progress, step)

    this.setContentIndex(0)

    const newTexture = this.drawCanvasManager?.getCanvasTexture()

    this.updatePosition()

    if (this.mainMaterial) {
      this.mainMaterial.uniforms.uProgress.value = this.progress
    }

    if (this.subMaterial) {
      this.subMaterial.uniforms.uProgress.value = this.progress
    }
  }

  /**
   * destroy
   */

  public destroy() {}
}
