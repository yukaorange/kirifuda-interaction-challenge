import Component from '@ts/abstract/Component'

import ScrollAccumulator from '@ts/common/singleton/ScrollAccumulator'

import Logger from '@ts/common/utility/Logger'

import GSAP from 'gsap'

export class IndicatorElement extends Component {
  constructor() {
    super({
      element: '[data-ui="indicator"]',
      elements: {
        speed: '[data-ui="indicator-speed"]'
      }
    })
  }
}

export class Indicator {
  private element: IndicatorElement | null = null
  private elements: { [key: string]: HTMLElement } = {}
  private ScrollAccumulator: ScrollAccumulator | null = null
  private accumulatePosition: number = 0

  public create(indicator: IndicatorElement) {
    this.ScrollAccumulator = ScrollAccumulator.getInstance()
    this.element = indicator.element
    this.elements = indicator.elements

    this.initialize()

    this.update()
  }

  private initialize() {}

  public onResize() {}

  public update() {
    this.accumulatePosition = this.ScrollAccumulator?.getScrollPosition() || 0

    this.elements.speed.style.setProperty(
      '--position',
      `${this.accumulatePosition}`
    )
  }
}

export class IndicatorManager {
  private element: IndicatorElement
  private indicator: Indicator

  constructor() {
    this.element = new IndicatorElement()
    this.indicator = new Indicator()

    this.indicator.create(this.element)
  }

  public update() {
    this.indicator.update()
  }

  public onResize() {
    this.indicator.onResize()
  }
}
