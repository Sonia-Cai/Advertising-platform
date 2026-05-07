<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper
        :steps="steps"
        :current-step="getStepNumber('/sb/ad-group')"
        :active-sub-item="activeSubItem"
        :error-sub-items="errorSubItems"
      />

      <div class="content-wrapper">
        <h2 class="page-title">Ad Group</h2>
        <main class="main-content">
          <SbAdGroupNameSection ref="adGroupNameRef" />
          <SbAdFormatSection />
          <SbTargetingSection v-if="form.adFormat === 'collections'" />
          <SbStoreSpotlightManualTargetingSection
            v-if="form.adFormat === 'collections' && !form.targetingAuto"
          />
          <SbLandingPageSection v-if="form.adFormat === 'store_spotlight' || form.adFormat === 'video'" />
        </main>
      </div>
    </div>
  </div>

  <BottomBar show-back @cancel="onCancel" @back="onBack" @next="onNext" />
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSbStore } from '@/stores/sb'
import { storeToRefs } from 'pinia'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import SbAdGroupNameSection from './SbAdGroupNameSection.vue'
import SbAdFormatSection from './SbAdFormatSection.vue'
import SbTargetingSection from './SbTargetingSection.vue'
import SbLandingPageSection from './SbLandingPageSection.vue'
import SbStoreSpotlightManualTargetingSection from './SbStoreSpotlightManualTargetingSection.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'

const router = useRouter()
const store = useSbStore()
const { form } = storeToRefs(store)
const { steps, getStepNumber, getNextPath, getBackPath } = useSbFlowSteps()

const adGroupNameRef = ref(null)
const hasTriedToSubmit = ref(false)

const adGroupHasError = computed(() => {
  const n = form.value.adGroupName?.trim() ?? ''
  return !n || n.length > 100
})

const errorSubItems = computed(() => {
  if (!hasTriedToSubmit.value) return []
  const errs = []
  if (adGroupHasError.value) errs.push('Ad group name')
  return errs
})

const subItems = computed(() => {
  const base = [
    { label: 'Ad group name', anchorId: 'section-sb-ad-group-name' },
    { label: 'Ad format',     anchorId: 'section-sb-ad-format' },
  ]
  if (form.value.adFormat === 'collections') {
    base.push({ label: 'Collection type', anchorId: 'section-sb-collection-type' })
    if (!form.value.targetingAuto) {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
  } else if (form.value.adFormat === 'store_spotlight' || form.value.adFormat === 'video') {
    base.push({ label: 'Landing page', anchorId: 'section-sb-landing-page' })
    if (form.value.adFormat === 'store_spotlight') {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
  }
  return base
})

const activeSubItem = ref('Ad group name')

let observer = null
function setupObserver() {
  observer?.disconnect()
  const sectionEls = subItems.value
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
}

onMounted(() => {
  setupObserver()
})

watch(
  () => subItems.value.map((s) => s.anchorId).join('|'),
  async () => {
    await nextTick()
    setupObserver()
  }
)

onUnmounted(() => {
  if (observer) observer.disconnect()
})

function onCancel() { router.push('/') }
function onBack()   { router.push(getBackPath('/sb/ad-group')) }

function onNext() {
  const r1 = adGroupNameRef.value?.validate() ?? { ok: true, errorItems: [] }

  if (!r1.ok) {
    hasTriedToSubmit.value = true
    const firstId = r1.errorItems[0]?.anchorId
    const el = document.getElementById(firstId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  hasTriedToSubmit.value = false
  router.push(getNextPath('/sb/ad-group'))
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
