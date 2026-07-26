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

const businessHours = [
  { day: 'Monday – Friday', hours: '09:00 – 18:00' },
  { day: 'Saturday', hours: '10:00 – 16:00' },
  { day: 'Sunday', hours: 'Closed' }
]

const faqs = [
  { q: 'How do I make a booking?', a: 'Browse our vendors, choose a package that fits your needs, and complete the booking form. You will receive a confirmation from the vendor within 24 hours.' },
  { q: 'Can I cancel or reschedule a booking?', a: 'Yes, you can cancel or reschedule your booking through your account dashboard. Please refer to our cancellation policy for details.' },
  { q: 'How are vendors verified?', a: 'All vendors go through a rigorous verification process including portfolio review, background check, and identity verification before joining SIGYN.' },
  { q: 'Is my payment secure?', a: 'Yes, all payments are processed through secure channels. Your payment information is encrypted and never shared with third parties.' }
]

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
  <div class="contact-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <section class="contact-hero">
      <div class="container">
        <div class="hero-content" data-aos="fade-up">
          <span class="hero-label">Get in Touch</span>
          <h1 class="hero-title">We'd Love to Hear From You</h1>
          <p class="hero-desc">Have a question, need assistance planning your event, or want to collaborate? Our team is here to help.</p>
        </div>
      </div>
    </section>

    <section class="contact-main">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info-side" data-aos="fade-right">
            <div class="info-card">
              <h3 class="info-title">Contact Information</h3>

              <div class="info-items">
                <div class="info-item" v-if="company.address">
                  <div class="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div class="info-text">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ company.address }}</span>
                  </div>
                </div>

                <div class="info-item" v-if="company.phone">
                  <div class="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div class="info-text">
                    <span class="info-label">Phone</span>
                    <span class="info-value">{{ company.phone }}</span>
                  </div>
                </div>

                <div class="info-item" v-if="company.email">
                  <div class="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div class="info-text">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ company.email }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="hours-card">
              <h3 class="info-title">Business Hours</h3>
              <div class="hours-list">
                <div v-for="(h, i) in businessHours" :key="i" class="hours-row">
                  <span class="hours-day">{{ h.day }}</span>
                  <span class="hours-time">{{ h.hours }}</span>
                </div>
              </div>
            </div>

            <div class="social-card">
              <h3 class="info-title">Follow Us</h3>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </a>
                <a href="#" class="social-link" aria-label="Pinterest">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </a>
              </div>
            </div>

            <div class="map-card">
              <div class="map-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bs-secondary, #B89C7B)" stroke-width="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Find us on Google Maps</span>
              </div>
            </div>
          </div>

          <div class="contact-form-side" data-aos="fade-left">
            <div class="form-card">
              <h3 class="form-title">Send Us a Message</h3>
              <p class="form-desc">We'll get back to you within 24 hours</p>

              <div v-if="submitted" class="success-message">
                <div class="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--bs-secondary, #B89C7B)" stroke-width="2">
                    <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/><polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <h4>Thank You!</h4>
                <p>Your message has been sent successfully. Our team will review and respond within 24 hours.</p>
              </div>

              <form v-else @submit.prevent="handleSubmit" class="contact-form">
                <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Your Name <span class="required">*</span></label>
                    <input v-model="form.name" type="text" placeholder="John Doe" required :disabled="submitting" />
                  </div>
                  <div class="form-group">
                    <label>Email Address <span class="required">*</span></label>
                    <input v-model="form.email" type="email" placeholder="john@example.com" required :disabled="submitting" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Subject</label>
                  <input v-model="form.subject" type="text" placeholder="How can we help you?" :disabled="submitting" />
                </div>

                <div class="form-group">
                  <label>Message <span class="required">*</span></label>
                  <textarea v-model="form.message" rows="5" placeholder="Tell us about your event or inquiry..." required :disabled="submitting"></textarea>
                </div>

                <button type="submit" class="btn-submit" :disabled="submitting">
                  <span v-if="!submitting">Send Message</span>
                  <span v-else>Sending...</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </form>
            </div>

            <div class="faq-mini-card">
              <h3 class="info-title">Quick Answers</h3>
              <div class="faq-mini-list">
                <div v-for="(faq, i) in faqs" :key="i" class="faq-mini-item">
                  <details>
                    <summary>
                      <span>{{ faq.q }}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </summary>
                    <p>{{ faq.a }}</p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--bs-body-bg, #F7F4EF);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.contact-hero {
  background: #fff;
  padding: 120px 0 60px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.hero-label {
  display: inline-block;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 20px;
}

