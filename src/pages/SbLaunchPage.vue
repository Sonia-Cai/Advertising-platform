<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper :steps="steps" :current-step="launched ? 6 : getStepNumber('/sb/launch')" />

      <div class="content-wrapper">
        <h2 class="page-title">Launch campaign</h2>

        <main class="main-content">

          <!-- Success Banner -->
          <Transition name="fade">
            <div v-if="launched" class="success-banner">
              <div class="success-icon">
                <div class="check-circle">
                  <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                    <polyline points="10,23 18,32 34,14" stroke="#fff" stroke-width="3.5"
                      stroke-linecap="round" stroke-linejoin="round" class="check-path" />
                  </svg>
                </div>
              </div>
              <div class="success-text">
                <p class="success-title">发布成功！</p>
                <p class="success-sub">Your Sponsored Brands campaign has been submitted for review.</p>
              </div>
            </div>
          </Transition>

          <!-- Campaign Plan Card -->
          <div class="review-card">
            <div class="review-card__head">
              <span class="review-card__step">1  Campaign Plan</span>
              <button v-if="!launched" class="review-card__edit" @click="router.push('/sb/campaign')">Edit</button>
            </div>
            <div class="review-card__body">
              <dl class="kv-grid">
                <div class="kv-item">
                  <dt>Campaign name</dt>
                  <dd>{{ form.campaignName || '—' }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Brand</dt>
                  <dd>{{ form.brandName || '—' }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Goals</dt>
                  <dd>{{ goalsLabel }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Daily budget</dt>
                  <dd>${{ Number(form.dailyBudget).toFixed(2) }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Schedule</dt>
                  <dd>{{ form.startTime || '—' }} ~ {{ form.endTime || 'No end date' }}</dd>
                </div>
                <div v-if="form.portfolio" class="kv-item">
                  <dt>Portfolio</dt>
                  <dd>{{ form.portfolio }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Ad Group Card -->
          <div class="review-card">
            <div class="review-card__head">
              <span class="review-card__step">2  Ad Group</span>
              <button v-if="!launched" class="review-card__edit" @click="router.push('/sb/ad-group')">Edit</button>
            </div>
            <div class="review-card__body">
              <dl class="kv-grid">
                <div class="kv-item">
                  <dt>Ad group name</dt>
                  <dd>{{ form.adGroupName || '—' }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Ad format</dt>
                  <dd>{{ adFormatLabel }}</dd>
                </div>
                <div v-if="form.adFormat === 'collections'" class="kv-item">
                  <dt>Targeting</dt>
                  <dd>{{ form.targetingAuto ? 'Automatic' : 'Manual' }}</dd>
                </div>
                <div v-if="form.adFormat === 'store_spotlight'" class="kv-item">
                  <dt>Manual targeting</dt>
                  <dd>{{ storeSpotlightManualTargetingLabel }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Ad Card -->
          <div class="review-card">
            <div class="review-card__head">
              <span class="review-card__step">3  Ad</span>
              <button v-if="!launched" class="review-card__edit" @click="router.push('/sb/ad')">Edit</button>
            </div>
            <div class="review-card__body">
              <dl class="kv-grid">
                <div v-if="form.adFormat === 'collections'" class="kv-item">
                  <dt>Headline</dt>
                  <dd>{{ form.headline || '—' }}</dd>
                </div>
                <div v-if="form.adFormat === 'store_spotlight'" class="kv-item">
                  <dt>Ad name</dt>
                  <dd>{{ form.headline || '—' }}</dd>
                </div>
                <div class="kv-item">
                  <dt>Landing page</dt>
                  <dd>{{ landingPageLabel }}</dd>
                </div>
                <div v-if="form.adFormat !== 'store_spotlight'" class="kv-item">
                  <dt>Products</dt>
                  <dd>{{ form.products.length }} selected</dd>
                </div>
                <div
                  v-else-if="form.storeSpotlightManualTargetType === 'product'"
                  class="kv-item"
                >
                  <dt>Product targets</dt>
                  <dd>{{ sbProductTargetProductCount }} products, {{ sbProductTargetCategoryCount }} categories</dd>
                </div>
                <div v-if="form.adFormat === 'collections' && form.targetingAuto" class="kv-item">
                  <dt>Keywords</dt>
                  <dd>{{ form.keywords.length }} added</dd>
                </div>
                <div
                  v-if="form.adFormat === 'store_spotlight' && form.storeSpotlightManualTargetType === 'keyword'"
                  class="kv-item"
                >
                  <dt>Keywords</dt>
                  <dd>{{ form.keywords.length }} added</dd>
                </div>
                <div v-if="form.adFormat === 'video'" class="kv-item">
                  <dt>Video</dt>
                  <dd>{{ form.videoFile ? 'Uploaded' : 'Not uploaded' }}</dd>
                </div>
                <div v-if="form.adFormat === 'store_spotlight'" class="kv-item">
                  <dt>Store pages</dt>
                  <dd>{{ validStorePagesCount }} configured</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Negative Card -->
          <div class="review-card">
            <div class="review-card__head">
              <span class="review-card__step">4  Negative（optional）</span>
              <button v-if="!launched" class="review-card__edit" @click="router.push('/sb/negative')">Edit</button>
            </div>
            <div class="review-card__body">
              <dl class="kv-grid">
                <div v-if="!hideNegativeKeywordSummary" class="kv-item">
                  <dt>Negative keywords</dt>
                  <dd>{{ form.negativeKeywords.length }}</dd>
                </div>
                <div v-if="!hideNegativeProductBrandSummary" class="kv-item">
                  <dt>Excluded products</dt>
                  <dd>{{ form.excludedProducts.length }}</dd>
                </div>
                <div v-if="!hideNegativeProductBrandSummary" class="kv-item">
                  <dt>Excluded brands</dt>
                  <dd>{{ form.excludedBrands.length }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Back to list -->
          <div v-if="launched" class="back-to-list">
            <button class="back-to-list__btn" @click="router.push('/')">
              ← 返回广告活动列表
            </button>
          </div>

        </main>
      </div>
    </div>
  </div>

  <BottomBar
    v-if="!launched"
    next-label="Launch campaign"
    show-back
    :loading="submitting"
    @cancel="router.push('/')"
    @back="router.push(getBackPath('/sb/launch'))"
    @next="onSubmit"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'
import { useSbStore } from '@/stores/sb'

const router = useRouter()
const { steps, getStepNumber, getBackPath } = useSbFlowSteps()
const store = useSbStore()
const { form } = storeToRefs(store)

const submitting = ref(false)
const launched = ref(false)

const goalsLabel = computed(() => {
  const map = {
    drive_page_visits: 'Drive page visits',
    brand_impression_share: 'Grow brand impression share'
  }
  return map[form.value.goals] ?? form.value.goals
})

const adFormatLabel = computed(() => {
  const map = {
    collections: 'Product collection',
    video: 'Video',
    store_spotlight: 'Store spotlight'
  }
  return map[form.value.adFormat] ?? form.value.adFormat
})

const landingPageLabel = computed(() => {
  const map = {
    store: 'Store on Amazon',
    product_detail: 'Product detail page'
  }
  return map[form.value.landingPageType] ?? form.value.landingPageType
})

const validStorePagesCount = computed(() => {
  return form.value.storePages.filter(p => p.title?.trim() && p.url?.trim()).length
})

const storeSpotlightManualTargetingLabel = computed(() =>
  form.value.storeSpotlightManualTargetType === 'keyword'
    ? 'Keyword targeting'
    : 'Product targeting'
)

const hideNegativeProductBrandSummary = computed(() => (
  form.value.adFormat === 'collections'
  && (
    (
      form.value.goals === 'drive_page_visits'
      && (
        form.value.targetingAuto
        || form.value.storeSpotlightManualTargetType === 'keyword'
      )
    )
    || form.value.goals === 'brand_impression_share'
  )
))

const hideNegativeKeywordSummary = computed(() => (
  form.value.goals === 'drive_page_visits'
  && form.value.adFormat === 'collections'
  && !form.value.targetingAuto
  && form.value.storeSpotlightManualTargetType === 'product'
))

const sbProductTargetProductCount = computed(() =>
  form.value.productTargets.filter(t => t.kind === 'product').length
)
const sbProductTargetCategoryCount = computed(() =>
  form.value.productTargets.filter(t => t.kind === 'category').length
)

function onSubmit() {
  if (launched.value) {
    router.push('/')
    return
  }
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    launched.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 900)
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
}

.page-title {
  font-size: var(--text-3xl, 28px);
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-card);
  padding: 20px 24px;
}

.success-icon {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #34c759;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes pop-in {
  from { transform: scale(0.2); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.check-path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: draw-check 0.3s ease 0.38s forwards;
}

@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

.success-text { flex: 1; }

.success-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #15803d;
}

.success-sub {
  margin: 0;
  font-size: 14px;
  color: #166534;
}

.review-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.review-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: #fafbfc;
}

.review-card__step {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.01em;
}

.review-card__edit {
  background: none;
  border: none;
  color: #1876ff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.review-card__edit:hover { opacity: 0.75; }

.review-card__body {
  padding: 20px 24px;
}

.kv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
  margin: 0;
}

.kv-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kv-item dt {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.kv-item dd {
  margin: 0;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
  word-break: break-word;
}

.back-to-list {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 16px;
}

.back-to-list__btn {
  background: none;
  border: none;
  color: #1876ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  font-family: inherit;
  border-radius: var(--radius-sm);
  transition: opacity 0.15s;
}

.back-to-list__btn:hover {
  opacity: 0.75;
}

.fade-enter-active { transition: opacity 0.4s, transform 0.4s; }
.fade-enter-from   { opacity: 0; transform: translateY(-8px); }
</style>
