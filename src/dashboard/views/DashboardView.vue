<script setup lang="ts">
const user = JSON.parse(localStorage.getItem('sigyn_user') || '{}')
const displayName = user.fullname || user.username || 'Admin'
</script>

<template>
  <div class="row">
    <div class="col-md-12">
      <div class="x_panel">
        <div class="x_title">
          <h2>Dashboard</h2>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <div class="welcome-section text-center" style="padding: 80px 20px;">
            <h1 style="font-size: 36px; margin-bottom: 20px; color: #73879C;">
              Selamat Datang, {{ displayName }}!
            </h1>
            <p style="font-size: 18px; color: #999; max-width: 600px; margin: 0 auto; line-height: 1.8;">
              Selamat datang di panel administrasi Agregator Business. 
              Silakan gunakan menu navigasi di sebelah kiri untuk mengelola data dan pengaturan.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
