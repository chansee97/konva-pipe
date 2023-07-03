<script setup lang="ts">
import Konva from 'konva'
import { createFirePoint, createMapBackground, createPipeNode } from './map'

onMounted(() => {
  const stage = new Konva.Stage({
    container: 'container',
    width: 800,
    height: 600,
  })
  createMapBackground(stage)
  createPipeNode(stage, [
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
  createFirePoint(stage, {
    x: 300,
    y: 200,
  })
})
</script>

<template>
  <div class="flex-center wh-full">
    <div id="container" class="bg-gray-200" />
  </div>
</template>
