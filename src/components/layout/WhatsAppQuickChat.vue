<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const companyName = ref('SIGYN')
const phone = ref('')

const envNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()
const waNumber = computed(() => normalizePhone(envNumber || phone.value))

const waLink = computed(() => {
  if (!waNumber.value) return ''
  const message = `Halo ${companyName.value}, saya ingin bertanya.`
  return `https://wa.me/${waNumber.value}?text=${encodeURIComponent(message)}`
})

function normalizePhone(raw: string) {
  let digits = (raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  else if (digits.startsWith('8')) digits = '62' + digits
  return digits
}

onMounted(async () => {
  try {
    const res = await fetch('/api/company-info')
    if (!res.ok) return
    const json = await res.json()
    const data = json.data || {}
    if (data.company_name) companyName.value = data.company_name
    if (data.phone) phone.value = data.phone
  } catch {
    /* ignore */
  }
})
</script>

<template>
  <a
    v-if="waLink"
    :href="waLink"
    class="wa-quick-chat"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    title="Chat with us on WhatsApp"
  >
    <span class="wa-pulse" aria-hidden="true"></span>
    <svg class="wa-icon" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.02L4 29l8.14-1.55a12 12 0 0 0 3.9.65h.01C22.68 28.1 28.08 22.7 28.08 16.06 28.08 8.4 22.68 3 16.04 3zm0 22.75h-.01a10 10 0 0 1-5.09-1.39l-.36-.22-3.83.73.74-3.73-.24-.38a9.96 9.96 0 0 1-1.53-5.32c0-5.52 4.5-10.01 10.02-10.01 2.68 0 5.19 1.04 7.08 2.94a9.94 9.94 0 0 1 2.94 7.08c0 5.52-4.5 10.01-10.02 10.01zm5.5-7.5c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z" />
    </svg>
    <span class="wa-tooltip">Chat with us</span>
  </a>
</template>

<style scoped>
.wa-quick-chat {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 900;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
  text-decoration: none;
  animation: wa-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.wa-quick-chat:hover {
  background: #20bd5a;
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 30px rgba(37, 211, 102, 0.5);
}

.wa-icon {
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 1;
}

.wa-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(37, 211, 102, 0.55);
  animation: wa-pulse 2.4s ease-out infinite;
  z-index: 0;
}

.wa-tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%) translateX(6px);
  padding: 8px 14px;
  border-radius: 8px;
  background: #1d1d1f;
  color: #fff;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.wa-quick-chat:hover .wa-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

@keyframes wa-pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes wa-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

@media (max-width: 576px) {
  .wa-quick-chat {
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
  }

  .wa-icon {
    width: 29px;
    height: 29px;
  }

  .wa-tooltip {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wa-quick-chat,
  .wa-pulse {
    animation: none;
  }
}
</style>
