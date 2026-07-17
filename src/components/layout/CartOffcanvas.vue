<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

function formatPrice(v: number) {
  return 'Rp ' + v.toLocaleString('id-ID')
}

function goToCheckout() {
  if (cart.items.length === 0) return
  localStorage.setItem('sigyn_cart_checkout', JSON.stringify(cart.items))
  router.push('/booking')
}

onMounted(() => {
  if (auth.isLoggedIn) cart.fetchCart()
})
</script>

<template>
  <div class="offcanvas offcanvas-end" data-bs-scroll="true" tabindex="-1" id="offcanvasCart" aria-labelledby="My Cart">
    <div class="offcanvas-header justify-content-center">
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <div class="order-md-last">
        <h4 class="d-flex justify-content-between align-items-center mb-3">
          <span class="text-primary">Your cart</span>
          <span class="badge bg-primary rounded-pill">{{ cart.count }}</span>
        </h4>

        <div v-if="!auth.isLoggedIn" class="text-center py-4">
          <p class="text-muted">Please sign in to view your cart.</p>
          <a href="/login" class="btn btn-dark">Sign In</a>
        </div>

        <div v-else-if="cart.loading" class="text-center py-4">
          <p class="text-muted">Loading...</p>
        </div>

        <div v-else-if="cart.items.length === 0" class="text-center py-4">
          <p class="text-muted">Your cart is empty.</p>
        </div>

        <template v-else>
          <ul class="list-group mb-3">
            <li v-for="item in cart.items" :key="item.id_cart_item" class="list-group-item d-flex justify-content-between lh-sm align-items-center">
              <div>
                <h6 class="my-0">{{ item.package?.name }}</h6>
                <small class="text-body-secondary">{{ item.package?.vendor?.business_name }}</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="fw-semibold">{{ formatPrice(item.package?.price) }}</span>
                <button class="btn-remove" @click="cart.removeItem(item.id_cart_item)" title="Remove">&times;</button>
              </div>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Total</span>
              <strong>{{ formatPrice(cart.total) }}</strong>
            </li>
          </ul>

          <button class="w-100 btn btn-primary btn-lg" @click="goToCheckout">Continue to Checkout</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
</style>
