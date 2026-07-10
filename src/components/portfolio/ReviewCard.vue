<script setup lang="ts">
defineProps<{
  review: {
    id_review: number
    rating: number
    comment: string | null
    event_type: string | null
    created_at: string
    user: {
      full_name: string
      avatar_url: string | null
    }
  }
}>()

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="review-avatar">
        <img
          v-if="review.user.avatar_url"
          :src="review.user.avatar_url"
          :alt="review.user.full_name"
        />
        <span v-else class="avatar-placeholder">{{ review.user.full_name.charAt(0) }}</span>
      </div>
      <div class="review-meta">
        <h4 class="review-name">{{ review.user.full_name }}</h4>
        <span class="review-event">{{ review.event_type }}</span>
      </div>
      <div class="review-rating">{{ stars(review.rating) }}</div>
    </div>
    <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
  </div>
</template>

<style scoped>
.review-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.review-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.review-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  color: #666;
  font-weight: 600;
  font-size: 1.2rem;
}
.review-meta { flex: 1; }
.review-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}
.review-event {
  font-size: 0.8rem;
  color: #888;
}
.review-rating {
  color: #f5b342;
  font-size: 1rem;
  letter-spacing: 2px;
}
.review-comment {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}
</style>
