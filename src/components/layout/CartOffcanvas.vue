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

function isProductItem(item: any) {
  return !!item.product
}

function isPackageItem(item: any) {
  return !!item.package
}

function goToCheckout() {
  if (cart.items.length === 0) return
  localStorage.setItem('sigyn_cart_checkout', JSON.stringify(cart.items))
  const hasProducts = cart.items.some((i: any) => i.product)
  const hasPackages = cart.items.some((i: any) => i.package)
  if (hasProducts && !hasPackages) {
    router.push('/checkout/product')
  } else {
    router.push('/booking')
  }
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
        <h4 class="cart-header d-flex justify-content-between align-items-center mb-3">
          <span class="cart-title">Your Cart</span>
          <span class="cart-badge">{{ cart.count }} item{{ cart.count !== 1 ? 's' : '' }}</span>
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
            <li v-for="item in cart.items" :key="item.id_cart_item" class="list-group-item d-flex justify-content-between lh-sm align-items-center gap-2 cart-item">
              <div class="d-flex align-items-center gap-2">
                <button class="btn-remove" @click="cart.removeItem(item.id_cart_item)" title="Remove">&times;</button>
                <div>
                  <!-- Package item -->
                  <template v-if="isPackageItem(item)">
                    <h6 class="my-0">{{ item.package?.name }}</h6>
                    <small class="text-body-secondary">{{ item.package?.vendor?.business_name }}</small>
                  </template>
                  <!-- Product item -->
                  <template v-if="isProductItem(item)">
                    <h6 class="my-0">{{ item.product?.name }}</h6>
                    <small class="text-body-secondary">{{ item.product?.vendor?.business_name }}</small>
                    <div class="cart-qty">
                      <button class="qty-btn" @click="cart.updateQuantity(item.id_cart_item, Math.max(1, item.quantity - 1))">-</button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button class="qty-btn" @click="cart.updateQuantity(item.id_cart_item, item.quantity + 1)">+</button>
                    </div>
                  </template>
                </div>
              </div>
              <span class="fw-semibold text-nowrap">
                <template v-if="isPackageItem(item)">{{ formatPrice(item.package?.price) }}</template>
                <template v-if="isProductItem(item)">{{ formatPrice(item.product?.price * item.quantity) }}</template>
              </span>
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
.cart-item {
  position: relative;
  overflow: hidden;
}
.cart-item .btn-remove {
  background: none;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(-8px) scale(0.8);
  transition: opacity 0.25s ease, transform 0.25s ease, background 0.2s;
}
.cart-item:hover .btn-remove {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.cart-item .btn-remove:hover {
  background: #e74c3c;
  color: #fff;
}
.cart-header {
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}
.cart-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.3px;
}
.cart-badge {
  background: #222;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.offcanvas-header .btn-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: transparent;
  opacity: 1;
  position: relative;
  transition: border-color 0.2s;
}
.offcanvas-header .btn-close:hover {
  border-color: #e74c3c;
}
.offcanvas-header .btn-close::before,
.offcanvas-header .btn-close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background: #999;
  border-radius: 1px;
  transform: translate(-50%, -50%) rotate(45deg);
  transition: background 0.2s;
}
.offcanvas-header .btn-close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.offcanvas-header .btn-close:hover::before,
.offcanvas-header .btn-close:hover::after {
  background: #e74c3c;
}
.cart-qty {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.qty-btn {
  width: 22px;
  height: 22px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.qty-btn:hover { background: #eee; }
.qty-val {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
</style>
