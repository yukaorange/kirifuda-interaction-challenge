import { Pane } from 'tweakpane'

export default class DebugPane {
  private static instance: DebugPane
  private pane: Pane
  public params: { [key: string]: any }

  private constructor() {
    this.pane = new Pane({
      expanded: false
    })

    this.params = {
      alpha: 1
    }

    this.addBindings()
  }

  public static getInstance(): DebugPane {
    if (!DebugPane.instance) {
      DebugPane.instance = new DebugPane()
    }

    return DebugPane.instance
  }

  private addBindings() {
    this.pane.addBinding(this.params, 'alpha', {
      min: 0,
      max: 1,
      step: 0.01
    })
  }

  public getParams() {
    return this.params
  }
}
