<script setup lang="ts">
import postImage1 from '@/assets/kaira/images/post-image1.jpg'
import postImage2 from '@/assets/kaira/images/post-image2.jpg'
import postImage3 from '@/assets/kaira/images/post-image3.jpg'

const blogPosts = [
  {
    id: 1,
    image: postImage1,
    category: 'Fashion',
    date: 'jul 11, 2022',
    title: 'How to look outstanding in pastel',
    description: 'Dignissim lacus,turpis ut suspendisse vel tellus.Turpis purus,gravida orci,fringilla...'
  },
  {
    id: 2,
    image: postImage2,
    category: 'Fashion',
    date: 'jul 11, 2022',
    title: 'Top 10 fashion trend for summer',
    description: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...'
  },
  {
    id: 3,
    image: postImage3,
    category: 'Fashion',
    date: 'jul 11, 2022',
    title: 'Crazy fashion with unique moment',
    description: 'Turpis purus, gravida orci, fringilla dignissim lacus, turpis ut suspendisse vel tellus...'
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