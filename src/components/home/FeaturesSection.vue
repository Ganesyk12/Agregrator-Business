<script setup lang="ts">
const features = [
  { icon: 'calendar', title: 'Book An Appointment', description: 'At imperdiet dui accumsan sit amet nulla risus est ultricies quis.' },
  { icon: 'shopping-bag', title: 'Pick up in store', description: 'At imperdiet dui accumsan sit amet nulla risus est ultricies quis.' },
  { icon: 'gift', title: 'Special packaging', description: 'At imperdiet dui accumsan sit amet nulla risus est ultricies quis.' },
  { icon: 'arrow-cycle', title: 'free global returns', description: 'At imperdiet dui accumsan sit amet nulla risus est ultricies quis.' }
]
</script>

<template>
  <section class="features py-5">
    <div class="container">
      <div class="row">
        <div v-for="(feature, index) in features" :key="index" class="col-md-3 text-center" :data-aos="'fade-in'" :data-aos-delay="index * 300">
          <div class="py-5">
            <svg width="38" height="38" viewBox="0 0 24 24">
              <use :xlink:href="`#${feature.icon}`"></use>
            </svg>
            <h4 class="element-title text-capitalize my-3">{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
