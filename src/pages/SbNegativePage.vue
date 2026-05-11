<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper
        :steps="steps"
        :current-step="getStepNumber('/sb/negative')"
        :active-sub-item="activeSubItem"
      />

      <div class="content-wrapper">
        <h2 class="page-title">Negative（optional）</h2>
        <main class="main-content">

          <!-- Negative Keyword Section（与 SP 共用同一组件） -->
          <NegativeKeywordCard
            v-if="!hideNegativeKeyword"
            anchor-id="section-negative-keyword"
            :list="form.negativeKeywords"
            @update:list="form.negativeKeywords = $event"
          />

          <!-- Exclude Products Section（与 SP 共用同一组件） -->
          <ExcludeProductsCard
            v-if="!hideProductBrandExclusions"
            anchor-id="section-negative-product"
            :list="form.excludedProducts"
            @update:list="form.excludedProducts = $event"
          />

          <!-- Exclude Brands Section（与 SP 共用同一组件） -->
          <ExcludeBrandsCard
            v-if="!hideProductBrandExclusions"
            anchor-id="section-negative-brand"
            :list="form.excludedBrands"
            @update:list="form.excludedBrands = $event"
          />

        </main>
      </div>
    </div>
  </div>

  <BottomBar show-back @cancel="onCancel" @back="onBack" @next="onNext" />
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import NegativeKeywordCard from '@/components/negative/NegativeKeywordCard.vue'
import ExcludeProductsCard from '@/components/negative/ExcludeProductsCard.vue'
import ExcludeBrandsCard from '@/components/negative/ExcludeBrandsCard.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'

const router = useRouter()
const { steps, getStepNumber, getNextPath, getBackPath } = useSbFlowSteps()
const { form } = storeToRefs(useSbStore())

const hideProductBrandExclusions = computed(() => (
  (
    form.value.adFormat === 'collections'
    && (
      (
        form.value.goals === 'drive_page_visits'
        && (
          form.value.targetingAuto
          || form.value.storeSpotlightManualTargetType === 'keyword'
        )
      )
      || (
        form.value.goals === 'brand_impression_share'
      )
    )
  )
  || (
    form.value.adFormat === 'store_spotlight'
    && (
      form.value.goals === 'brand_impression_share'
      || (
        form.value.goals === 'drive_page_visits'
        && form.value.storeSpotlightManualTargetType === 'keyword'
      )
    )
  )
  || (
    form.value.adFormat === 'video'
    && (
      form.value.videoLandingType === 'product_detail'
      || form.value.videoLandingType === 'store'
    )
    && form.value.storeSpotlightManualTargetType === 'keyword'
  )
))

const hideNegativeKeyword = computed(() => (
  form.value.goals === 'drive_page_visits'
  && form.value.storeSpotlightManualTargetType === 'product'
  && (
    (
      form.value.adFormat === 'collections'
      && !form.value.targetingAuto
    )
    || form.value.adFormat === 'store_spotlight'
    || (
      form.value.adFormat === 'video'
      && (
        form.value.videoLandingType === 'product_detail'
        || form.value.videoLandingType === 'store'
      )
    )
  )
))

const negativeSubItems = computed(() => {
  const base = []
  if (!hideNegativeKeyword.value) {
    base.push({ label: 'Negative keyword', anchorId: 'section-negative-keyword' })
  }
  if (!hideProductBrandExclusions.value) {
    base.push(
      { label: 'Exclude products', anchorId: 'section-negative-product' },
      { label: 'Exclude brands', anchorId: 'section-negative-brand' }
    )
  }
  return base
})

const activeSubItem = ref('Negative keyword')

function setupObserver() {
  observer?.disconnect()

  const sectionEls = negativeSubItems.value
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

let observer = null
onMounted(() => {
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})

watch(negativeSubItems, () => {
  activeSubItem.value = negativeSubItems.value[0]?.label ?? ''
  nextTick(setupObserver)
})

function onCancel() { router.push('/') }
function onBack()   { router.push(getBackPath('/sb/negative')) }
function onNext()   { router.push(getNextPath('/sb/negative')) }
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
