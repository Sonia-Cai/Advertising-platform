<template>
  <div class="store-spotlight-outer">

    <!-- Ad name — full width, no preview on the side -->
    <section id="section-sb-ss-ad-name" class="card">
      <h2>Ad name</h2>
      <div class="field" :class="{ 'has-error': errors.adName }">
        <UiInput
          v-model="form.headline"
          size="lg"
          placeholder="Enter Ad name"
          :maxlength="50"
          @input="errors.adName = ''"
        />
        <p v-if="errors.adName" class="error-msg">{{ errors.adName }}</p>
      </div>
    </section>

    <slot name="after-ad-name" />

    <!-- Two-column area: left (Headline + Store pages + Brand assets) + right (Preview) -->
    <div class="store-spotlight-layout">

      <!-- Left column -->
      <div class="store-spotlight-content">
        <template v-if="props.hideStoreAssetSections">
          <slot name="store-asset-content" />
        </template>

        <!-- 2. Headline -->
        <section v-else id="section-sb-ss-headline" class="card">
          <h2>Headline</h2>
          <div class="field" :class="{ 'has-error': errors.headline }">
            <div class="headline-row">
              <UiInput
                v-model="ssHeadline"
                size="lg"
                placeholder="Enter headline (fewer than 50 characters, capitalize first letter)"
                :maxlength="50"
                @input="errors.headline = ''"
              />
              <button type="button" class="copy-btn">Copy library</button>
            </div>
            <p v-if="errors.headline" class="error-msg">{{ errors.headline }}</p>
          </div>
          <div class="optimize-row">
            <Switch v-model="optimizeHeadline" />
            <span class="optimize-label">Optimize your headline</span>
          </div>
          <p class="optimize-desc">
            To help improve performance while your campaign is live, let Amazon Ads enhance or generate new headlines to match customer intent.
            <a href="#" class="learn-link">learn more</a>
          </p>
        </section>

        <!-- 3. Brand Store Pages -->
        <section v-if="!props.hideStoreAssetSections && !props.hideStorePagesSection" id="section-sb-ss-store-pages" class="card">
          <h2>Brand store pages</h2>
          <p class="section-desc">3 subcategories from your Brand Store, plus one image that best represents each subcategory.</p>

          <Draggable
            :list="storePages"
            item-key="id"
            handle=".drag-handle"
            animation="200"
            class="pages-list"
          >
            <template #item="{ element }">
              <div class="page-row">
                <span class="drag-handle">
                  <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                    <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                    <circle cx="4" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="4" cy="16" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                </span>
                <div class="page-thumb">
                  <img :src="element.image" :alt="element.category" />
                </div>
                <div class="page-info">
                  <p class="page-category">{{ element.category }}</p>
                  <label class="display-name-field">
                    <span class="display-name-label">Display name</span>
                    <UiInput
                      v-model="element.displayName"
                      size="lg"
                      placeholder="Enter display name"
                    />
                  </label>
                  <div class="page-actions">
                    <button type="button" class="action-link">Change image</button>
                    <button type="button" class="action-link">Change page</button>
                    <button type="button" class="action-link">Preview</button>
                  </div>
                </div>
              </div>
            </template>
          </Draggable>
        </section>

        <slot name="before-brand-assets" />

        <!-- 4. Brand Assets -->
        <section v-if="!props.hideStoreAssetSections" id="section-sb-ss-brand-assets" class="card">
          <h2>Brand assets</h2>
          <p class="section-desc">Use your registered brand logo to help shoppers recognize and connect with your brand.</p>

          <div class="asset-block">
            <p class="asset-label">LOGO</p>
            <div class="logo-row">
              <div class="logo-box">
                <img src="https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/c/AmazonStores/ATVPDKIKX0DER/e38f83c8b3f19f17c5b5a3c8c8a7c1a8.w400.h400.png" alt="DREO" class="logo-img" />
              </div>
              <div class="logo-meta">
                <p class="logo-filename">DREO.jpg</p>
                <p class="logo-size">400 × 400</p>
              </div>
            </div>
          </div>

          <div class="asset-block" style="margin-top: 20px;">
            <p class="asset-label">Brand name</p>
            <p class="brand-name">DREO</p>
          </div>
        </section>

      </div>

      <!-- Right column: Preview panel -->
      <aside class="preview-panel">
        <div class="preview-header">
          <div class="preview-tabs">
            <button type="button" class="preview-tab" :class="{ active: previewDevice === 'mobile' }" @click="previewDevice = 'mobile'">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3.5" y="1" width="9" height="14" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="12.5" r="0.75" fill="currentColor"/></svg>
            </button>
            <button type="button" class="preview-tab" :class="{ active: previewDevice === 'web' }" @click="previewDevice = 'web'">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 14h5M8 12v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="preview-placement">
            <UiSelect
              v-model="previewPlacement"
              :options="placementOptions"
            />
          </div>
        </div>
        <div class="preview-frame">
          <div class="pv-amazon-header">
            <svg width="70" height="22" viewBox="0 0 70 22"><text x="0" y="17" fill="#fff" font-size="16" font-weight="700" font-style="italic" font-family="Arial, sans-serif">amazon</text></svg>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18 18l-4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.5"/></svg>
          </div>
          <div class="pv-search-bar">
            <div class="pv-search-input"></div>
            <div class="pv-search-icon">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M18 18l-4-4" stroke="#555" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="6" stroke="#555" stroke-width="1.5"/></svg>
            </div>
          </div>
          <div class="pv-ad-content">
            <div class="pv-brand-row">
              <img src="https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/c/AmazonStores/ATVPDKIKX0DER/e38f83c8b3f19f17c5b5a3c8c8a7c1a8.w400.h400.png" alt="DREO" class="pv-brand-logo" />
              <span class="pv-headline">{{ ssHeadline || 'Your headline here' }}</span>
            </div>
            <div class="pv-products">
              <div v-for="page in storePages" :key="page.id" class="pv-product">
                <div class="pv-product-img-wrap">
                  <img :src="page.image" :alt="page.category" />
                </div>
                <span class="pv-product-name">{{ page.category }}</span>
              </div>
            </div>
            <div class="pv-footer">
              <span class="pv-cta">Save up to 15% on ›</span>
              <span class="pv-sponsored">Sponsored</span>
            </div>
          </div>
          <div class="pv-blank"></div>
        </div>
      </aside>

    </div>

    <SbStoreSpotlightManualTargetingSection v-if="showManualTargetingInAd" />

    <template v-if="!props.hideTargetingSections && effectiveTargetType === 'keyword' && !showSeparateKeywordTargetingStep">
      <p v-if="errors.keywords" class="error-msg ss-flow-error">{{ errors.keywords }}</p>
      <SbKeywordTargetingSection />
    </template>

    <div v-if="!props.hideTargetingSections && showInlineProductTargeting" id="section-sb-ss-products" class="sb-product-targeting-wrap">
      <p v-if="errors.productTargeting" class="error-msg ss-flow-error">{{ errors.productTargeting }}</p>
      <ProductTargetingPanels
        :form="form"
        product-title="Product Targeting-Products"
        category-title="Product Targeting-Categories"
      />
    </div>

  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import Draggable from 'vuedraggable'
