<template>
  <div class="video-content">
    <!-- Store on Amazon → Store Spotlight + Video upload + Products -->
    <template v-if="form.videoLandingType === 'store'">
      <StoreSpotlightContent
        ref="storeSpotlightRef"
        targeting-mode-override="keyword"
        hide-targeting-sections
        hide-store-pages-section
      >
        <template #before-brand-assets>
          <section id="section-sb-video" class="card">
            <div class="title-group">
              <h2>Video</h2>
              <p>Pick an engaging video that showcases your product in action with sound. Video will auto-play on mute.</p>
            </div>

            <input
              ref="videoFileInputRef"
              type="file"
              accept="video/mp4,video/quicktime"
              class="video-file-input"
              @change="onVideoSelect"
            />

            <div class="video-add-choice">
              <p class="video-add-choice__title">Add video</p>
              <div class="video-add-options" role="radiogroup" aria-label="Add video">
                <div class="video-add-option-wrap">
                  <label class="video-add-option">
                    <input v-model="videoAddMode" type="radio" value="assets" />
                    <span class="video-add-radio" aria-hidden="true"><span /></span>
                    <span>Choose from creative assets</span>
                  </label>

                  <button
                    v-if="videoAddMode === 'assets'"
                    class="add-btn video-option-action"
                    type="button"
                    @click="creativeAssetsOpen = true"
                  >
                    <span class="add-icon">
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                      </svg>
                    </span>
                    Add
                  </button>

                  <div v-if="selectedCreativeAssets.length > 0" class="creative-video-list video-option-action">
                    <div v-for="asset in selectedCreativeAssets" :key="asset.id" class="creative-video-row">
                      <div class="creative-video-thumb">
                        <img v-if="asset.image" :src="asset.image" :alt="asset.title" />
                      </div>
                      <div class="creative-video-info">
                        <p class="creative-video-title">{{ asset.title }}</p>
                        <p class="creative-video-meta">Creative asset</p>
                      </div>
                      <button type="button" class="video-remove" aria-label="Remove creative asset" @click="removeCreativeAsset">
                        <Trash2 :size="20" :stroke-width="1.75" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="video-add-option-wrap">
                  <label class="video-add-option">
                    <input v-model="videoAddMode" type="radio" value="upload" />
                    <span class="video-add-radio" aria-hidden="true"><span /></span>
                    <span>Upload video</span>
                  </label>

                  <button v-if="videoAddMode === 'upload'" class="add-btn video-option-action" type="button" @click="openVideoPicker">
                    <span class="add-icon">
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                      </svg>
                    </span>
                    Upload video
                  </button>
                </div>
              </div>
            </div>

            <ProductPickerSheet
              v-model:open="creativeAssetsOpen"
              :catalog="creativeAssetCatalog"
              :catalog-total="AD_GROUP_PRODUCT_CATALOG_TOTAL"
              :initial-selected-ids="selectedCreativeAssetIds"
              :max-selection="1"
              title="Select a Video to feature in your ad"
              search-placeholder="Search"
              :show-product-meta="false"
              :show-product-pricing="false"
              stock-label="23.33MB"
              asin-label="1920*1080"
              asin-label-prefix=""
              @confirm="onCreativeAssetConfirm"
            />

            <p v-if="errors.video" class="error-msg">{{ errors.video }}</p>

            <div v-if="form.videoPreviewUrl" class="video-added-row">
              <div class="video-added-inner">
                <video :src="form.videoPreviewUrl" controls class="preview-video" />
              </div>
              <button type="button" class="video-remove" aria-label="Remove video" @click="removeVideo">
                <Trash2 :size="20" :stroke-width="1.75" />
              </button>
            </div>
          </section>

          <section id="section-sb-products" class="card">
            <div class="title-group">
              <h2>Products <span class="required">*</span></h2>
              <p>Add 1-3 products to feature in your ad. Drag cards to change the display order.</p>
            </div>
            <ProductSelector
              v-model="form.products"
              picker-title="Select products to feature in your ad"
              :min="1"
              :max="3"
              :draggable="true"
              label="Add"
              :error="errors.products"
              @update:model-value="errors.products = ''"
            />
            <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
          </section>
        </template>
      </StoreSpotlightContent>

      <SbStoreSpotlightManualTargetingSection v-if="form.goals !== 'brand_impression_share'" />
    </template>

    <!-- Product detail page + Drive page visits → Store assets + video + single product -->
    <template v-else-if="showProductDetailStoreAssetsFlow">
      <StoreSpotlightContent
        ref="storeSpotlightRef"
        targeting-mode-override="keyword"
        hide-targeting-sections
        hide-store-asset-sections
      >
        <template #store-asset-content>
          <section id="section-sb-products" class="card">
            <div class="title-group">
              <h2>Product <span class="required">*</span></h2>
            </div>
            <p class="card-desc">Add 1 product to feature in your ad.</p>
            <ProductSelector
              v-model="form.products"
              picker-title="Select a product to feature in your ad"
              :min="1"
              :max="1"
              :draggable="false"
              label="Add"
              :error="errors.products"
              @update:model-value="errors.products = ''"
            />
            <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
          </section>

          <section id="section-sb-video" class="card">
            <div class="title-group">
              <h2>Video</h2>
              <p>Pick an engaging video that showcases your product in action with sound. Video will auto-play on mute.</p>
            </div>

            <input
              ref="videoFileInputRef"
              type="file"
              accept="video/mp4,video/quicktime"
              class="video-file-input"
              @change="onVideoSelect"
            />

            <div class="video-add-choice">
              <p class="video-add-choice__title">Add video</p>
              <div class="video-add-options" role="radiogroup" aria-label="Add video">
                <div class="video-add-option-wrap">
                  <label class="video-add-option">
                    <input v-model="videoAddMode" type="radio" value="assets" />
                    <span class="video-add-radio" aria-hidden="true"><span /></span>
                    <span>Choose from creative assets</span>
                  </label>

                  <button
                    v-if="videoAddMode === 'assets'"
                    class="add-btn video-option-action"
                    type="button"
                    @click="creativeAssetsOpen = true"
                  >
                    <span class="add-icon">
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                      </svg>
                    </span>
                    Add
                  </button>

                  <div v-if="selectedCreativeAssets.length > 0" class="creative-video-list video-option-action">
                    <div v-for="asset in selectedCreativeAssets" :key="asset.id" class="creative-video-row">
                      <div class="creative-video-thumb">
                        <img v-if="asset.image" :src="asset.image" :alt="asset.title" />
                      </div>
                      <div class="creative-video-info">
                        <p class="creative-video-title">{{ asset.title }}</p>
                        <p class="creative-video-meta">Creative asset</p>
                      </div>
                      <button type="button" class="video-remove" aria-label="Remove creative asset" @click="removeCreativeAsset">
                        <Trash2 :size="20" :stroke-width="1.75" />
                      </button>
                    </div>
                  </div>
                </div>
                <div class="video-add-option-wrap">
                  <label class="video-add-option">
                    <input v-model="videoAddMode" type="radio" value="upload" />
                    <span class="video-add-radio" aria-hidden="true"><span /></span>
                    <span>Upload video</span>
                  </label>

                  <button v-if="videoAddMode === 'upload'" class="add-btn video-option-action" type="button" @click="openVideoPicker">
                    <span class="add-icon">
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                      </svg>
                    </span>
                    Upload video
                  </button>
                </div>
              </div>
            </div>

            <ProductPickerSheet
              v-model:open="creativeAssetsOpen"
              :catalog="creativeAssetCatalog"
              :catalog-total="AD_GROUP_PRODUCT_CATALOG_TOTAL"
              :initial-selected-ids="selectedCreativeAssetIds"
              :max-selection="1"
              title="Select a Video to feature in your ad"
              search-placeholder="Search"
              :show-product-meta="false"
              :show-product-pricing="false"
              stock-label="23.33MB"
              asin-label="1920*1080"
              asin-label-prefix=""
              @confirm="onCreativeAssetConfirm"
            />

            <p v-if="errors.video" class="error-msg">{{ errors.video }}</p>

            <div v-if="form.videoPreviewUrl" class="video-added-row">
              <div class="video-added-inner">
                <video :src="form.videoPreviewUrl" controls class="preview-video" />
              </div>
              <button type="button" class="video-remove" aria-label="Remove video" @click="removeVideo">
                <Trash2 :size="20" :stroke-width="1.75" />
              </button>
            </div>
          </section>
        </template>
      </StoreSpotlightContent>

      <SbStoreSpotlightManualTargetingSection />

    </template>

    <!-- Product detail page → Ad name + Keyword targeting + single product -->
    <template v-else>
      <section id="section-sb-video-ad-name" class="card">
        <div class="title-group">
          <h2>Ad name</h2>
        </div>
        <div class="field" :class="{ 'has-error': errors.adName }">
          <div class="headline-wrap">
            <UiInput
              v-model="form.headline"
              size="lg"
              placeholder="Enter Ad name"
              :maxlength="50"
              @input="errors.adName = ''"
            />
          </div>
          <p v-if="errors.adName" class="error-msg error-msg--field">{{ errors.adName }}</p>
        </div>
      </section>

      <SbKeywordTargetingSection />

      <section id="section-sb-products" class="card">
        <div class="title-group">
          <h2>Product <span class="required">*</span></h2>
        </div>
        <p class="card-desc">Add 1 product to feature in your ad.</p>
        <ProductSelector
          v-model="form.products"
          picker-title="Select a product to feature in your ad"
          :min="1"
          :max="1"
          :draggable="false"
          label="Add"
          :error="errors.products"
          @update:model-value="errors.products = ''"
        />
        <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
      </section>

      <SbStoreSpotlightManualTargetingSection />
    </template>
  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import { Trash2 } from 'lucide-vue-next'
