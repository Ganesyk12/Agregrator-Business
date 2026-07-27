<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const showModal = ref(false)
const submitting = ref(false)
const submitted = ref(false)

const form = ref({
  fullName: '',
  businessName: '',
  email: '',
  phone: '',
  password: '',
  category: '',
  city: '',
  portfolioUrl: '',
  yearsExp: '',
  description: '',
  agree: false
})

const formError = ref('')

const businessCategories = [
  'Photography',
  'Makeup Artist',
  'Bouquet Flowers'
]

const benefits = [
  { icon: 'image', title: 'Showcase Your Portfolio', desc: 'Display your best work and attract potential clients looking for premium creative services.' },
  { icon: 'calendar', title: 'Receive Online Bookings', desc: 'Accept bookings automatically with our smart scheduling system.' },
  { icon: 'users', title: 'Reach More Customers', desc: 'Connect with thousands of potential customers planning their special moments.' },
  { icon: 'shield', title: 'Build Trust & Credibility', desc: 'Verified vendor badges and real reviews help establish your reputation.' },
  { icon: 'grid', title: 'Professional Dashboard', desc: 'Manage your business with an intuitive dashboard designed for creative professionals.' },
  { icon: 'check-circle', title: 'Easy Booking Management', desc: 'Schedule, confirm, and manage all your bookings in one place.' }
]

const faqs = [
  { q: 'How long does the application review take?', a: 'Our team reviews each application within 2-3 business days. We will contact you via email once your application has been processed.' },
  { q: 'Is there a fee to join SIGYN?', a: 'Currently, joining SIGYN as a partner is free. We operate on a commission basis per completed booking.' },
  { q: 'What categories can I register for?', a: 'Currently we accept Photography, Makeup Artist, and Bouquet Flowers vendors. More categories will be available soon.' },
  { q: 'Can I update my portfolio after registering?', a: 'Yes! Once approved, you will have access to your vendor dashboard where you can manage your portfolio, packages, and availability.' },
  { q: 'How do I receive payments?', a: 'Payments are processed securely through our platform and transferred to your account according to our payment schedule.' }
]

function openModal() {
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  showModal.value = false
  document.body.style.overflow = ''
}

