<script setup lang="ts">
import postImage1 from '@/assets/kaira/images/post-image1.jpg'
import postImage2 from '@/assets/kaira/images/post-image2.jpg'
import postImage3 from '@/assets/kaira/images/post-image3.jpg'

const blogPosts = [
  {
    id: 1,
    image: postImage1,
    category: 'Wedding Tips',
    date: 'Jan 15, 2025',
    title: '5 Tips Memilih Fotografer Wedding yang Tepat',
    description: 'Temukan fotografer wedding yang sesuai dengan gaya dan budget Anda. Simak tips lengkapnya disini.'
  },
  {
    id: 2,
    image: postImage2,
    category: 'Makeup',
    date: 'Feb 20, 2025',
    title: 'Inspirasi Makeup Look untuk Prewedding',
    description: 'Dari natural glam hingga bold look, temukan inspirasi makeup prewedding yang sempurna untukmu.'
  },
  {
    id: 3,
    image: postImage3,
    category: 'Bouquet',
    date: 'Mar 10, 2025',
    title: '5 Rangkaian Bouquet untuk Lamaran',
    description: 'Bingung pilih bouquet untuk momen lamaran? Ini dia 5 rekomendasi rangkaian bunga terbaik.'
  }
]
</script>

<template>
  <section class="blog py-5">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
        <h4 class="text-uppercase">Read Blog Posts</h4>
        <a href="/blog" class="btn-link">View All</a>
      </div>
      <div class="row">
        <div v-for="post in blogPosts" :key="post.id" class="col-md-4">
          <article class="post-item">
            <div class="post-image">
              <a href="#">
                <img :src="post.image" alt="image" class="post-grid-image img-fluid">
              </a>
            </div>
            <div class="post-content d-flex flex-wrap gap-2 my-3">
              <div class="post-meta text-uppercase fs-6 text-secondary">
                <span class="post-category">{{ post.category }} /</span>
                <span class="meta-day">{{ post.date }}</span>
              </div>
              <h5 class="post-title text-uppercase">
                <a href="#">{{ post.title }}</a>
              </h5>
              <p>{{ post.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>