import UiInput from '@/components/ui/input/Input.vue'
import Switch from '@/components/ui/switch/Switch.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import SbKeywordTargetingSection from '../shared/SbKeywordTargetingSection.vue'
import SbStoreSpotlightManualTargetingSection from '@/pages/SbAdGroupPage/SbStoreSpotlightManualTargetingSection.vue'
import ProductTargetingPanels from '@/components/product-targeting/ProductTargetingPanels.vue'

const props = defineProps({
  targetingModeOverride: {
    type: String,
    default: ''
  },
  hideTargetingSections: {
    type: Boolean,
    default: false
  },
  hideStoreAssetSections: {
    type: Boolean,
    default: false
  },
  hideStorePagesSection: {
    type: Boolean,
    default: false
  }
})

const { form } = storeToRefs(useSbStore())

const effectiveTargetType = computed(() =>
  props.targetingModeOverride || form.value.storeSpotlightManualTargetType
)

const showManualTargetingInAd = computed(() => (
  form.value.adFormat === 'store_spotlight'
  && form.value.goals === 'drive_page_visits'
))

const showSeparateKeywordTargetingStep = computed(() => (
  form.value.adFormat === 'store_spotlight'
  && (
    (
      form.value.goals === 'drive_page_visits'
      && effectiveTargetType.value === 'keyword'
    )
    || form.value.goals === 'brand_impression_share'
  )
))

