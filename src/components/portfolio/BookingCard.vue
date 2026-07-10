<script setup lang="ts">
defineProps<{
  vendor: {
    id_vendor: number
    business_name: string
    starting_price: number
    status: string
  }
  availability: string | null
}>()

const emit = defineEmits<{
  book: []
  save: []
}>()

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}
</script>

<template>
  <div class="booking-card">
    <div class="booking-vendor">
      <h3 class="booking-vendor-name">{{ vendor.business_name }}</h3>
      <p class="booking-price">
        Starting from <strong>{{ formatPrice(vendor.starting_price) }}</strong>
      </p>
      <div class="booking-availability">
        <span :class="['status-dot', vendor.status === 'verified' ? 'available' : 'unavailable']"></span>
        {{ vendor.status === 'verified' ? 'Available' : 'Unavailable' }}
      </div>
    </div>
    <div class="booking-actions">
      <button class="btn-book" @click="emit('book')">Book Now</button>
      <button class="btn-save" @click="emit('save')">Save Portfolio</button>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;
}
.booking-vendor { margin-bottom: 20px; }
.booking-vendor-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.booking-price {
  color: #555;
  font-size: 0.95rem;
  margin: 0 0 12px;
}
.booking-price strong {
  color: #222;
  font-size: 1.1rem;
}
.booking-availability {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.status-dot.available { background: #22c55e; }
.status-dot.unavailable { background: #ef4444; }
.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-book {
  width: 100%;
  padding: 14px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-book:hover { background: #444; }
.btn-save {
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #222;
  border: 2px solid #222;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-save:hover {
  background: #222;
  color: #fff;
}
</style>