async function handleSubmit() {
  formError.value = ''

  if (!form.value.fullName || !form.value.businessName || !form.value.email || !form.value.phone || !form.value.password || !form.value.category || !form.value.agree) {
    formError.value = 'Please fill in all required fields and agree to the terms.'
    return
  }

  submitting.value = true

  try {
    const regRes = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.value.email,
        password: form.value.password,
        full_name: form.value.fullName,
        phone: form.value.phone
      })
    })

    if (!regRes.ok) {
      const err = await regRes.json().catch(() => ({}))
      if (regRes.status === 409) {
        formError.value = 'Email is already registered. Please use a different email or login.'
      } else {
        formError.value = err?.error?.message || 'Registration failed. Please try again.'
      }
      submitting.value = false
      return
    }

    const userData = await regRes.json()
    const id_user = userData.data?.id_user

    if (!id_user) {
      formError.value = 'Registration succeeded but could not retrieve user data.'
      submitting.value = false
      return
    }

    const venRes = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_user,
        business_name: form.value.businessName,
        category: form.value.category,
        location: form.value.city,
        years_exp: parseInt(form.value.yearsExp) || 0,
        description: form.value.description
      })
    })

    if (!venRes.ok) {
      const err = await venRes.json().catch(() => ({}))
      formError.value = err?.error?.message || 'Failed to create vendor profile. Please contact support.'
      submitting.value = false
      return
    }

    submitted.value = true
  } catch {
    formError.value = 'Something went wrong. Please try again later.'
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="partner-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <!-- Hero -->
    <section class="partner-hero">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
      </div>
      <div class="container">
        <div class="hero-content" data-aos="fade-up">
          <span class="hero-label">Become a Partner</span>
          <h1 class="hero-title">Grow Your Creative Business<br/>With SIGYN</h1>
          <p class="hero-desc">Join Indonesia's premier creative platform and connect with thousands of customers planning their most important moments.</p>
          <button class="hero-cta" @click="openModal">
            Apply Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p class="hero-note">Free to join. Commission-based partnership.</p>
        </div>
      </div>
    </section>

    <!-- Why Join -->
    <section class="section why-section">
      <div class="container">
        <div class="section-header" data-aos="fade-up">
          <span class="section-label">Why Join</span>
          <h2 class="section-title">Why Join SIGYN?</h2>
          <p class="section-desc">We provide everything you need to grow your creative business</p>
        </div>

        <div class="benefits-grid">
          <div
            v-for="(benefit, i) in benefits"
            :key="i"
            class="benefit-card"
            data-aos="fade-up"
            :data-aos-delay="i * 100"
          >
            <div class="benefit-icon">
              <svg v-if="benefit.icon === 'image'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <svg v-else-if="benefit.icon === 'calendar'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <svg v-else-if="benefit.icon === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <svg v-else-if="benefit.icon === 'shield'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg v-else-if="benefit.icon === 'grid'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <svg v-else-if="benefit.icon === 'check-circle'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/><polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h3 class="benefit-title">{{ benefit.title }}</h3>
            <p class="benefit-desc">{{ benefit.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Preview -->
    <section class="section preview-section">
      <div class="container">
        <div class="preview-wrapper" data-aos="fade-up">
          <div class="preview-content">
            <span class="section-label">Dashboard</span>
            <h2 class="section-title">Powerful Vendor Dashboard</h2>
            <p class="section-desc">Manage your entire business from one intuitive dashboard designed for creative professionals.</p>

            <div class="preview-features">
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Booking management & calendar</span>
              </div>
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Portfolio & package management</span>
              </div>
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Real-time booking notifications</span>
              </div>
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Customer reviews & ratings</span>
              </div>
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Earnings & payout tracking</span>
              </div>
              <div class="pf-item">
                <div class="pf-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span>Analytics & insights</span>
              </div>
            </div>
          </div>
          <div class="preview-visual">
            <div class="dashboard-mock">
              <div class="mock-header">
                <div class="mock-dots"><span></span><span></span><span></span></div>
                <div class="mock-title">Dashboard</div>
              </div>
              <div class="mock-body">
                <div class="mock-stat"><div class="mock-stat-bar" style="width: 75%"></div><span>Bookings</span></div>
                <div class="mock-stat"><div class="mock-stat-bar" style="width: 60%"></div><span>Revenue</span></div>
                <div class="mock-stat"><div class="mock-stat-bar" style="width: 85%"></div><span>Reviews</span></div>
                <div class="mock-grid">
                  <div class="mock-grid-item"></div>
                  <div class="mock-grid-item"></div>
                  <div class="mock-grid-item"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section faq-section">
      <div class="container">
        <div class="section-header" data-aos="fade-up">
          <span class="section-label">FAQ</span>
          <h2 class="section-title">Frequently Asked Questions</h2>
        </div>

        <div class="faq-list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="faq-item"
            data-aos="fade-up"
            :data-aos-delay="i * 100"
          >
            <details class="faq-details">
              <summary class="faq-question">
                <span>{{ faq.q }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </summary>
              <p class="faq-answer">{{ faq.a }}</p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="section final-cta-section">
      <div class="container">
        <div class="final-cta" data-aos="fade-up">
          <h2 class="final-cta-title">Ready to Grow Your Business?</h2>
          <p class="final-cta-desc">Join SIGYN today and connect with thousands of customers planning their special moments.</p>
          <button class="final-cta-btn" @click="openModal">
            Become a Partner
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <Footer />

    <!-- Application Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <button class="modal-close" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div v-if="submitted" class="modal-success">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--bs-secondary, #B89C7B)" stroke-width="2">
                <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"/><polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h3 class="success-title">Application Submitted!</h3>
            <p class="success-desc">Thank you for applying to become a SIGYN Partner. Our team will review your application and contact you within 2–3 business days.</p>
            <button class="modal-btn" @click="closeModal">Done</button>
          </div>

          <div v-else class="modal-form">
            <h3 class="modal-title">Apply to Become a Partner</h3>
            <p class="modal-desc">Fill in your details and our team will review your application.</p>

            <div v-if="formError" class="form-error">{{ formError }}</div>

            <div class="form-grid">
              <div class="form-group full">
                <label>Full Name <span class="required">*</span></label>
                <input v-model="form.fullName" type="text" placeholder="Your full name" />
              </div>
              <div class="form-group full">
                <label>Business Name <span class="required">*</span></label>
                <input v-model="form.businessName" type="text" placeholder="Your business name" />
              </div>
              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input v-model="form.email" type="email" placeholder="email@example.com" />
              </div>
              <div class="form-group">
                <label>Phone Number <span class="required">*</span></label>
                <input v-model="form.phone" type="tel" placeholder="08xxxxxxxxxx" />
              </div>
              <div class="form-group">
                <label>Password <span class="required">*</span></label>
                <input v-model="form.password" type="password" placeholder="Create a password" />
              </div>
              <div class="form-group">
                <label>Business Category <span class="required">*</span></label>
                <select v-model="form.category">
                  <option value="" disabled>Select category</option>
                  <option v-for="cat in businessCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>City</label>
                <input v-model="form.city" type="text" placeholder="Your city" />
              </div>
              <div class="form-group full">
                <label>Instagram / Portfolio URL</label>
                <input v-model="form.portfolioUrl" type="url" placeholder="https://instagram.com/yourprofile" />
              </div>
              <div class="form-group">
                <label>Years of Experience</label>
                <input v-model="form.yearsExp" type="number" min="0" placeholder="0" />
              </div>
              <div class="form-group full">
                <label>Short Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Tell us about your business..."></textarea>
              </div>
            </div>

            <label class="agree-check">
              <input v-model="form.agree" type="checkbox" />
              <span>I confirm that the information provided is accurate and I agree to SIGYN's <a href="#" @click.prevent>Terms & Conditions</a></span>
            </label>

            <button class="modal-btn" :disabled="submitting" @click="handleSubmit">
              {{ submitting ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.partner-page {
  min-height: 100vh;
  background: var(--bs-body-bg, #F7F4EF);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.partner-hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  overflow: hidden;
  padding: 120px 0 80px;
}

.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--bs-secondary, #B89C7B), #a08060);
  top: -150px;
  right: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f97316, #fb923c);
  bottom: -100px;
  left: -100px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
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
  font-size: 3.5rem;
  color: #fff;
  margin: 0 0 20px;
  line-height: 1.15;
}

.hero-desc {
  font-family: 'Jost', sans-serif;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin-bottom: 36px;
  max-width: 550px;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 30px rgba(184, 156, 123, 0.3);
}

.hero-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.45);
  gap: 14px;
}

.hero-note {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 20px;
}

/* Section */
.section {
  padding: 100px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-label {
  display: inline-block;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2.8rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 16px;
  line-height: 1.2;
}

.section-desc {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  color: var(--bs-body-color, #5a5a5a);
  max-width: 500px;
  margin: 0 auto;
}

/* Benefits */
.why-section {
  background: #fff;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.benefit-card {
  background: var(--bs-body-bg, #F7F4EF);
  border-radius: 20px;
  padding: 32px 28px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid transparent;
}

.benefit-card:hover {
  background: #fff;
  border-color: rgba(184, 156, 123, 0.2);
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.1);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(184, 156, 123, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 20px;
  transition: all 0.4s ease;
}

.benefit-card:hover .benefit-icon {
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
}

.benefit-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.2rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 10px;
  font-weight: 400;
}

.benefit-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0;
  line-height: 1.6;
}

/* Dashboard Preview */
.preview-section {
  background: var(--bs-body-bg, #F7F4EF);
}

.preview-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  background: #fff;
  border-radius: 32px;
  padding: 60px;
}

.preview-content .section-title {
  font-size: 2.2rem;
}

.preview-content .section-desc {
  margin: 0 0 32px;
  max-width: 450px;
}

.preview-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pf-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-black, #2a2a2a);
}

.pf-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(184, 156, 123, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.preview-visual {
  display: flex;
  justify-content: center;
}

.dashboard-mock {
  width: 100%;
  max-width: 420px;
  background: #1a1a2e;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mock-dots {
  display: flex;
  gap: 6px;
}

.mock-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.mock-title {
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.mock-body {
  padding: 24px 20px;
}

.mock-stat {
  margin-bottom: 16px;
}

.mock-stat-bar {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--bs-secondary, #B89C7B), #a08060);
  margin-bottom: 4px;
}

.mock-stat span {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.mock-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 24px;
}

.mock-grid-item {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

/* FAQ */
.faq-section {
  background: #fff;
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--bs-body-bg, #F7F4EF);
  border-radius: 16px;
  overflow: hidden;
}

.faq-details {
  padding: 0;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--bs-black, #2a2a2a);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-question svg {
  transition: transform 0.3s ease;
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.faq-details[open] .faq-question svg {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 24px 20px;
  margin: 0;
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.7;
}

/* Final CTA */
.final-cta-section {
  padding-bottom: 100px;
}

.final-cta {
  text-align: center;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 32px;
  padding: 80px 40px;
}

.final-cta-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2.5rem;
  color: #fff;
  margin: 0 0 16px;
}

.final-cta-desc {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 36px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.final-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 30px rgba(184, 156, 123, 0.3);
}

.final-cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.45);
  gap: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px 40px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bs-body-bg, #F7F4EF);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--bs-black, #2a2a2a);
}

.modal-close:hover {
  background: #e8e8e8;
}

.modal-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.6rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 8px;
}

.modal-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 24px;
}

.form-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 20px;
  font-family: 'Jost', sans-serif;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 0;
}

.form-group.full {
  grid-column: 1 / -1;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-black, #2a2a2a);
  background: var(--bs-body-bg, #F7F4EF);
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--bs-secondary, #B89C7B);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(184, 156, 123, 0.1);
}

.agree-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 24px 0;
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--bs-body-color, #5a5a5a);
  cursor: pointer;
}

.agree-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.agree-check a {
  color: var(--bs-black, #2a2a2a);
  font-weight: 600;
  text-decoration: underline;
}

.modal-btn {
  width: 100%;
  padding: 14px;
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

.modal-btn:hover:not(:disabled) {
  background: var(--bs-secondary, #B89C7B);
}

.modal-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal Success */
.modal-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.5rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 12px;
}

.success-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.7;
  margin: 0 0 32px;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

.modal-container {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (max-width: 992px) {
  .partner-hero {
    min-height: 60vh;
    padding: 100px 0 60px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .preview-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px;
  }

  .final-cta-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .partner-hero {
    padding: 80px 0 40px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-desc {
    font-size: 1rem;
  }

  .section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .preview-wrapper {
    padding: 24px;
    border-radius: 24px;
  }

  .final-cta {
    padding: 40px 24px;
  }

  .final-cta-title {
    font-size: 1.6rem;
  }

  .modal-container {
    padding: 32px 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>