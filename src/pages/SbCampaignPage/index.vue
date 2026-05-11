<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper
        :steps="steps"
        :current-step="getStepNumber('/sb/campaign')"
        :active-sub-item="activeSubItem"
        :error-sub-items="errorSubItems"
      />

      <div class="content-wrapper">
        <h2 class="page-title">Campaign Plan</h2>
        <main class="main-content">
          <SbSettingsSection ref="settingsRef" />
          <SbGoalsSection />
          <SbSitesSection />
        </main>
      </div>
    </div>
  </div>

  <BottomBar @cancel="onCancel" @next="onNext" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSbStore } from '@/stores/sb'
import { storeToRefs } from 'pinia'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import SbSettingsSection from './SbSettingsSection.vue'
import SbGoalsSection from './SbGoalsSection.vue'
import SbSitesSection from './SbSitesSection.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'

const router = useRouter()
const store = useSbStore()
const { form } = storeToRefs(store)
const { steps, getStepNumber, getNextPath } = useSbFlowSteps()

const settingsRef = ref(null)
const hasTriedToSubmit = ref(false)

const settingsHasError = computed(() => {
  const f = form.value
  if (!f.campaignName?.trim()) return true
  const budgetVal = f.budgetType === 'lifetime' ? f.lifetimeBudget : f.dailyBudget
  if (!budgetVal || Number(budgetVal) <= 0) return true
  if (!f.startTime) return true
  if (f.scheduleType === 'range') {
    if (!f.endTime) return true
    if (new Date(f.endTime) <= new Date(f.startTime)) return true
  }
  return false
})

const errorSubItems = computed(() =>
  hasTriedToSubmit.value && settingsHasError.value ? ['Settings'] : []
)

const subItems = [
  { label: 'Settings',       anchorId: 'section-sb-settings' },
  { label: 'Goals',          anchorId: 'section-sb-goals' },
  { label: 'Sites',          anchorId: 'section-sb-sites' }
]

const activeSubItem = ref('Settings')

let observer = null
onMounted(() => {
  const sectionEls = subItems
    .map(s => ({ label: s.label, el: document.getElementById(s.anchorId) }))
    .filter(s => s.el)

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const matched = sectionEls.find(s => s.el === entry.target)
          if (matched) activeSubItem.value = matched.label
        }
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  )
  sectionEls.forEach(s => observer.observe(s.el))
})

onUnmounted(() => {
  observer?.disconnect()
})

function onCancel() {
  store.reset()
  router.push('/')
}

function onNext() {
  const result = settingsRef.value?.validate() ?? { ok: true, errorItems: [] }

  if (!result.ok) {
    hasTriedToSubmit.value = true
    return
  }

  hasTriedToSubmit.value = false
  router.push(getNextPath('/sb/campaign'))
}
</script>

<style scoped>
.page-layout {
  display: flex;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height, 60px));
  width: 100%;
}

.page-center {
  display: flex;
  align-items: flex-start;
  gap: var(--sidebar-gap, 40px);
  width: var(--content-width, 80vw);
  max-width: 100%;
  box-sizing: border-box;
  padding: 40px 0 0;
}

.content-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: var(--text-3xl, 28px);
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 20px;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
