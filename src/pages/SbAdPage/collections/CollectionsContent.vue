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

      <SbKeywordTargetingSection
        v-if="form.storeSpotlightManualTargetType === 'keyword'"
      />

      <section
        v-else
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
import { reactive, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import UiInput from '@/components/ui/input/Input.vue'
import ProductSelector from './ProductSelector.vue'
import SbKeywordTargetingSection from '../shared/SbKeywordTargetingSection.vue'
import ProductTargetingPanels from '@/components/product-targeting/ProductTargetingPanels.vue'

const { form } = storeToRefs(useSbStore())

const errors = reactive({ headline: '', products: '' })

// ── Validation ──
function validate() {
  const errorItems = []
  if (!form.value.headline?.trim()) {
    errors.headline = 'Headline is required.'
    errorItems.push({ subItem: 'Ad name', label: 'Headline', anchorId: 'section-sb-ad-name' })
  } else {
    errors.headline = ''
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