const showSeparateProductTargetingStep = computed(() => (
  form.value.goals === 'drive_page_visits'
  && form.value.adFormat === 'store_spotlight'
  && effectiveTargetType.value === 'product'
))

const showInlineProductTargeting = computed(() => (
  effectiveTargetType.value === 'product'
  && !showSeparateProductTargetingStep.value
  && !(
    form.value.goals === 'brand_impression_share'
    && form.value.adFormat === 'store_spotlight'
  )
))

const optimizeHeadline = ref(false)
const ssHeadline = ref('')
const previewDevice = ref('mobile')
const previewPlacement = ref('top')
const placementOptions = [
  { label: 'Top of search', value: 'top' },
  { label: 'Rest of search', value: 'rest' }
]

const storePages = ref([
  {
    id: 'sp-1',
    category: 'Heaters',
    displayName: 'Heaters',
    image: 'https://m.media-amazon.com/images/I/81G+4gzszVL._AC_SY879_.jpg'
  },
  {
    id: 'sp-2',
    category: 'Humidifier',
    displayName: 'Humidifier',
    image: 'https://m.media-amazon.com/images/I/61vQZ5V5qPL._AC_SL1500_.jpg'
  },
  {
    id: 'sp-3',
    category: 'Portable Heater',
    displayName: 'Portable Heater',
    image: 'https://m.media-amazon.com/images/I/71pB9RvWyRL._AC_SL1500_.jpg'
  }
])

const errors = reactive({
  adName: '',
  headline: '',
  keywords: '',
  productTargeting: '',
})

