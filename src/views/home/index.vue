<script setup lang="ts">
import { PipeMap } from './map'

const mapRef = ref()
let map: PipeMap

onMounted(() => {
  map = new PipeMap({
    container: mapRef.value,
    width: 800,
    height: 600,
    mapBackgroundImgUrl: new URL('./demo-bg.png', import.meta.url).href,
  })

  map.setPipeNode([
    {
      x: 100,
      y: 100,
      text: '一号井',
    },
    {
      x: 300,
      y: 100,
      text: '二号井',
    },
  ])

  map.setEventPoint({
    x: 300,
    y: 200,
    type: 'warning',
  })
})

function refresh() {
  map.rerender()
}
function setPipeNode() {
  map.setPipeNode({
    x: 200,
    y: 150,
    text: 'X号井',
  })
}
function setEventNode() {
  map.setEventPoint({
    x: 300,
    y: 400,
    type: 'end',
    size: 60,
  })
}

function setRoute() {
  map.setRouteLine([100, 100, 150, 130, 300, 100])
}
</script>

<template>
  <div class="flex-center flex-col gap-1em wh-full">
    <div ref="mapRef" class="bg-gray-200" />
    <div class="flex gap-1em">
      <n-button @click="refresh ">
        刷新地图
      </n-button>
      <n-button @click="setPipeNode">
        换个X管廊
      </n-button>
      <n-button @click="setEventNode">
        设置一个事件
      </n-button>
      <n-button @click="setRoute ">
        设置线路
      </n-button>
    </div>
  </div>
</template>
