import * as THREE from 'three'
import normalizeWheel from 'normalize-wheel'

export default class ScrollAccumulator {
  private static instance: ScrollAccumulator

  private scrollPosition: number = 0
  private velocity: number = 0
  private touchStartY: number | null = null
  private lastTouchY: number | null = null
  private touchVelocity: number = 0

  private decayRate: number = 7.0
  private lerpSpeed: number = 20.0
  private maxVelocity: number = 1
  private minVelocity: number = 0.001

  private sensitivity: number = 0.0005
  private touchSensitivity: number = 0.00006

  private clock: THREE.Clock
  private lastUpdateTime: number = 0

  private constructor() {
    this.clock = new THREE.Clock()
    this.lastUpdateTime = this.clock.getElapsedTime()
    this.addEventListeners()
  }

  public static getInstance(): ScrollAccumulator {
    if (!ScrollAccumulator.instance) {
      ScrollAccumulator.instance = new ScrollAccumulator()
    }
    return ScrollAccumulator.instance
  }

  private addEventListeners(): void {
    window.addEventListener('wheel', this.handleWheel.bind(this))
    window.addEventListener('touchstart', this.handleTouchStart.bind(this))
    window.addEventListener('touchmove', this.handleTouchMove.bind(this))
    window.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  private handleWheel(event: WheelEvent): void {
    const normalizedWheel = normalizeWheel(event)
    this.addDelta(normalizedWheel.pixelY)
  }

  private handleTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY
    this.lastTouchY = event.touches[0].clientY
    this.touchVelocity = 0
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.lastTouchY !== null) {
      const currentY = event.touches[0].clientY
      const deltaY = this.lastTouchY - currentY

      this.touchVelocity = deltaY * this.touchSensitivity
      this.lastTouchY = currentY

      this.addDelta(this.touchVelocity)
    }
  }

  private handleTouchEnd(): void {
    this.touchStartY = null
    this.lastTouchY = null
  }

  public addDelta(delta: number): void {
    this.velocity += delta * this.sensitivity
  }

  public update(): void {
    const currentTime = this.clock.getElapsedTime()

    const delta = currentTime - this.lastUpdateTime

    this.lastUpdateTime = currentTime

    const decay = Math.exp(-this.decayRate * delta)

    this.velocity *= decay

    if (Math.abs(this.velocity) < this.minVelocity) {
      this.velocity = 0
    }

    this.velocity = Math.max(
      Math.min(this.velocity, this.maxVelocity),
      -this.maxVelocity
    )

    this.scrollPosition += this.velocity * delta * 60

    let targetSection = Math.round(this.scrollPosition)
    let dif = targetSection - this.scrollPosition

    const threshold = 0.00001

    if (Math.abs(dif) < threshold) {
      this.scrollPosition = targetSection
      this.velocity = 0
    } else {
      const t = Math.min(1, delta * this.lerpSpeed)
      this.scrollPosition += dif * t
    }
  }

  public getScrollPosition(): number {
    return this.scrollPosition
  }

  public getVelocity(): number {
    return this.velocity
  }

  public setDecayRate(rate: number): void {
    this.decayRate = rate
  }

  public setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity
  }

  public setTouchSensitivity(sensitivity: number): void {
    this.touchSensitivity = sensitivity
  }

  public setMaxVelocity(velocity: number): void {
    this.maxVelocity = velocity
  }

  public setMinVelocity(velocity: number): void {
    this.minVelocity = velocity
  }
}
