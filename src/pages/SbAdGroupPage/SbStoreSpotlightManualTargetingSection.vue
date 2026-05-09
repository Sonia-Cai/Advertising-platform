<template>
  <section id="section-sb-store-spotlight-manual-targeting" class="card">
    <div class="card-header">
      <div class="title-group">
        <h2>Manual Targeting</h2>
        <p>Targeting uses keywords and products to help your ads appear in search and detail pages.</p>
      </div>
    </div>

    <hr />

    <p class="section-label">Choose keyword or product targeting</p>

    <div class="options">
      <RadioCard v-model="form.storeSpotlightManualTargetType" value="keyword">
        <p class="option-title">Keyword targeting</p>
        <p class="option-desc">Choose keywords to help your products appear in shopper searches.</p>
      </RadioCard>

      <RadioCard v-model="form.storeSpotlightManualTargetType" value="product">
        <p class="option-title">Product targeting</p>
        <p class="option-desc">Choose specific products, categories, brands, or other product features to target your ads.</p>
      </RadioCard>
    </div>
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import RadioCard from '@/components/base/RadioCard.vue'

const { form } = storeToRefs(useSbStore())
</script>

<style scoped>
/* Align with SP AdGroupPage/sections/ManualTargetingSection.vue */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
}

.card-header {
  padding-bottom: 8px;
}

.title-group {
  flex: 1;
  min-width: 0;
}

.title-group h2 {
  margin: 0;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
}

.title-group p {
  margin: 4px 0 0;
  font-size: var(--text-base, 14px);
  color: var(--text-sub);
  line-height: 1.4;
}

hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 0 0 20px;
}

.section-label {
  margin: 0 0 12px;
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-title {
  margin: 0;
  font-size: var(--text-md, 15px);
  font-weight: 600;
  color: var(--text-main);
}

.option-desc {
  margin: 4px 0 0;
  font-size: var(--text-base, 14px);
  color: var(--text-sub);
  line-height: 1.55;
}
</style>
