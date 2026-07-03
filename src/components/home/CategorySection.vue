<script setup lang="ts">
import catItem1 from '@/assets/kaira/images/cat-item1.jpg'
import catItem2 from '@/assets/kaira/images/cat-item2.jpg'
import catItem3 from '@/assets/kaira/images/cat-item3.jpg'

const categories = [
  {
    id: 1,
    image: catItem1,
    title: 'Shop for men',
    link: '/shop/men'
  },
  {
    id: 2,
    image: catItem2,
    title: 'Shop for women',
    link: '/shop/women'
  },
  {
    id: 3,
    image: catItem3,
    title: 'Shop accessories',
    link: '/shop/accessories'
  }
]
</script>

<template>
  <section class="categories overflow-hidden">
    <div class="container">
      <div class="open-up" data-aos="zoom-out">
        <div class="row">
          <div v-for="category in categories" :key="category.id" class="col-md-4">
            <div class="cat-item image-zoom-effect">
              <div class="image-holder">
                <a :href="category.link">
                  <img :src="category.image" alt="categories" class="product-image img-fluid">
                </a>
              </div>
              <div class="category-content">
                <div class="product-button">
                  <a :href="category.link" class="btn btn-common text-uppercase">{{ category.title }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>