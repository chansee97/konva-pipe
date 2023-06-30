<script setup lang="ts">
import Konva from 'konva'

onMounted(() => {
  const stage = new Konva.Stage({
    container: 'container',
    width: 800,
    height: 600,
  })
  // 创建图层
  const tooltipLayer = new Konva.Layer()
  const layer = new Konva.Layer()

  // 创建label的容器
  const group = new Konva.Group({
    x: 0,
    y: 0,
    visible: false,
  })
  tooltipLayer.add(group)

  // 创建label的底边
  const bottomRect = new Konva.Rect({
    width: 100,
    height: 100,
    fill: 'white',
    stroke: '#ddd',
    strokeWidth: 2,
    cornerRadius: 10,
  })
  group.add(bottomRect)

  // 创建label的文本内容
  const text = new Konva.Text({
    text: '一级',
    fontSize: 20,
    fill: 'black',
    offsetX: 0,
    offsetY: 0,
  })
  group.add(text)

  // 监听舞台的mousemove事件
  stage.on('mousemove', () => {
    const { x, y } = stage.getPointerPosition()
    group.position({
      x: x - 50,
      y: y - 110,
    })
    tooltipLayer.draw()
  })

  Konva.Image.fromURL('/assets/fire-pointer.png', (darthNode) => {
    darthNode.setAttrs({
      x: 200,
      y: 100,
      scaleX: 0.5,
      scaleY: 0.5,
    })
    layer.add(darthNode)
    layer.batchDraw()

    darthNode.on('mousemove', () => {
      const { x, y } = stage.getPointerPosition()
      group.position({
        x,
        y: y - 10,
      })
      // tooltip.getText().text('Red Circle')
      group.show()
      tooltipLayer.draw()
    })
    darthNode.on('mouseout', () => {
      group.hide()
      tooltipLayer.draw()
    })
  })
  // 渲染舞台
  stage.add(layer)
  stage.add(tooltipLayer)
  // stage.draw()
})
</script>

<template>
  <div class="flex-center wh-full">
    <div id="container" />
  </div>
</template>
