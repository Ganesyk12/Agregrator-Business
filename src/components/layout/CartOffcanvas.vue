<script setup lang="ts">
interface CartItem {
  id: number
  name: string
  description: string
  price: number
}

const cartItems: CartItem[] = [
  { id: 1, name: 'Growers cider', description: 'Brief description', price: 12 },
  { id: 2, name: 'Fresh grapes', description: 'Brief description', price: 8 },
  { id: 3, name: 'Heinz tomato ketchup', description: 'Brief description', price: 5 }
]

const total = cartItems.reduce((sum, item) => sum + item.price, 0)
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
          <span class="badge bg-primary rounded-pill">{{ cartItems.length }}</span>
        </h4>
        <ul class="list-group mb-3">
          <li v-for="item in cartItems" :key="item.id" class="list-group-item d-flex justify-content-between lh-sm">
            <div>
              <h6 class="my-0">{{ item.name }}</h6>
              <small class="text-body-secondary">{{ item.description }}</small>
            </div>
            <span class="text-body-secondary">${{ item.price }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong>${{ total }}</strong>
          </li>
        </ul>

        <button class="w-100 btn btn-primary btn-lg" type="submit">Continue to Checkout</button>
      </div>
    </div>
  </div>
</template>