<script setup lang="ts">
interface ServiceCategory {
  id: number
  icon: string
  title: string
  description: string
  link: string
  gradient: string
}

const categories: ServiceCategory[] = [
  {
    id: 1,
    icon: 'camera',
    title: 'Photography',
    description: 'Abadikan setiap momen berharga dengan jasa fotografi profesional dari vendor terbaik.',
    link: '/photography',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    icon: 'brush',
    title: 'MUA',
    description: 'Tampil memukau di hari spesialmu dengan sentuhan makeup artist berpengalaman.',
    link: '/mua',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    icon: 'sparkles',
    title: 'Nail Art',
    description: 'Sentuhan cantik di ujung jarimu dengan kreasi nail art yang unik dan stylish.',
    link: '/photography',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    icon: 'flower',
    title: 'Bouquet Flowers',
    description: 'Harum segar bunga pilihan untuk orang tersayang, dirangkai dengan seni dan cinta.',
    link: '/bouquet',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
]
</script>

<template>
  <section class="services py-5 bg-light">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-md-8" data-aos="fade-up">
          <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Layanan Kami</span>
          <h2 class="section-title display-6 mt-2">Pilih Kategori yang Kamu Butuhkan</h2>
        </div>
      </div>
      <div class="row g-4">
        <div
          v-for="category in categories"
          :key="category.id"
          class="col-md-6 col-lg-3"
          data-aos="fade-up"
          :data-aos-delay="category.id * 150"
        >
          <router-link
            :to="category.link"
            class="service-card text-decoration-none d-block"
          >
            <div class="card border-0 h-100 shadow-sm">
              <div class="card-body text-center p-4">
                <div
                  class="service-icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  :style="{ background: category.gradient }"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" class="text-white">
                    <use xlink:href="#star-outline"></use>
                  </svg>
                </div>
                <h4 class="card-title text-uppercase mb-3">{{ category.title }}</h4>
                <p class="card-text text-muted">{{ category.description }}</p>
                <span class="btn-link text-uppercase text-decoration-none item-anchor">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <use xlink:href="#arrow-right"></use>
                  </svg>
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.2em;
}
.service-card {
  transition: transform 0.3s ease;
}
.service-card:hover {
  transform: translateY(-8px);
}
.service-icon {
  width: 70px;
  height: 70px;
  transition: transform 0.3s ease;
}
.service-card:hover .service-icon {
  transform: scale(1.1);
}
.card {
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}
.service-card:hover .card {
  box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
}
</style>
