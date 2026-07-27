<script setup lang="ts">
import { ref, onMounted } from 'vue'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Occasion { id_occasion: number; name: string; slug: string; sort_order: number; status: string }
interface Type { id_type: number; name: string; slug: string; sort_order: number; status: string }
interface Size { id_size: number; name: string; slug: string; sort_order: number; status: string }

const occasions = ref<Occasion[]>([])
const types = ref<Type[]>([])
const sizes = ref<Size[]>([])

async function fetchAll() {
  try {
    const [oRes, tRes, sRes] = await Promise.all([
      fetch(`${apiUrl}/api/products/occasions`),
      fetch(`${apiUrl}/api/products/types`),
      fetch(`${apiUrl}/api/products/sizes`),
    ])
    if (oRes.ok) occasions.value = (await oRes.json()).data || []
    if (tRes.ok) types.value = (await tRes.json()).data || []
    if (sRes.ok) sizes.value = (await sRes.json()).data || []
  } catch (err) { console.error(err) }
}

onMounted(fetchAll)
</script>

<template>
  <div class="row">
    <!-- Description Card -->
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <h5>Product Classifications</h5>
        </div>
        <div class="card-body">
          <p class="text-muted m-b-0">
            <i class="fa fa-info-circle text-primary"></i> 
            This system categorizes physical store items by Occasion, Type, and Size attributes to optimize catalog presentation.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <!-- Occasions -->
    <div class="col-md-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fa fa-gift text-c-blue m-r-10"></i>Occasions</h5>
        </div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <ul class="list-group list-group-flush" style="padding-left:0; margin-bottom:0;">
            <li v-for="o in occasions" :key="o.id_occasion" 
                class="list-group-item" 
                style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f1f1f1;">
              <span style="font-weight: 600; color: #2c3e50;">{{ o.name }}</span>
              <span class="badge bg-c-blue text-white" style="font-size: 11px;">Index: {{ o.sort_order }}</span>
            </li>
            <li v-if="occasions.length === 0" class="text-muted text-center" style="padding: 15px 0; list-style:none;">No occasions defined.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Types -->
    <div class="col-md-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fa fa-tags text-c-green m-r-10"></i>Types</h5>
        </div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <ul class="list-group list-group-flush" style="padding-left:0; margin-bottom:0;">
            <li v-for="t in types" :key="t.id_type" 
                class="list-group-item" 
                style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f1f1f1;">
              <span style="font-weight: 600; color: #2c3e50;">{{ t.name }}</span>
              <span class="badge bg-c-green text-white" style="font-size: 11px;">Index: {{ t.sort_order }}</span>
            </li>
            <li v-if="types.length === 0" class="text-muted text-center" style="padding: 15px 0; list-style:none;">No types defined.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Sizes -->
    <div class="col-md-4">
      <div class="card">
        <div class="card-header">
          <h5><i class="fa fa-arrows-alt text-c-red m-r-10"></i>Sizes</h5>
        </div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <ul class="list-group list-group-flush" style="padding-left:0; margin-bottom:0;">
            <li v-for="s in sizes" :key="s.id_size" 
                class="list-group-item" 
                style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f1f1f1;">
              <span style="font-weight: 600; color: #2c3e50;">{{ s.name }}</span>
              <span class="badge bg-c-red text-white" style="font-size: 11px;">Index: {{ s.sort_order }}</span>
            </li>
            <li v-if="sizes.length === 0" class="text-muted text-center" style="padding: 15px 0; list-style:none;">No sizes defined.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