import StoreSpotlightContent from '../storeSpotlight/StoreSpotlightContent.vue'
import ProductSelector from '../collections/ProductSelector.vue'
import UiInput from '@/components/ui/input/Input.vue'
import SbKeywordTargetingSection from '../shared/SbKeywordTargetingSection.vue'
import SbStoreSpotlightManualTargetingSection from '@/pages/SbAdGroupPage/SbStoreSpotlightManualTargetingSection.vue'
import ProductPickerSheet from '@/components/product/ProductPickerSheet.vue'
import {
  adGroupProductCatalog,
  AD_GROUP_PRODUCT_CATALOG_TOTAL
} from '@/data/adGroupProductCatalog.js'

const { form } = storeToRefs(useSbStore())

const storeSpotlightRef = ref(null)
const videoFileInputRef = ref(null)
const videoAddMode = ref('assets')
const creativeAssetsOpen = ref(false)
const selectedCreativeAssets = ref([])

const selectedCreativeAssetIds = computed(() => selectedCreativeAssets.value.map((asset) => asset.id))
const creativeAssetCatalog = computed(() => (
  adGroupProductCatalog.map((asset) => ({
    ...asset,
    title: 'DR-HTF007_基础款_30s.mp4'
  }))
))

const showProductDetailStoreAssetsFlow = computed(() => (
  form.value.goals === 'drive_page_visits'
  && form.value.videoLandingType === 'product_detail'
))

