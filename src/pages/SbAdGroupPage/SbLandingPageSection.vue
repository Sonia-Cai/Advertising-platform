<template>
  <!-- Store spotlight: landing card + manual targeting must be separate sections (distinct anchors / cards). -->
  <template v-if="form.adFormat === 'store_spotlight'">
    <section id="section-sb-landing-page" class="card card--landing-collapsible">
      <h2 class="landing-page-heading-row">
        <button
          type="button"
          class="landing-page-toggle"
          :aria-expanded="spotlightLandingOpen"
          aria-controls="sb-landing-page-panel"
          id="sb-landing-page-toggle"
          @click="spotlightLandingOpen = !spotlightLandingOpen"
        >
          <span
            class="landing-page-toggle__chevron"
            :class="{ 'landing-page-toggle__chevron--open': spotlightLandingOpen }"
            aria-hidden="true"
          >
            <svg
              class="landing-page-toggle__chevron-svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.49411 3.57712C6.64157 3.42964 6.83897 3.34281 7.04733 3.33379C7.25569 3.32476 7.45986 3.39419 7.61953 3.52837L7.67244 3.57712L13.5058 9.41045C13.6533 9.55791 13.7401 9.75532 13.7491 9.96368C13.7581 10.172 13.6887 10.3762 13.5545 10.5359L13.5058 10.5888L7.67244 16.4221C7.52051 16.5737 7.31596 16.6608 7.1014 16.6653C6.88684 16.6698 6.67882 16.5913 6.52066 16.4463C6.3625 16.3012 6.2664 16.1007 6.25237 15.8866C6.23835 15.6725 6.30747 15.4611 6.44536 15.2967L6.49411 15.2438L11.7374 9.99962L6.49411 4.75545C6.34663 4.60799 6.25981 4.41059 6.25078 4.20223C6.24176 3.99387 6.31119 3.7897 6.44536 3.63003L6.49411 3.57712Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span class="landing-page-card__title landing-page-toggle__label">Landing page</span>
        </button>
      </h2>
      <p v-if="!spotlightLandingOpen" class="landing-page-collapsed-note">Choose a Store：DREO</p>
      <Transition name="slide-landing">
        <div
          v-show="spotlightLandingOpen"
          id="sb-landing-page-panel"
          class="landing-page-collapsible-panel"
          role="region"
          aria-labelledby="sb-landing-page-toggle"
        >
          <div class="lp-option static">
            <span class="radio-dot checked"><span class="radio-dot-inner" /></span>
            <div class="lp-option-body">
              <p class="lp-option-title">Store on Amazon</p>
              <p class="lp-option-hint">(must have 4 or more pages, each with 1 or more unique products)</p>
            </div>
          </div>
          <div class="store-display">
            <label class="store-field-label">Choose a Store</label>
            <div class="store-name-box">DREO</div>
          </div>
        </div>
      </Transition>
    </section>
    <SbStoreSpotlightManualTargetingSection v-if="showStoreSpotlightManualTargetingInAdGroup" />
  </template>

  <section v-else-if="showStandardLandingPage" id="section-sb-landing-page" class="card">
    <h2 class="landing-page-card__title">Landing page</h2>

    <div class="tip-row">
        <span class="tip-icon">✦</span>
        <p class="tip-text">
          Ads using Brand Stores as Sponsored Brands video landing pages see an average of 68%
          higher Branded Search Rates compared to those using a Product Detail Page.
        </p>
      </div>

      <!-- Product detail page（置顶） -->
      <label class="radio-line" @click="selectedLandingType = 'product_detail'">
        <span class="radio-dot" :class="{ checked: selectedLandingType === 'product_detail' }">
          <span v-if="selectedLandingType === 'product_detail'" class="radio-dot-inner" />
        </span>
        <p class="lp-option-title">Product detail page</p>
      </label>

      <!-- Store on Amazon -->
      <label class="radio-line radio-gap" @click="selectedLandingType = 'store'">
        <span class="radio-dot" :class="{ checked: selectedLandingType === 'store' }">
          <span v-if="selectedLandingType === 'store'" class="radio-dot-inner" />
        </span>
        <div class="lp-option-body">
          <p class="lp-option-title">Store on Amazon</p>
          <p class="lp-option-hint">Video and Store byline link to Brand Store. Product link to product detail pages.</p>
        </div>
      </label>

      <Transition name="slide">
        <div v-if="selectedLandingType === 'store'" class="store-selects">
          <div class="store-field">
            <label class="store-field-label">Choose a Store</label>
            <div class="store-name-box">DREO</div>
          </div>
          <div class="store-field">
            <label class="store-field-label">Choose a page</label>
            <UiSelect
              v-model="selectedStorePage"
              size="lg"
              placeholder="Choose a page"
              :options="storePageOptions"
            />
          </div>
        </div>
      </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import UiSelect from '@/components/ui/select/Select.vue'
