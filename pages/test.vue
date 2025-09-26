<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">🔧 Debug Dashboard</h1>
      
      <!-- API Test -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">API Connection Test</h2>
        <div class="space-y-4">
          <button 
            @click="testConnection" 
            :disabled="testing"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {{ testing ? 'Testing...' : 'Test Google Sheets Connection' }}
          </button>
          
          <div v-if="testResult" class="p-4 rounded-lg" :class="{
            'bg-green-50 border border-green-200': testResult.success,
            'bg-red-50 border border-red-200': !testResult.success
          }">
            <p class="font-medium" :class="{
              'text-green-800': testResult.success,
              'text-red-800': !testResult.success
            }">
              {{ testResult.message }}
            </p>
            <pre v-if="testResult.details" class="mt-2 text-xs text-gray-600 overflow-auto">{{ JSON.stringify(testResult.details, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Data Fetch Test -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Data Fetch Test</h2>
        <div class="space-y-4">
          <button 
            @click="fetchData" 
            :disabled="fetching"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {{ fetching ? 'Fetching...' : 'Fetch Feedback Data' }}
          </button>
          
          <div v-if="dataResult" class="p-4 rounded-lg" :class="{
            'bg-green-50 border border-green-200': dataResult.success,
            'bg-red-50 border border-red-200': !dataResult.success
          }">
            <p class="font-medium" :class="{
              'text-green-800': dataResult.success,
              'text-red-800': !dataResult.success
            }">
              {{ dataResult.message }}
            </p>
            <div v-if="dataResult.data && dataResult.data.length > 0" class="mt-4">
              <p class="text-sm text-gray-600">Found {{ dataResult.data.length }} feedback items:</p>
              <div class="mt-2 max-h-40 overflow-auto">
                <div v-for="item in dataResult.data.slice(0, 3)" :key="item.id" class="text-xs bg-gray-50 p-2 rounded mb-2">
                  <strong>{{ item.accountName }}</strong>: {{ item.feedback.substring(0, 100) }}...
                </div>
              </div>
            </div>
            <pre v-else-if="dataResult.error" class="mt-2 text-xs text-red-600 overflow-auto">{{ dataResult.error }}</pre>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink to="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const testing = ref(false)
const fetching = ref(false)
const testResult = ref(null)
const dataResult = ref(null)

const testConnection = async () => {
  testing.value = true
  testResult.value = null
  
  try {
    const result = await $fetch('/api/sheets/test')
    testResult.value = {
      success: result.success,
      message: result.message,
      details: result
    }
  } catch (err) {
    testResult.value = {
      success: false,
      message: `Connection failed: ${err.message}`,
      details: err
    }
  } finally {
    testing.value = false
  }
}

const fetchData = async () => {
  fetching.value = true
  dataResult.value = null
  
  try {
    const result = await $fetch('/api/sheets/data')
    dataResult.value = {
      success: true,
      message: `Successfully loaded ${result.data?.length || 0} items`,
      data: result.data
    }
  } catch (err) {
    dataResult.value = {
      success: false,
      message: `Data fetch failed: ${err.message}`,
      error: err.message
    }
  } finally {
    fetching.value = false
  }
}

useHead({
  title: 'Debug Page - Ontop Feedback Analytics'
})
</script>