const errors = reactive({
  adName: '',
  products: '',
  video: ''
})

function openVideoPicker() {
  videoFileInputRef.value?.click()
}

function onVideoSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  form.value.videoFile = file
  form.value.videoPreviewUrl = URL.createObjectURL(file)
  selectedCreativeAssets.value = []
  errors.video = ''
  e.target.value = ''
}

function onCreativeAssetConfirm(list) {
  selectedCreativeAssets.value = list
  form.value.videoFile = null
  form.value.videoPreviewUrl = ''
  if (videoFileInputRef.value) videoFileInputRef.value.value = ''
  errors.video = ''
}

function removeCreativeAsset() {
  selectedCreativeAssets.value = []
}

function removeVideo() {
  if (form.value.videoPreviewUrl) {
    URL.revokeObjectURL(form.value.videoPreviewUrl)
  }
  form.value.videoFile = null
  form.value.videoPreviewUrl = ''
  if (videoFileInputRef.value) videoFileInputRef.value.value = ''
}

function validate() {
  const errorItems = []

  if (form.value.videoLandingType === 'store' || showProductDetailStoreAssetsFlow.value) {
    const r = storeSpotlightRef.value?.validate?.() ?? { ok: true, errorItems: [] }
    if (!r.ok) {
      errorItems.push(...r.errorItems)
    }
    errors.adName = ''
    errors.video = ''
  } else if (!form.value.headline?.trim()) {
    errors.adName = 'Ad name is required.'
    errorItems.push({ subItem: 'Ad name', label: 'Ad name', anchorId: 'section-sb-video-ad-name' })
  } else {
    errors.adName = ''
  }

  // Products / Product 在两种 landing 下均为必填
  if (form.value.videoLandingType === 'store') {
    if (form.value.products.length < 1) {
      errors.products = 'Please add at least 1 product.'
      errorItems.push({ subItem: 'Products', label: 'Products', anchorId: 'section-sb-products' })
    } else {
      errors.products = ''
    }
  } else if (form.value.products.length < 1) {
    errors.products = 'Please add 1 product.'
    errorItems.push({ subItem: 'Products', label: 'Product', anchorId: 'section-sb-products' })
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
.video-content {
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
  gap: 20px;
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
  line-height: 1.55;
}

/* Single product card: description sits directly in the section. */
.card-desc {
  margin: -12px 0 0;
  font-size: var(--text-base, 14px);
  color: var(--text-sub);
  line-height: 1.55;
}

.required {
  color: var(--color-danger);
  font-size: var(--text-sm, 13px);
}

.error-msg {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--color-danger);
  line-height: 1.4;
}

.error-msg--field {
  margin-top: 6px;
}

.field {
  margin-bottom: 0;
}

.headline-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 500px;
}