import SbStoreSpotlightManualTargetingSection from './SbStoreSpotlightManualTargetingSection.vue'
const { form } = storeToRefs(useSbStore())

/** Store spotlight：Landing page 卡片默认折叠 */
const spotlightLandingOpen = ref(false)

const showCollectionsManualLandingPage = computed(() => (
  (
    form.value.goals === 'drive_page_visits'
    || form.value.goals === 'brand_impression_share'
  )
  && form.value.adFormat === 'collections'
  && !form.value.targetingAuto
))

const showStandardLandingPage = computed(() => (
  form.value.adFormat === 'video' || showCollectionsManualLandingPage.value
))

const showStoreSpotlightManualTargetingInAdGroup = computed(() => (
  form.value.adFormat === 'store_spotlight'
  && form.value.goals !== 'drive_page_visits'
  && form.value.goals !== 'brand_impression_share'
))

const selectedLandingType = computed({
  get() {
    return form.value.adFormat === 'video'
      ? form.value.videoLandingType
      : form.value.landingPageType
  },
  set(value) {
    if (form.value.adFormat === 'video') {
      form.value.videoLandingType = value
    } else {
      form.value.landingPageType = value
    }
  }
})

const selectedStorePage = computed({
  get() {
    return form.value.adFormat === 'video'
      ? form.value.videoStorePage
      : form.value.landingStorePage
  },
  set(value) {
    if (form.value.adFormat === 'video') {
      form.value.videoStorePage = value
    } else {
      form.value.landingStorePage = value
    }
  }
})

const storePageOptions = [
  { value: 'home',       label: 'DREO Home' },
  { value: 'fans',       label: 'Tower Fans' },
  { value: 'heaters',    label: 'Space Heaters' },
  { value: 'purifiers',  label: 'Air Purifiers' },
  { value: 'coolers',    label: 'Air Coolers' },
]
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Landing page 标题色（设计 #0C1322，等价于 rgb(12, 19, 34) / rgba(12, 19, 34, 1)） */
.landing-page-card__title {
  margin: 0;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: #0c1322;
}

.landing-page-heading-row {
  margin: 0;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  line-height: 1.2;
}

.landing-page-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: #0c1322;
}

.landing-page-toggle:focus-visible {
  outline: 2px solid var(--primary, #3b82f6);
  outline-offset: 2px;
  border-radius: 4px;
}

.landing-page-toggle__chevron {
  display: inline-flex;
  flex-shrink: 0;
  color: #0c1322;
  line-height: 0;
  transition: transform 0.2s ease;
}

.landing-page-toggle__chevron-svg {
  display: block;
}

.landing-page-toggle__chevron--open {
  transform: rotate(90deg);
}

.landing-page-toggle__label {
  margin: 0;
}

.landing-page-collapsed-note {
  margin: 12px 0 0 28px;
  font-size: var(--text-base, 14px);
  color: var(--text-sub);
  line-height: 1.5;
}

.landing-page-collapsible-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.card--landing-collapsible {
  gap: 0;
}

/* Tip row */
.tip-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: var(--blue-50, #eff6ff);
  border-radius: var(--radius-md, 8px);
}

.tip-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--primary, #0ea5e9);
  margin-top: 1px;
}

.tip-text {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-main);
  line-height: 1.55;
}

/* Radio rows */
.radio-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.radio-gap {
  margin-top: 4px;
}

.lp-option.static {
  display: flex;
  align-items: flex-start;
  gap: 10px;
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
  transition: background 0.15s, border-color 0.15s;
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

.lp-option-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lp-option-title {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
}

.lp-option-hint {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  line-height: 1.5;
}

/* Store selects / display */
.store-display {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 26px;
}

.store-selects {
  display: flex;
  gap: 16px;
  padding-left: 26px;
  flex-wrap: wrap;
}

.store-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  max-width: 260px;
  flex: 1;
}

.store-field-label {
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.store-name-box {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  font-size: var(--text-base, 14px);
  color: var(--text-main);
  background: var(--gray-50, #f8fafc);
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

.slide-landing-enter-active,
.slide-landing-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-landing-enter-from,
.slide-landing-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
