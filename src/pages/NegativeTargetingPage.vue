<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper
        :steps="steps"
        :current-step="getStepNumber('/negative-targeting')"
        :active-sub-item="activeSubItem"
      />

      <div class="content-wrapper">
        <h2 class="page-title">Negative（optional）</h2>
        <main class="main-content">

          <!-- ── Negative Keyword（与 SB 共用同一组件） ── -->
          <NegativeKeywordCard
            anchor-id="section-negative-keyword"
            :list="form.negativeKeywords"
            @update:list="form.negativeKeywords = $event"
          />

          <!-- ── Exclude Products（与 SB 共用同一组件） ── -->
          <ExcludeProductsCard
            anchor-id="section-negative-product"
            :list="form.excludedProducts"
            @update:list="form.excludedProducts = $event"
          />

          <!-- ── Exclude Brands（与 SB 共用同一组件） ── -->
          <ExcludeBrandsCard
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCampaignStore } from '@/stores/campaign'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import NegativeKeywordCard from '@/components/negative/NegativeKeywordCard.vue'
import ExcludeProductsCard from '@/components/negative/ExcludeProductsCard.vue'
import ExcludeBrandsCard from '@/components/negative/ExcludeBrandsCard.vue'
import { useFlowSteps } from '@/composables/useFlowSteps'

const router = useRouter()
const { steps, getStepNumber, getNextPath, getBackPath } = useFlowSteps()
const { form } = storeToRefs(useCampaignStore())

/** 与 useFlowSteps negativeSubItems 的 label / anchorId 一致，供侧栏子项高亮 */
const negativeStepSubItems = [
  { label: 'Negative keyword', anchorId: 'section-negative-keyword' },
  { label: 'Exclude products', anchorId: 'section-negative-product' },
  { label: 'Exclude brands', anchorId: 'section-negative-brand' }
]

const activeSubItem = ref('Negative keyword')

let sectionObserver = null
onMounted(() => {
  const sectionEls = negativeStepSubItems
    .map((s) => ({ label: s.label, el: document.getElementById(s.anchorId) }))
    .filter((s) => s.el)

  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const matched = sectionEls.find((s) => s.el === entry.target)
          if (matched) activeSubItem.value = matched.label
        }
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  )
  sectionEls.forEach((s) => sectionObserver.observe(s.el))
})

onUnmounted(() => {
  sectionObserver?.disconnect()
})

function onCancel() { router.push('/') }
function onBack()   { router.push(getBackPath('/negative-targeting')) }
function onNext()   { router.push(getNextPath('/negative-targeting')) }
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