.has-error :deep(input) {
  border-color: var(--color-danger) !important;
}

.video-file-input {
  display: none;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  background: #e8e8e8;
  border: none;
  border-radius: 18px;
  height: 36px;
  padding: 0 16px 0 6px;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: #424244;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  box-sizing: border-box;
}

.add-btn:hover {
  background: #d8d8d8;
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #424244;
  flex-shrink: 0;
}

.video-add-choice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-add-choice__title {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
}

.video-add-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.video-add-option-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.video-add-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  color: var(--text-main);
  font-size: var(--text-base, 14px);
  cursor: pointer;
  user-select: none;
}

.video-add-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.video-add-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong, #cbd5e1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  flex-shrink: 0;
}

.video-add-radio span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
}

.video-add-option input:checked + .video-add-radio {
  border-color: var(--primary);
}

.video-add-option input:checked + .video-add-radio span {
  background: var(--primary);
}

.video-option-action {
  margin-left: 26px;
}

.creative-video-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.creative-video-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--gray-50, #f8fafc);
  border-radius: var(--radius-md, 8px);
}

.creative-video-thumb {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.creative-video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.creative-video-info {
  flex: 1;
  min-width: 0;
}

.creative-video-title {
  margin: 0 0 4px;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creative-video-meta {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
}

.video-added-row {
  --ep-list-surface: #f8f8f8;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: var(--ep-list-surface);
}

.video-added-inner {
  flex: 1;
  min-width: 0;
}

.preview-video {
  width: 100%;
  max-width: 480px;
  border-radius: var(--radius-md, 8px);
  background: #000;
  vertical-align: middle;
}

.video-remove {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s;
}

.video-remove:hover {
  color: #ef4444;
}
</style>