.hero-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 3rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 16px;
  line-height: 1.15;
}

.hero-desc {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.7;
  margin: 0;
}

/* Main */
.contact-main {
  padding: 60px 0 100px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  align-items: start;
}

/* Left Side */
.contact-info-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.hours-card,
.social-card,
.map-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.1rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 20px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.info-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(184, 156, 123, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bs-body-color, #5a5a5a);
}

.info-value {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-black, #2a2a2a);
  line-height: 1.4;
}

/* Hours */
.hours-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.hours-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.hours-day {
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-black, #2a2a2a);
  font-weight: 500;
}

.hours-time {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--bs-body-color, #5a5a5a);
}

/* Social */
.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(184, 156, 123, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-body-color, #5a5a5a);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
  transform: translateY(-2px);
}

/* Map */
.map-placeholder {
  height: 160px;
  border-radius: 12px;
  background: rgba(184, 156, 123, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--bs-secondary, #B89C7B);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px dashed rgba(184, 156, 123, 0.2);
}

.map-placeholder:hover {
  background: rgba(184, 156, 123, 0.1);
}

/* Right Side - Form */
.contact-form-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card,
.faq-mini-card {
  background: #fff;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.form-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.4rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 6px;
}

.form-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-black, #2a2a2a);
  margin-bottom: 6px;
}

.required { color: #dc2626; }

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-black, #2a2a2a);
  background: var(--bs-body-bg, #F7F4EF);
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--bs-secondary, #B89C7B);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(184, 156, 123, 0.08);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 20px;
  font-family: 'Jost', sans-serif;
}

.btn-submit {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: var(--bs-black, #2a2a2a);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--bs-secondary, #B89C7B);
  gap: 12px;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Success */
.success-message {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  margin-bottom: 16px;
}

.success-message h4 {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.3rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 8px;
}

.success-message p {
  font-family: 'Jost', sans-serif;
  color: var(--bs-body-color, #5a5a5a);
  font-size: 0.95rem;
  margin: 0;
}

/* FAQ Mini */
.faq-mini-card {
  padding: 24px 28px;
}

.faq-mini-card .info-title {
  margin-bottom: 16px;
  font-size: 1rem;
}

.faq-mini-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-mini-item {
  border-radius: 12px;
  overflow: hidden;
}

.faq-mini-item details {
  background: var(--bs-body-bg, #F7F4EF);
  border-radius: 12px;
}

.faq-mini-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-family: 'Jost', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--bs-black, #2a2a2a);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.faq-mini-item summary::-webkit-details-marker {
  display: none;
}

.faq-mini-item summary svg {
  transition: transform 0.3s ease;
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.faq-mini-item details[open] summary svg {
  transform: rotate(180deg);
}

.faq-mini-item p {
  padding: 0 16px 14px;
  margin: 0;
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.6;
}

@media (max-width: 992px) {
  .contact-hero {
    padding: 100px 0 40px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .contact-hero {
    padding: 80px 0 32px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .contact-main {
    padding: 40px 0 60px;
  }

  .form-card,
  .faq-mini-card {
    padding: 24px 20px;
  }

  .container {
    padding: 0 16px;
  }
}
</style>