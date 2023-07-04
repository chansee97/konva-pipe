import Konva from 'konva'

interface NodeConfig {
  x: number
  y: number
  text?: string
}
export function createMapBackground(stage: Konva.Stage) {
  const bgLayer = new Konva.Layer()
  Konva.Image.fromURL('/assets/demo-bg.png', (darthNode) => {
    darthNode.setAttrs({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
    })
    bgLayer.add(darthNode)
  })
  stage.add(bgLayer)
}
export function createFirePoint(stage: Konva.Stage, config: NodeConfig) {
  const fireLabelLayer = new Konva.Layer()
  const fireLayer = new Konva.Layer()

  // 创建label绑定组
  const group = new Konva.Group({
    x: 0,
    y: 0,
    visible: false,
    draggable: true,
    opacity: 0,
  })

  fireLabelLayer.add(group)

  // 创建label容器
  const labelContainer = new Konva.Rect({
    width: 300,
    height: 200,
    fill: '#113E71',
    stroke: '#0783FA',
    strokeWidth: 2,
    opacity: 0.7,
  })
  group.add(labelContainer)

  // 创建label的标签文本
  const labelText = new Konva.Text({
    text: '检测时间',
    fontSize: 12,
    fill: '#C6D1DB',
    offsetX: 0,
    offsetY: 0,
  })
  group.add(labelText)
  // 创建label的内容文本内容
  const contentText = new Konva.Text({
    text: '2023/1/1 12:15:23',
    fontSize: 24,
    fill: '#FFFFFF',
    offsetX: 0,
    offsetY: -12,
  })
  group.add(contentText)

  // 创建关闭按钮
  const closeButtonSize = 20
  const closeButtonPadding = 5
  Konva.Image.fromURL('/assets/modal-close.png', (darthNode) => {
    darthNode.setAttrs({
      x: labelContainer.width() - closeButtonSize - closeButtonPadding,
      y: closeButtonPadding,
      width: closeButtonSize,
      height: closeButtonSize,
    })
    darthNode.on('click', () => {
      fade(group).hide()
    })
    setCursor(stage, darthNode)
    group.add(darthNode)
  })

  // 创建火点图标
  const fireIconSize = 30
  Konva.Image.fromURL('/assets/fire-pointer.png', (darthNode) => {
    darthNode.setAttrs({
      x: config.x,
      y: config.y,
      width: fireIconSize,
      height: fireIconSize,
      shadowColor: 'white',
      shadowBlur: 0,
      shadowOffset: { x: 0, y: 0 },
      shadowOpacity: 0.9,
    })
    fireLayer.add(darthNode)
    darthNode.on('mouseenter', () => {
      darthNode.shadowBlur(10)
    })
    darthNode.on('mouseleave', () => {
      darthNode.shadowBlur(0)
    })
    darthNode.on('click', () => {
      if (group.opacity())
        return fade(group).hide()

      group.position({
        x: darthNode.x() - ((labelContainer.width() - darthNode.width()) / 2),
        y: darthNode.y() - labelContainer.height() - 5,
      })
      fade(group).show()
    })

    setCursor(stage, darthNode)
  })

  stage.add(fireLayer)
  stage.add(fireLabelLayer)
}

export function createPipeNode(stage: Konva.Stage, configs: NodeConfig[]) {
  const pipeLayer = new Konva.Layer()

  function generateNode(config: NodeConfig) {
    const nodeGroup = new Konva.Group({
      x: config.x,
      y: config.y,
    })
    pipeLayer.add(nodeGroup)

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
  }
  configs.forEach(config => generateNode(config))
  stage.add(pipeLayer)
}

function fade(node: Konva.Node) {
  const commonConfig = {
    node,
    easing: Konva.Easings.EaseOut,
    duration: 0.3,
  }
  return {
    show() {
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

function setCursor(stage: Konva.Stage, node: Konva.Node, type = 'pointer') {
  node.on('mouseenter', () => {
    stage.container().style.cursor = type
  })
  node.on('mouseleave', () => {
    stage.container().style.cursor = 'default'
  })
}
