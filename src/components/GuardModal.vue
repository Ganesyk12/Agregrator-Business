<script setup lang="ts">
defineProps<{
  daysRemaining: number
  trialEndsAt: Date | null
}>()
</script>

<template>
  <div class="guard-overlay">
    <div class="guard-card">
      <div class="guard-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <h2>System Activation Required</h2>
      <p class="guard-desc">
        This system has not been activated. Please contact your administrator to activate the system.
      </p>
      <div v-if="daysRemaining > 0" class="guard-trial">
        <span class="trial-label">Trial Period</span>
        <span class="trial-days">{{ daysRemaining }} day{{ daysRemaining !== 1 ? 's' : '' }} remaining</span>
        <span v-if="trialEndsAt" class="trial-date">Ends on {{ trialEndsAt.toLocaleDateString() }}</span>
      </div>
      <div v-else class="guard-expired">
        <span class="expired-label">Trial Expired</span>
        <span>The trial period has ended. Activation is required to continue.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guard-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}

.guard-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 48px;
  max-width: 440px;
  width: 90%;
  text-align: center;
  color: #e2e8f0;
}

.guard-icon {
  color: #f59e0b;
  margin-bottom: 24px;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: #f1f5f9;
}

.guard-desc {
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 24px;
  font-size: 0.9rem;
}

.guard-trial,
.guard-expired {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 10px;
  font-size: 0.85rem;
}

.guard-trial {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.guard-expired {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.trial-label {
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.trial-days {
  font-size: 2rem;
  font-weight: 700;
  color: #f59e0b;
}

.trial-date {
  color: #a0aec0;
  font-size: 0.8rem;
}

.expired-label {
  font-weight: 600;
  color: #ef4444;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
</style>
