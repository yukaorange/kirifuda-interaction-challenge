import map from 'lodash/map'
import GSAP from 'gsap'
import Logger from '@ts/common/utility/Logger'
import ScrollAccumulator from '@ts/common/singleton/ScrollAccumulator'
import Assets from '@ts/common/singleton/Assets'

import * as THREE from 'three'

import Maincard, { TOption } from '@ts/webgl/Gallery/Maincard'

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

  private maincards: Maincard[] | null = null

  constructor({ scene, sizes, device }: TPage) {
    this.scene = scene

    this.sizes = sizes

    this.device = device

    this.createMaincards()

    if (this.maincards) {
      this.maincards.forEach(maincard => {
        this.scene.add(maincard.getMesh())
      })
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

  private calculateDimension() {
    this.itemHeight = this.sizes.height

    this.totalHeight = this.sizes.height * this.itemLength
  }

  private updatePositions() {
    let x: number, y: number

    this.maincards?.forEach((maincard, index) => {
      let y = this.accumulatePosition * this.itemHeight

      const parameter = {
        y: y
      }

      maincard.update(parameter)
    })
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
  }

  /**
   * update
   */
  public update() {
    this.accumulatePosition = this.scrollAccumulator.getScrollPosition()

    this.updatePositions()
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
