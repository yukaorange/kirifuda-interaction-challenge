import map from 'lodash/map'
import GSAP from 'gsap'
import Logger from '@ts/common/utility/Logger'
import ScrollAccumulator from '@ts/common/singleton/ScrollAccumulator'
import Assets from '@ts/common/singleton/Assets'

import * as THREE from 'three'

import Maincard, { TOption } from '@ts/webgl/Gallery/Maincard/Maincard'
import Subgrid from '@ts/webgl/Gallery/Subgrid/Subgrid'

import { TSizes } from '@ts/webgl'

export type TPage = {
  scene: THREE.Scene
  sizes: TSizes
  device: string
}

export default class Gallery {
  private scene: THREE.Scene
  private sizes: TSizes
  private device: string

  private assets = Assets.getInstance()
  private scrollAccumulator = ScrollAccumulator.getInstance()

  private itemLength: number = 0
  private itemHeight: number = 0
  private totalHeight: number = 0
  private offsetRange: number = 1

  private accumulatePosition: number = 0
  private velocity: number = 0
  private direction: number = 0
  private currentIndex: number = 0
  private changeIndex: boolean = false

  private maincards: Maincard[] | null = null
  private subgrid: Subgrid | null = null

  constructor({ scene, sizes, device }: TPage) {
    this.scene = scene

    this.sizes = sizes

    this.device = device

    this.createMaincards()

    this.createSubgrid()

    if (this.maincards) {
      this.maincards.forEach(maincard => {
        this.scene.add(maincard.getMesh())
      })
    }

    if (this.subgrid) {
      console.log(this.subgrid.getGroup())
      this.scene.add(this.subgrid.getGroup())
    }

    this.show()

    Logger.log(
      `from Webgl Gallery.ts create maincards , card count is  ${this.maincards?.length}`
    )
  }

  private createMaincards() {
    this.itemLength = Object.keys(this.assets.getTextures()).length

    this.calculateDimension()

    this.maincards = Array.from({ length: this.itemLength }, (_, i) => {
      return new Maincard({
        sizes: this.sizes,
        device: this.device,
        totalLength: this.itemLength,
        offsetRange: this.offsetRange,
        index: i
      })
    })
  }

  private createSubgrid() {
    this.subgrid = new Subgrid({
      sizes: this.sizes,
      device: this.device
    })
  }

  private calculateDimension() {
    this.itemHeight = this.sizes.height

    this.totalHeight = this.sizes.height * this.itemLength
  }

  /**
   * on mount
   */
  public show() {
    this.maincards?.forEach(maincard => {
      maincard.show()
    })
  }

  public hide() {
    this.maincards?.forEach(maincard => {
      maincard.hide()
    })
  }

  /**
   * resize
   */
  public onResize(values: { sizes: TSizes; device: string }) {
    this.sizes = values.sizes
    this.device = values.device
    this.calculateDimension()

    this.maincards?.forEach(maincard => {
      maincard.onResize(values)
    })

    this.subgrid?.onResize(values)
  }

  /**
   * update
   */
  public update() {
    this.accumulatePosition = this.scrollAccumulator.getScrollPosition()

    let targetProgress = Math.abs(this.accumulatePosition % 1)

    targetProgress *= 2

    targetProgress -= 1

    this.updateMaincard(targetProgress)

    this.updateSubgrid(targetProgress)
  }

  private updateMaincard(progress: number) {
    let x: number, y: number

    let p = 1 - Math.abs(progress)

    this.maincards?.forEach((maincard, index) => {
      let y = this.accumulatePosition * this.itemHeight

      const parameter = {
        y: y,
        progress: p
      }

      maincard.update(parameter)
    })
  }

  private updateSubgrid(progress: number) {
    this.direction = this.scrollAccumulator.getDirection()

    let p = 1 - Math.abs(progress)

    let step = Math.abs(this.accumulatePosition % 1)

    this.subgrid?.update(p, step)

    let newIndex = Math.floor(this.accumulatePosition)

    newIndex =
      ((newIndex % this.itemLength) + this.itemLength) % this.itemLength

    newIndex = Math.round(newIndex)

    const threshold = 0.02

    if (p < threshold) {
      p = 0
    }

    if (p > 0) {
      this.changeIndex = false
    } else {
      this.changeIndex = true
    }

    if (this.changeIndex == true && p == 0) {
      this.currentIndex = newIndex
    }

    this.subgrid?.setDirection(this.direction)

    this.subgrid?.setContentIndex(this.currentIndex)
  }

  /**
   * destroy
   */
  public destroy() {
    this.maincards?.forEach(maincard => {
      maincard.destroy()
    })
  }
}
