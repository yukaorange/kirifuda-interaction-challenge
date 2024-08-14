import * as THREE from 'three'
import { TSizes } from '@ts/webgl'

interface LayoutInfo {
  text: string
  class: string
}

class LayoutManager {
  private template: HTMLElement | null

  constructor(templateId: string) {
    this.template = document.querySelector(templateId)

    if (!this.template) {
      throw new Error(`Template element with id "${templateId}" not found`)
    }
  }

  getLayoutInformations(contentIndex: number): LayoutInfo[] {
    const content = this.template!.querySelector(
      `.content:nth-child(${contentIndex + 1})`
    )

    if (!content) {
      throw new Error(`Content at index ${contentIndex} not found`)
    }

    return Array.from(content.children).map(element => {
      const htmlElement = element as HTMLElement
      const rect = element.getBoundingClientRect()

      return {
        text: htmlElement.innerText || '',
        class: htmlElement.className
      }
    })
  }
}

export class DrawCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private texture: THREE.CanvasTexture

  private device: string = 'pc'

  private numberFontSize: number = 30
  private mainFontSize: number = 40
  private subFontSize: number = 25

  private marginLeft: number = 20
  private marginTop: number = 30
  private lineSpacing: number = 16

  private currentY: number = 0

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = 512
    this.canvas.height = Math.floor((512 * 4) / 3)

    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
  }

  public getCanvasTexture(): THREE.CanvasTexture {
    return this.texture
  }

  public getAspect(): number {
    return this.canvas.width / this.canvas.height
  }

  public onResize(values: { sizes: TSizes; device: string }) {
    const { device } = values

    if (device === 'pc') {
      this.device = 'pc'
      this.canvas.width = 512
      this.canvas.height = Math.floor((512 * 4) / 3)
      this.mainFontSize = 40
      this.subFontSize = 25
      this.numberFontSize = 30
    } else {
      this.device = 'mobile'
      this.canvas.width = 512
      this.canvas.height = Math.floor((512 * 4) / 3)
      this.mainFontSize = 40
      this.subFontSize = 25
      this.numberFontSize = 30
    }
  }

  public draw(layoutInfo: LayoutInfo[], progress: number, step: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.currentY = this.marginTop

    layoutInfo.forEach((info, index) => {
      switch (info.class) {
        case 'text-main':
          this.drawMainText(info, progress, step, index)
          break
        case 'text-sub':
          this.drawSubText(info, progress, step, index)
          break
        case 'text-number':
          this.drawNumberText(info, progress, step, index)
          break
        default:
          console.warn(`Unexpected class: ${info.class}`)
          break
      }
    })

    this.drawBorder(progress)

    this.texture.needsUpdate = true
  }

  private drawNumberText(
    info: LayoutInfo,
    progress: number,
    step: number,
    index: number
  ): void {
    this.drawText(
      info,
      progress,
      step,
      this.numberFontSize,
      '400',
      0.02,
      '#ffffff',
      true,
      1
    )
    this.currentY += this.numberFontSize + this.lineSpacing
  }

  private drawMainText(
    info: LayoutInfo,
    progress: number,
    step: number,
    index: number
  ): void {
    this.drawText(
      info,
      progress,
      step,
      this.mainFontSize,
      '400',
      0.02,
      '#ffffff',
      true,
      index
    )
    this.currentY += this.mainFontSize + this.lineSpacing
  }

  private drawSubText(
    info: LayoutInfo,
    progress: number,
    step: number,
    index: number
  ): void {
    this.drawText(
      info,
      progress,
      step,
      this.subFontSize,
      '400',
      0.08,
      '#808080',
      false,
      index
    )
    this.currentY += this.subFontSize + this.lineSpacing
  }

  private drawText(
    info: LayoutInfo,
    progress: number,
    step: number,
    fontSize: number,
    fontWeight: string,
    kerning: number,
    color: string,
    rectDraw: boolean = false,
    index: number = 0
  ): void {
    this.ctx.font = `${fontWeight} ${fontSize}px 'Jost', sans-serif`
    this.ctx.fillStyle = color

    const scaleFactor = 1

    const text =
      rectDraw && progress !== 0
        ? this.getRandomString(info.text.length)
        : info.text

    let currentX = this.marginLeft * scaleFactor
    const kerningFactor = fontSize * kerning

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      this.ctx.fillText(char, currentX, this.currentY * scaleFactor)
      currentX += this.ctx.measureText(char).width + kerningFactor
    }

    if (rectDraw) {
      let scale = index / 2 + 0.5

      this.ctx.fillRect(
        -this.canvas.width * scale + this.canvas.width * 2 * scale * step,
        this.currentY - fontSize,
        this.canvas.width,
        fontSize * scaleFactor
      )
    }
  }

  private drawBorder(progress: number): void {
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = '#fff'
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(0, this.currentY - this.mainFontSize)
    this.ctx.stroke()
  }

  private getRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&*+,-./'
    return Array(length)
      .fill('')
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('')
  }
}

export class DrawCanvasManager {
  private layoutManager: LayoutManager
  private drawCanvas: DrawCanvas
  private currentContentIndex: number

  constructor() {
    this.layoutManager = new LayoutManager('.template')

    this.drawCanvas = new DrawCanvas()

    this.currentContentIndex = 0
  }

  public setContentIndex(index: number) {
    this.currentContentIndex = index
  }

  draw(progress: number, step: number): void {
    const layoutInfo = this.layoutManager.getLayoutInformations(
      this.currentContentIndex
    )

    this.drawCanvas.draw(layoutInfo, progress, step)
  }

  public getCanvasTexture(): THREE.CanvasTexture {
    return this.drawCanvas.getCanvasTexture()
  }

  public getAspectRatio(): number {
    return this.drawCanvas.getAspect()
  }

  public onResize(values: { sizes: TSizes; device: string }) {
    this.drawCanvas.onResize(values)
  }
}
