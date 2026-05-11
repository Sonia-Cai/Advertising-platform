<template>
  <section id="section-sb-placements" class="card">
    <div class="card-header">
      <h2>Bid adjustment</h2>
    </div>

    <!-- Placements -->
    <div v-if="!hidePlacements" id="section-sb-bid-adjustment" class="sub-section">
      <div class="sub-label-row">
        <span class="sub-label">Placements</span>
        <div class="tooltip-wrap">
          <img :src="iconHelpCircle" alt="" width="16" height="16" class="help-icon-trigger" />
          <div class="tooltip-bubble">
            Increase bids by a percentage for specific placements. These adjustments are applied on
            top of your base bid.
          </div>
        </div>
      </div>
      <div class="placements-list">
        <div class="placement-field" v-for="p in placements" :key="p.key">
          <label>{{ p.label }}</label>
          <div class="placement-input-row">
            <div class="placement-input-wrap">
              <InlineNumberInput v-model="form[p.key]" suffix="%" size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audiences -->
    <div v-if="!hideAudiences" class="sub-section">
      <div class="sub-label-row">
        <span class="sub-label">Audiences</span>
        <div class="tooltip-wrap">
          <img :src="iconHelpCircle" alt="" width="16" height="16" class="help-icon-trigger" />
          <div class="tooltip-bubble">
            Increase bids for specific audience segments to reach shoppers who are more likely to
            engage with your brand.
          </div>
        </div>
      </div>

      <div class="audience-options">
        <label class="radio-line" @click="form.audienceMode = 'increase_amazon_built'">
          <span class="radio-dot" :class="{ checked: form.audienceMode === 'increase_amazon_built' }">
            <span v-if="form.audienceMode === 'increase_amazon_built'" class="radio-dot-inner" />
          </span>
          <span>Increase bids for audiences built by Amazon</span>
        </label>

        <label class="radio-line" @click="form.audienceMode = 'increase_amc_custom'">
          <span class="radio-dot" :class="{ checked: form.audienceMode === 'increase_amc_custom' }">
            <span v-if="form.audienceMode === 'increase_amc_custom'" class="radio-dot-inner" />
          </span>
          <span>Increase bids on a custom audience created in Amazon Marketing Cloud (AMC)</span>
        </label>

        <label class="radio-line" @click="form.audienceMode = 'don_t_increase'">
          <span class="radio-dot" :class="{ checked: form.audienceMode === 'don_t_increase' }">
            <span v-if="form.audienceMode === 'don_t_increase'" class="radio-dot-inner" />
          </span>
          <span>Don't increase bids for an audience</span>
        </label>
      </div>

      <Transition name="slide">
        <div v-if="form.audienceMode !== 'don_t_increase'" class="audience-config">
          <p class="audience-config-label">Audience</p>
          <div class="placement-input-row">
            <div class="placement-input-wrap">
              <UiSelect
                v-model="form.audienceId"
                size="lg"
                placeholder="Choose an audience"
                :options="currentAudienceOptions"
                searchable
                search-placeholder="Search audiences…"
              />
            </div>
            <div class="audience-pct-wrap">
              <InlineNumberInput v-model="form.audiencePct" suffix="%" size="lg" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import InlineNumberInput from '@/components/base/InlineNumberInput.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import iconHelpCircle from '@/assets/icon-help-circle.svg'

const { form } = storeToRefs(useSbStore())

const placements = [
  { key: 'bidTop',  label: 'Top of search (first page)' },
  { key: 'bidRest', label: 'Rest of search' }
]

const hideAudiences = computed(() => (
  form.value.goals === 'drive_page_visits'
  && form.value.siteType === 'amazon_business'
  && (
    form.value.adFormat === 'collections'
    || form.value.adFormat === 'store_spotlight'
  )
))

const hidePlacements = computed(() => (
  (
    form.value.goals === 'brand_impression_share'
    && form.value.siteType === 'amazon'
    && (
      form.value.adFormat === 'collections'
      || form.value.adFormat === 'store_spotlight'
      || form.value.adFormat === 'video'
    )
  )
  || (
    form.value.goals === 'drive_page_visits'
    && form.value.siteType === 'amazon'
    && form.value.adFormat === 'video'
  )
))

watch(() => form.value.audienceMode, () => {
  form.value.audienceId = ''
  form.value.audiencePct = 0
})

const amazonAudienceOptions = [
  { value: 'amazon_interest',    label: 'Amazon Interest Audiences' },
  { value: 'amazon_lifestyle',   label: 'Amazon Lifestyle Segments' },
  { value: 'amazon_inmarket',    label: 'In-Market Audiences' },
  { value: 'amazon_remarketing', label: 'Remarketing Audiences' },
]

const amcAudienceOptions = [
  { value: 'amc_1', label: 'AMC AMC Test_Audience_Cart_Abandon_20251222_6 - 403316359709171985' },
  { value: 'amc_2', label: 'AMC DREO-DSP 1 DPV/Exclude Purchase-DSP-L14D-Rule based - 376373797466773890' },
  { value: 'amc_3', label: 'AMC DREO-High Value Audiences/Top30%-NA&AD-L30D - BalancedLookalike - 404953712003503637' },
  { value: 'amc_4', label: 'AMC Household Fan-DSP 1~3 DPV/Exclude Purchase or SA clicks-DSP-L14D-Rule based - 393375133049604205' },
  { value: 'amc_5', label: 'AMC AMC Test_Audience_Cart_Abandon_20251222_4 - 395120201479263450' },
  { value: 'amc_6', label: 'AMC Tower Fan_DSP Campaign Impression_Min3_DSP_L30D_Rule based - 386547894924918884' },
]

const currentAudienceOptions = computed(() =>
  form.value.audienceMode === 'increase_amazon_built'
    ? amazonAudienceOptions
    : amcAudienceOptions
)
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
}

.sub-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.sub-section:last-child {
  margin-bottom: 0;
}

.sub-label-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 0;
  width: 100%;
}

.sub-label {
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
}

.placements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.placement-field {
  width: 100%;
  max-width: 480px;
}

.placement-input-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.placement-input-wrap {
  flex: 1;
  min-width: 140px;
  max-width: 400px;
}

.placement-field label {
  display: block;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-main);
  white-space: nowrap;
}

.audience-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: var(--text-base, 14px);
  color: var(--text-main);
  line-height: 1.5;
  user-select: none;
}

.radio-dot {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.radio-dot.checked {
  background: var(--primary);
  border-color: var(--primary);
}

.radio-dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.audience-config {
  margin-top: 4px;
  padding: 16px;
  border-radius: var(--radius-md, 8px);
  background: var(--gray-50, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audience-config-label {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.audience-pct-wrap {
  width: 110px;
  flex-shrink: 0;
}

.tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.help-icon-trigger {
  display: block;
  cursor: default;
}

.tooltip-bubble {
  display: none;
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: #1c1f23;
  color: #fff;
  font-size: var(--text-sm, 13px);
  font-weight: 400;
  line-height: 1.6;
  padding: 10px 14px;
  border-radius: var(--radius-md, 6px);
  width: 300px;
  z-index: 999;
  box-shadow: var(--shadow-md);
  pointer-events: none;
}

.tooltip-bubble::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1c1f23;
  border-left: none;
}

.tooltip-wrap:hover .tooltip-bubble {
  display: block;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
