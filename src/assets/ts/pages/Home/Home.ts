import Page from '@ts/abstract/Page'
import Logger from '@ts/common/utility/Logger'
import GSAP from 'gsap'

import { IndicatorManager } from '@ts/pages/Home/component/indicator/Indicator'

type TOptions = {
  device: string
}

export default class Home extends Page {
  private indicatorManager: IndicatorManager | null = null

  constructor(params: TOptions) {
    super({
      id: 'home',
      element: '[data-template="home"]',
      elements: {},
      device: params.device
    })
  }

  public create() {
    super.create()

    this.indicatorManager = new IndicatorManager()
  }

  /**
   * animation
   */
  public set() {
    super.set()
  }

  public show() {
    super.show()
  }

  public async hide() {
    await super.hide()
  }

  public onResize(params: { device: string }) {
    super.onResize(params)
  }

  public destroy() {
    super.destroy()
  }

  public update() {
    this.indicatorManager?.update()
  }
}
