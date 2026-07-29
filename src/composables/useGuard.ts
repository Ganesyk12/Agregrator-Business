import { ref, computed, onMounted } from 'vue'

interface GuardData {
  deploy_at: string
  activate_period: number
  activated_at: string | null
  user_activate: number | null
}

const guardData = ref<GuardData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
let fetched = false

export function useGuard() {
  async function fetchGuard() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/guard')
      if (!res.ok) throw new Error('Failed to fetch activation status')
      const json = await res.json()
      guardData.value = json.data
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  const isActivated = computed(() => !!guardData.value?.activated_at)

  const trialEndsAt = computed(() => {
    if (!guardData.value) return null
    const deploy = new Date(guardData.value.deploy_at)
    return new Date(deploy.getTime() + guardData.value.activate_period * 24 * 60 * 60 * 1000)
  })

  const isTrialExpired = computed(() => {
    if (isActivated.value || !trialEndsAt.value) return false
    return new Date() > trialEndsAt.value
  })

  const isBlocked = computed(() => {
    return !isActivated.value && isTrialExpired.value
  })

  const daysRemaining = computed(() => {
    if (isActivated.value || !trialEndsAt.value) return 0
    const diff = trialEndsAt.value.getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  onMounted(() => {
    if (!fetched) {
      fetched = true
      fetchGuard()
    }
  })

  return {
    guardData,
    loading,
    error,
    isActivated,
    isTrialExpired,
    isBlocked,
    daysRemaining,
    trialEndsAt,
    fetchGuard,
  }
}