function validate() {
  const errorItems = []

  if (!form.value.headline?.trim()) {
    errors.adName = 'Ad name is required.'
    errorItems.push({ subItem: 'Ad name', label: 'Ad name', anchorId: 'section-sb-ss-ad-name' })
  } else {
    errors.adName = ''
  }

  if (props.hideTargetingSections) {
    errors.keywords = ''
    errors.productTargeting = ''
  } else if (effectiveTargetType.value === 'keyword' && !showSeparateKeywordTargetingStep.value) {
    errors.productTargeting = ''
    if (form.value.keywords.length === 0) {
      errors.keywords = 'Please add at least one keyword.'
      errorItems.push({ subItem: 'Keyword targeting', label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' })
    } else {
      errors.keywords = ''
    }
  } else {
    errors.keywords = ''
    if (showInlineProductTargeting.value && form.value.productTargets.length === 0) {
      errors.productTargeting = 'Please add at least one product or category target.'
      errorItems.push({ subItem: 'Product targeting', label: 'Product targeting', anchorId: 'section-sb-ss-products' })
    } else {
      errors.productTargeting = ''
    }
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
.store-spotlight-outer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sb-product-targeting-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sb-product-targeting-wrap :deep(.pt-panels-root) {
  gap: 16px;
}

.store-spotlight-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.store-spotlight-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

h2 {
  margin: 0 0 16px;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
}

.section-desc {
  margin: -8px 0 16px;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  line-height: 1.5;
}

/* ── Headline ── */
.field {
  margin-bottom: 14px;
}

.headline-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.headline-row :deep(.ui-input) {
  flex: 1;
}

.copy-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 20px;
  background: #eee;
  border: 1px solid #dcdcdc;
  border-radius: 3px;
  font-size: var(--text-base, 14px);
  color: rgba(0,0,0,0.4);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #e0e0e0;
}

.optimize-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.optimize-label {
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.optimize-desc {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  line-height: 1.6;
  max-width: 600px;
}

.learn-link {
  color: var(--primary, #1876ff);
  text-decoration: none;
  margin-left: 4px;
}

.error-msg {
  margin: 6px 0 0;
  font-size: var(--text-sm, 13px);
  color: var(--color-danger);
}

/* ── Store Pages ── */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--gray-50, #f8fafc);
  border-radius: var(--radius-md, 8px);
}

.drag-handle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--text-hint, #b0b8c4);
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.page-thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eee;
}

.page-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.page-info {
  flex: 1;
  min-width: 0;
}

.page-category {
  margin: 0 0 6px;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.display-name-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 10px;
}

.display-name-label {
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--text-sub);
}

.display-name-field :deep(.ui-input) {
  max-width: 360px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-link {
  background: none;
  border: none;
  padding: 0;
  font-size: var(--text-sm, 13px);
  color: var(--primary, #1876ff);
  cursor: pointer;
  font-family: inherit;
}

.action-link:hover {
  text-decoration: underline;
}

/* ── Brand Assets ── */
.asset-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-label {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #dcdcdc;
  border-radius: 3px;
  overflow: hidden;
  max-width: 420px;
}

.logo-box {
  width: 81px;
  height: 81px;
  flex-shrink: 0;
  border-right: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.logo-img {
  width: 65px;
  height: 65px;
  object-fit: contain;
}

.logo-meta {
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(270deg, #fff 0%, #f8f8f8 100%);
}

.logo-filename {
  margin: 0 0 2px;
  font-size: var(--text-sm, 13px);
  color: var(--text-main);
}

.logo-size {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-hint);
}

.brand-name {
  margin: 0;
  font-size: var(--text-xl, 16px);
  font-weight: 600;
  color: var(--text-main);
}

/* ── Preview Panel ── */
.preview-panel {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-tabs {
  display: flex;
  gap: 12px;
}

.preview-tab {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  opacity: 0.4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;
}

.preview-tab.active {
  opacity: 1;
}

.preview-tab:hover {
  opacity: 0.8;
}

.preview-frame {
  border: 3px solid rgba(0,0,0,0.07);
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

/* ── Amazon Header ── */
.pv-amazon-header {
  background: #232f3e;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pv-search-bar {
  display: flex;
  align-items: center;
  margin: 6px 8px;
  border: 1px solid #cdcdcd;
  border-radius: 4px;
  overflow: hidden;
  height: 28px;
}

.pv-search-input {
  flex: 1;
  background: #fff;
}

.pv-search-icon {
  width: 32px;
  height: 28px;
  background: #febd69;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Ad Content ── */
.pv-ad-content {
  padding: 10px 12px;
}

.pv-brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.pv-brand-logo {
  width: 48px;
  height: 24px;
  object-fit: contain;
}

.pv-headline {
  font-size: 12px;
  color: #111;
  flex: 1;
  line-height: 1.3;
}

.pv-products {
  display: flex;
  gap: 6px;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pv-product {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pv-product-img-wrap {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 2px;
}

.pv-product-img-wrap img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.pv-product-name {
  font-size: 10px;
  color: #555;
  text-align: center;
  line-height: 1.2;
}

.pv-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
}

.pv-cta {
  font-size: 10px;
  color: #007185;
}

.pv-sponsored {
  font-size: 9px;
  color: #999;
}

.pv-blank {
  height: 160px;
  background: #fff;
}
</style>
