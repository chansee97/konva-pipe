import Konva from 'konva'

interface NodeConfig {
  x: number
  y: number
}
interface PipeNodeConfig extends NodeConfig {
  text: string
}

interface EventNodeConfig extends NodeConfig {
  type: 'end' | 'start' | 'warning' | 'fire'
  size?: number
}

interface initMapConfig extends Konva.StageConfig {
  mapBackgroundImgUrl: string
}

export class PipeMap {
  /* 地图舞台 */
  private stage: Konva.Stage
  /* 背景层 */
  private bgLayer = new Konva.Layer()

  /* 管廊节点层 （不可交互） */
  private pipeLayer = new Konva.Layer()

  /* 事件标记层（可点击交互） */
  private eventLayer = new Konva.Layer()

  /* 数据弹框层 */
  private modalLayer = new Konva.Layer({
    visible: false,
  })

  /* 地图内置素材 */
  private material = {
  /* 开始点图标 */
    end: new URL('./assets/start.png', import.meta.url).href,
    /* 结束点图标 */
    start: new URL('./assets/end.png', import.meta.url).href,
    /* 火点图标 */
    fire: new URL('./assets/fire.png', import.meta.url).href,
    /* 警报图标 */
    warning: new URL('./assets/warning.png', import.meta.url).href,
    /* 窗口关闭图标 */
    close: new URL('./assets/close.png', import.meta.url).href,
    model: new URL('./assets/modal-border.png', import.meta.url).href,
  }

  constructor(config: initMapConfig) {
    this.stage = new Konva.Stage(config)
    this.setMapBackground(config.mapBackgroundImgUrl)
  }

  /* 设置地图  */
  setMapBackground(imgURL: string) {
    Konva.Image.fromURL(imgURL, (darthNode) => {
      darthNode.setAttrs({
        x: 0,
        y: 0,
        width: this.stage.width(),
        height: this.stage.height(),
      })
      this.bgLayer.add(darthNode)
    })

    this.stage.add(this.bgLayer)
  }

  /* 添加事件标记 */
  setEventNode(config: EventNodeConfig) {
    if (!this.material[config.type])
      throw new Error('请检查config中的type字段是否正确')

    const defaultSize = 30
    // 创建火点图标
    Konva.Image.fromURL(this.material[config.type], (darthNode) => {
      darthNode.setAttrs({
        x: config.x,
        y: config.y,
        width: config.size || defaultSize,
        height: config.size || defaultSize,
        shadowColor: 'white',
        shadowBlur: 0,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.9,
      })
      this.eventLayer.add(darthNode)
      darthNode.on('mouseenter', () => {
        darthNode.shadowBlur(10)
      })
      darthNode.on('mouseleave', () => {
        darthNode.shadowBlur(0)
      })
      darthNode.on('click', () => {
        if (this.modalLayer.visible())
          return this.setFade(this.modalLayer).hide()

        this.setFade(this.modalLayer).show()
      })

      this.setCursor(darthNode)
    })
    this.stage.add(this.eventLayer)
  }

  /* 生成弹框层 */
  setModal() {
    // 创建label容器
    const labelContainer = new Konva.Rect({
      width: 600,
      height: 300,
    })

    // 创建label绑定组
    const group = new Konva.Group({
      x: (this.stage.width() - labelContainer.width()) / 2,
      y: (this.stage.height() - labelContainer.height()) / 2,
    })

    Konva.Image.fromURL(this.material.model, (darthNode) => {
      darthNode.setAttrs({
        width: labelContainer.width(),
        height: labelContainer.height(),
      })
      group.add(darthNode)
    })

    // 创建label的标签文本
    const modalTitle = new Konva.Text({
      text: '一级告警',
      fontSize: 24,
      fontStyle: 'bold',
      fill: '#1C7BD2',
      offsetX: -20,
      offsetY: -10,
    })

    // 创建label的标签文本
    const labelText = new Konva.Text({
      text: '检测时间',
      fontSize: 12,
      fill: '#C6D1DB',
      offsetX: -20,
      offsetY: -100,
    })
    // 创建label的内容文本内容
    const contentText = new Konva.Text({
      text: '2023/1/1 12:15:23',
      fontSize: 24,
      fill: '#FFFFFF',
      fontStyle: 'bold',
      offsetX: -20,
      offsetY: -120,
    })
    // 创建关闭按钮
    const closeButtonSize = 20
    Konva.Image.fromURL(this.material.close, (darthNode) => {
      darthNode.setAttrs({
        offsetX: -(labelContainer.width() - closeButtonSize - 20),
        offsetY: -30,
        width: closeButtonSize,
        height: closeButtonSize,
      })
      darthNode.on('click', () => {
        this.setFade(this.modalLayer).hide()
      })
      this.setCursor(darthNode)
      group.add(darthNode)
    })
    group.add(labelContainer, modalTitle, labelText, contentText)

    this.modalLayer.add(group)
    this.stage.add(this.modalLayer)
  }

  /* 设置事件点 */
  setEventPoint(config: EventNodeConfig) {
    this.setEventNode(config)
    this.setModal()
  }

  /* 生成管廊节点 */
  generatePipeNode(config: PipeNodeConfig) {
    const nodeGroup = new Konva.Group({
      x: config.x,
      y: config.y,
    })
    const node = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      fill: '#1F2836',
      stroke: '#395D7E',
      strokeWidth: 6,
    })
    nodeGroup.add(node)

    const text = new Konva.Text({
      text: config.text || '',
      fontSize: 16,
      fill: '#395D7E',
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
    })

    const n_width = node.width()
    const t_width = text.width()
    if (t_width > n_width - 20)
      node.width(t_width + 20)

    text.position({
      x: (node.width() - text.width()) / 2,
      y: (node.height() - text.height()) / 2,
    })
    nodeGroup.add(text)
    return nodeGroup
  }

  /* 设置管廊节点 */
  setPipeNode(configs: PipeNodeConfig[] | PipeNodeConfig, stage = this.stage) {
    /* 清除所有元素 */
    this.pipeLayer.destroyChildren()
    /* 根据传入参数类型做不同操作 */
    if (Array.isArray(configs)) {
      configs.forEach((config) => {
        const pipeNode = this.generatePipeNode(config)
        this.pipeLayer.add(pipeNode)
      })
    }
    else {
      const pipeNode = this.generatePipeNode(configs)
      this.pipeLayer.add(pipeNode)
    }
    stage.add(this.pipeLayer)
  }

  /* 设置节点鼠标样式 */
  setCursor(node: Konva.Node, type = 'pointer') {
    node.on('mouseenter', () => {
      this.stage.container().style.cursor = type
    })
    node.on('mouseleave', () => {
      this.stage.container().style.cursor = 'default'
    })
  }

  /* 设置节点过度 */
  setFade(node: Konva.Node) {
    const commonConfig = {
      node,
      easing: Konva.Easings.EaseOut,
      duration: 0.3,
    }
    return {
      show() {
        node.opacity(0)
        node.show()
        const fade = new Konva.Tween({
          ...commonConfig,
          opacity: 1,
          offsetY: 10,
        })
        fade.play()
      },
      hide() {
        const fade = new Konva.Tween({
          ...commonConfig,
          opacity: 0,
          offsetY: -10,
          onFinish() {
            node.hide()
          },
        })
        fade.play()
      },
    }
  }

  rerender() {
    this.stage.draw()
  }
}
