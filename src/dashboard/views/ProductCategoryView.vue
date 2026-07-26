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
  <div class="x_panel">
    <div class="x_title"><h2>Product Categories</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="alert alert-info">Manage product occasion, type, and size categories here.</div>

      <div class="row">
        <div class="col-md-4">
          <div class="panel panel-default">
            <div class="panel-heading"><h3 class="panel-title">Occasions</h3></div>
            <div class="panel-body">
              <ul class="list-group">
                <li v-for="o in occasions" :key="o.id_occasion" class="list-group-item">{{ o.name }} <span class="badge">{{ o.sort_order }}</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="panel panel-default">
            <div class="panel-heading"><h3 class="panel-title">Types</h3></div>
            <div class="panel-body">
              <ul class="list-group">
                <li v-for="t in types" :key="t.id_type" class="list-group-item">{{ t.name }} <span class="badge">{{ t.sort_order }}</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="panel panel-default">
            <div class="panel-heading"><h3 class="panel-title">Sizes</h3></div>
            <div class="panel-body">
              <ul class="list-group">
                <li v-for="s in sizes" :key="s.id_size" class="list-group-item">{{ s.name }} <span class="badge">{{ s.sort_order }}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
