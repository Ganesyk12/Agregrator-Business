<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = withDefaults(defineProps<{
  data?: number[]
  labels?: string[]
  colors?: string[]
}>(), {
  data: () => [30, 45, 15, 10],
  labels: () => ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
  colors: () => ['#3498DB', '#26B99A', '#9B59B6', '#E74C3C'],
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'doughnut'> | null = null

onMounted(() => {
  if (!canvasRef.value) return
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.colors,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      responsive: false,
      maintainAspectRatio: false,
    },
  })
})

onUnmounted(() => {
  chart?.destroy()
})
</script>

<template>
  <canvas ref="canvasRef" width="140" height="140"></canvas>
</template>
