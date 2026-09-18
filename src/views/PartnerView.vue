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

          <div class="modal-scroll-content">
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
      </div>
    </Transition>
  </div>
</template>