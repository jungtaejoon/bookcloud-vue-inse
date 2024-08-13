<template>
  <div id="app">
    <h1>Excel to PDF Converter</h1>
    <form @submit.prevent="uploadFiles">
      <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" multiple />
      <button type="submit" :disabled="!files.length || isLoading">Convert to PDF</button>
    </form>
    <div v-if="isLoading">
      Converting files, please wait...
      <progress :value="progress" max="100">{{ progress }}%</progress>
    </div>
    <div v-if="pdfUrl && !isLoading">
      <a :href="pdfUrl" download="converted_pdfs.zip" @click="resetState">Download PDFs</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const files = ref([])
const pdfUrl = ref('')
const isLoading = ref(false)
const progress = ref(0)

const handleFileUpload = (event) => {
  files.value = Array.from(event.target.files)
}

const uploadFiles = async () => {
  if (!files.value.length) return

  isLoading.value = true  // 로딩 시작
  startProgressListener() // 진행 상황 수신 시작

  const formData = new FormData()
  files.value.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await axios.post('http://localhost:3000/convert-excel-to-pdf', formData, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }))
    pdfUrl.value = url
  } catch (error) {
    console.error('Error uploading the files:', error)
  } finally {
    isLoading.value = false  // 로딩 끝
  }
}

const startProgressListener = () => {
  const eventSource = new EventSource('http://localhost:3000/progress')

  eventSource.onmessage = (event) => {
    if (event.data === 'done') {
      eventSource.close()
    } else {
      progress.value = Number(event.data)
    }
  }

  eventSource.onerror = () => {
    eventSource.close()
  }
}

const resetState = () => {
  files.value = []
  pdfUrl.value = ''
  isLoading.value = false
  progress.value = 0
}
</script>

<style scoped>
#app {
  margin-top: 20px;
}

progress {
  width: 100%;
  height: 20px;
}
</style>
