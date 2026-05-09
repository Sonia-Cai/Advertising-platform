<template>
  <div class="collections-content">
    <!-- 1. Ad name（Automatic / Manual 共用） -->
    <section id="section-sb-ad-name" class="card">
      <h2>Ad name</h2>
      <div class="field" :class="{ 'has-error': errors.headline }">
        <div class="headline-wrap">
          <UiInput
            v-model="form.headline"
            size="lg"
            placeholder="Enter Ad name"
            :maxlength="50"
            @input="errors.headline = ''"
          />
        </div>
        <p v-if="errors.headline" class="error-msg">{{ errors.headline }}</p>
      </div>
    </section>

    <section v-if="showManualAdTitle" id="section-sb-ad-title" class="card">
      <h2>Ad title</h2>
      <div class="ad-title-options">
        <label class="ad-title-radio-line" @click="form.adTitleMode = 'auto_generate'">
          <span class="radio-dot" :class="{ checked: form.adTitleMode === 'auto_generate' }">
            <span v-if="form.adTitleMode === 'auto_generate'" class="radio-dot-inner" />
          </span>
          <p class="option-title">Let us generate the best title for each shopper</p>
        </label>
        <label class="ad-title-radio-line" @click="form.adTitleMode = 'standard'">
          <span class="radio-dot" :class="{ checked: form.adTitleMode === 'standard' }">
            <span v-if="form.adTitleMode === 'standard'" class="radio-dot-inner" />
          </span>
          <p class="option-title">Choose a standard title</p>
        </label>
        <div v-if="form.adTitleMode === 'standard'" class="standard-title-select">
          <UiSelect
            v-model="form.adStandardTitle"
            size="lg"
            placeholder="Choose a standard title"
            :options="standardTitleOptions"
          />
        </div>
        <label class="ad-title-radio-line" @click="form.adTitleMode = 'custom'">
          <span class="radio-dot" :class="{ checked: form.adTitleMode === 'custom' }">
            <span v-if="form.adTitleMode === 'custom'" class="radio-dot-inner" />
          </span>
          <p class="option-title">Write your own title</p>
        </label>
        <div
          v-if="form.adTitleMode === 'custom'"
          class="custom-title-field"
          :class="{ 'has-error': errors.adCustomTitle }"
        >
          <div class="custom-title-row">
            <UiInput
              v-model="form.adCustomTitle"
              size="lg"
              placeholder="Add a title"
              :maxlength="32"
              @input="errors.adCustomTitle = ''"
            />
            <span class="char-count">{{ (form.adCustomTitle || '').length }}/32</span>
          </div>
          <p v-if="errors.adCustomTitle" class="error-msg">{{ errors.adCustomTitle }}</p>
        </div>
      </div>
    </section>

    <!-- ── Automatic ── -->
    <template v-if="form.targetingAuto">
      <SbKeywordTargetingSection />

      <!-- 3. Product exclusions (optional) -->
      <section id="section-sb-product-exclusions" class="card">
        <h2>Product exclusions <span class="optional-tag">(optional)</span></h2>
        <p class="section-desc">Exclude specific products from your automatic targeting to refine ad delivery.</p>
        <ProductSelector v-model="form.productCollections" :max="10" label="Add" picker-title="Select products to exclude from this ad group" />
      </section>

    </template>

    <!-- ── Manual ── -->
    <template v-else>
      <section id="section-sb-products" class="card">
        <h2>Products</h2>
        <p class="section-desc">Add 3-10 products to feature in your ad. Drag cards to change the display order.</p>
        <ProductSelector
          v-model="form.products"
          picker-title="Select products to feature in your ad"
          :min="3"
          :max="10"
          :draggable="true"
          label="Add"
          :error="errors.products"
          @update:model-value="errors.products = ''"
        />
        <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
      </section>

      <SbStoreSpotlightManualTargetingSection v-if="showManualTargetingInAd" />

      <SbKeywordTargetingSection v-if="showInlineKeywordTargeting" />

      <section
        v-if="showInlineProductTargeting"
        id="section-sb-ad-product-targeting"
        class="product-targeting-panels"
      >
        <ProductTargetingPanels
          :form="form"
          product-title="Product Targeting-Products"
          category-title="Product Targeting-Categories"
        />
      </section>
    </template>

  </div>
</template>

