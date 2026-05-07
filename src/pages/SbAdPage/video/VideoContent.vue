<template>
  <div class="video-content">
    <!-- Store on Amazon → Store Spotlight + Video upload + Products -->
    <template v-if="form.videoLandingType === 'store'">
      <StoreSpotlightContent ref="storeSpotlightRef" targeting-mode-override="keyword" />

      <section id="section-sb-video" class="card">
        <div class="title-group">
          <h2>Video</h2>
          <p>Upload a video to showcase your product. Recommended: 6-45 seconds, 1920x1080px. MP4, MOV supported. Max 500MB.</p>
        </div>

        <input
          ref="videoFileInputRef"
          type="file"
          accept="video/mp4,video/quicktime"
          class="video-file-input"
          @change="onVideoSelect"
        />

        <button class="add-btn" type="button" @click="openVideoPicker">
          <span class="add-icon">
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          Add
        </button>

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

    <!-- Store on Amazon → 单个产品 -->
    <section
      v-if="form.videoLandingType === 'store'"
      id="section-sb-products"
      class="card"
    >
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

    <!-- Product detail page → Ad name + Keyword targeting + 1-3 个产品 -->
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
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import { Trash2 } from 'lucide-vue-next'
import StoreSpotlightContent from '../storeSpotlight/StoreSpotlightContent.vue'
import ProductSelector from '../collections/ProductSelector.vue'
import UiInput from '@/components/ui/input/Input.vue'
import SbKeywordTargetingSection from '../shared/SbKeywordTargetingSection.vue'

const { form } = storeToRefs(useSbStore())

const storeSpotlightRef = ref(null)
const videoFileInputRef = ref(null)

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
  errors.video = ''
  e.target.value = ''
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

  if (form.value.videoLandingType === 'store') {
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
      errors.products = 'Please add 1 product.'
      errorItems.push({ subItem: 'Products', label: 'Product', anchorId: 'section-sb-products' })
    } else {
      errors.products = ''
    }
  } else if (form.value.products.length < 1) {
    errors.products = 'Please add at least 1 product.'
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

/* Store on Amazon 单产品卡片：描述脱离 title-group，独立放在 section 内 */
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
