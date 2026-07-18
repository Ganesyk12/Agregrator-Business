<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

interface CompanyInfo {
  company_name: string
  address: string
  phone: string
  email: string
  website: string
}

const company = ref<CompanyInfo>({
  company_name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
})

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  if (!form.value.name || !form.value.email || !form.value.message) {
    errorMsg.value = 'Name, email, and message are required.'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const res = await fetch('/api/contact-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) throw new Error('Failed to send message')
    submitted.value = true
  } catch {
    errorMsg.value = 'Failed to send message. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/company-info')
    const json = await res.json()
    if (res.ok && json.data) {
      company.value = json.data
    }
  } catch {
    // fallback
  }
})
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="page-header">
      <h1 class="page-title">Contact Us</h1>
      <p class="page-subtitle">We'd love to hear from you</p>
    </div>

    <section class="contact-section py-5">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-6">
            <div class="contact-info">
              <h3 class="info-title">Get in Touch</h3>
              <p class="info-desc">Have a question, need assistance, or want to collaborate? Reach out to us.</p>

              <div class="info-item" v-if="company.address">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h5>Address</h5>
                  <p>{{ company.address }}</p>
                </div>
              </div>

              <div class="info-item" v-if="company.phone">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h5>Phone</h5>
                  <p>{{ company.phone }}</p>
                </div>
              </div>

              <div class="info-item" v-if="company.email">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h5>Email</h5>
                  <p>{{ company.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="contact-form">
              <h3 class="info-title">Send Us a Message</h3>
              <div v-if="submitted" class="success-message">
                <h4>Thank You!</h4>
                <p>Your message has been sent successfully. We'll get back to you soon.</p>
              </div>

              <form v-else @submit.prevent="handleSubmit">
                <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>
                <div class="form-group">
                  <label>Your Name <span class="required">*</span></label>
                  <input v-model="form.name" type="text" placeholder="John Doe" required :disabled="submitting" />
                </div>
                <div class="form-group">
                  <label>Email Address <span class="required">*</span></label>
                  <input v-model="form.email" type="email" placeholder="john@example.com" required :disabled="submitting" />
                </div>
                <div class="form-group">
                  <label>Subject</label>
                  <input v-model="form.subject" type="text" placeholder="How can we help?" :disabled="submitting" />
                </div>
                <div class="form-group">
                  <label>Message <span class="required">*</span></label>
                  <textarea v-model="form.message" rows="5" placeholder="Write your message..." required :disabled="submitting"></textarea>
                </div>
                <button type="submit" class="btn-submit" :disabled="submitting">
                  {{ submitting ? 'Sending...' : 'Send Message' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  padding: 40px 20px 20px;
}
.page-title {
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.page-subtitle {
  color: #666;
  font-size: 1rem;
}

.contact-section {
  background: #fff;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-desc {
  color: #888;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #555;
}

.info-item h5 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  color: #888;
  margin: 0;
  font-size: 0.95rem;
}

.contact-form {
  background: #fafafa;
  border-radius: 16px;
  padding: 32px;
}

.contact-form .info-title {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #333;
}

.required { color: #dc2626; }

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 20px;
}

.success-message {
  text-align: center;
  padding: 40px 20px;
}

.success-message h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #16a34a;
}

.success-message p {
  color: #666;
  font-size: 0.95rem;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #555;
}

.btn-submit:disabled {
  background: #999;
  cursor: not-allowed;
}
</style>