<script setup>
import { computed, reactive, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import UiInput from '@/components/ui/input/Input.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import ProductSelector from './ProductSelector.vue'
import SbKeywordTargetingSection from '../shared/SbKeywordTargetingSection.vue'
import SbStoreSpotlightManualTargetingSection from '../../SbAdGroupPage/SbStoreSpotlightManualTargetingSection.vue'
import ProductTargetingPanels from '@/components/product-targeting/ProductTargetingPanels.vue'

const { form } = storeToRefs(useSbStore())

const showManualAdTitle = computed(() => (
  (
    form.value.goals === 'drive_page_visits'
    || form.value.goals === 'brand_impression_share'
  )
  && !form.value.targetingAuto
))

const showManualTargetingInAd = computed(() => (
  form.value.goals === 'drive_page_visits'
  && !form.value.targetingAuto
))

const showSeparateKeywordTargetingStep = computed(() => (
  !form.value.targetingAuto
  && (
    (
      form.value.goals === 'drive_page_visits'
      && form.value.storeSpotlightManualTargetType === 'keyword'
    )
    || form.value.goals === 'brand_impression_share'
  )
))

const showSeparateProductTargetingStep = computed(() => (
  form.value.goals === 'drive_page_visits'
  && !form.value.targetingAuto
  && form.value.storeSpotlightManualTargetType === 'product'
))

const showInlineKeywordTargeting = computed(() => (
  form.value.storeSpotlightManualTargetType === 'keyword'
  && !showSeparateKeywordTargetingStep.value
))

const showInlineProductTargeting = computed(() => (
  form.value.storeSpotlightManualTargetType === 'product'
  && form.value.goals !== 'brand_impression_share'
  && !showSeparateProductTargetingStep.value
))

const standardTitleOptions = [
  { value: 'browse_collection', label: 'Browse the collection' },
  { value: 'explore_collection', label: 'Explore the collection' },
  { value: 'discover_collection', label: 'Discover the collection' },
]

const errors = reactive({ headline: '', adCustomTitle: '', products: '' })

// ── Validation ──
function validate() {
  const errorItems = []
  if (!form.value.headline?.trim()) {
    errors.headline = 'Headline is required.'
    errorItems.push({ subItem: 'Ad name', label: 'Headline', anchorId: 'section-sb-ad-name' })
  } else {
    errors.headline = ''
  }
  if (showManualAdTitle.value && form.value.adTitleMode === 'custom' && !form.value.adCustomTitle?.trim()) {
    errors.adCustomTitle = 'Ad title is required.'
    errorItems.push({ subItem: 'Ad title', label: 'Ad title', anchorId: 'section-sb-ad-title' })
  } else {
    errors.adCustomTitle = ''
  }
  if (!form.value.targetingAuto && form.value.products.length < 3) {
    errors.products = form.value.products.length === 0
      ? 'Please add at least 3 products.'
      : `Please add ${3 - form.value.products.length} more product${3 - form.value.products.length > 1 ? 's' : ''} (minimum 3 required).`
    errorItems.push({ subItem: 'Products', label: 'Products', anchorId: 'section-sb-products' })
  } else {
    errors.products = ''
  }
  const ok = errorItems.length === 0
  if (!ok) {
    nextTick(() => {
      const el = document.getElementById(errorItems[0].anchorId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
  return { ok, errorItems }
}

defineExpose({ validate })
</script>

<style scoped>
.collections-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
}

h2 {
  margin: 0 0 16px;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
}

.optional-tag {
  font-size: var(--text-base, 14px);
  font-weight: 400;
  color: var(--text-sub);
}

.section-desc {
  margin: -8px 0 16px;
  font-size: var(--text-base, 14px);
  color: var(--text-sub);
}

.ad-title-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ad-title-radio-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.radio-dot {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background 0.15s;
}

.radio-dot.checked {
  border-color: var(--primary);
}

.radio-dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
}

.standard-title-select {
  max-width: 360px;
  margin-left: 26px;
}

.custom-title-field {
  max-width: 500px;
  margin-left: 26px;
}

.custom-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-title-row :deep(.ui-input) {
  flex: 1;
}

.option-title {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
  line-height: 1.5;
}

.required { color: var(--color-danger); font-size: var(--text-sm, 13px); }

.field { margin-bottom: 0; }

.headline-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 500px;
}

.char-count {
  font-size: var(--text-sm, 13px);
  color: var(--text-hint);
  white-space: nowrap;
}

.has-error :deep(input) { border-color: var(--color-danger) !important; }

.error-msg {
  margin: 6px 0 0;
  font-size: var(--text-sm, 13px);
  color: var(--color-danger);
}

.product-targeting-panels {
  display: block;
}

.product-targeting-panels :deep(.pt-panels-root) {
  gap: 16px;
}
</style>
