<template>
  <div class="product-selector">
    <p v-if="hint" class="hint-text">{{ hint }}</p>

    <button
      class="add-btn"
      type="button"
      :disabled="max !== null && modelValue.length >= max"
      @click="pickerOpen = true"
    >
      <span class="add-icon">
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </span>
      {{ label }}
    </button>

    <!-- Draggable list -->
    <Draggable
      v-if="draggable && modelValue.length > 0"
      :list="localList"
      item-key="id"
      handle=".drag-handle"
      animation="200"
      class="product-list"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="product-row">
          <span class="drag-handle" title="Drag to reorder">
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </span>
          <div class="product-card">
            <div class="product-thumb">
              <img v-if="element.image" :src="element.image" :alt="element.title" />
            </div>
            <div class="product-info">
              <p class="product-title">{{ element.title }}</p>
              <div class="product-meta">
                <span class="product-asin">ASIN: {{ element.asin }}</span>
                <span class="product-price">{{ element.price }}</span>
              </div>
            </div>
          </div>
          <button type="button" class="remove-btn" @click="removeProduct(index)">
            <Trash2 :size="18" />
          </button>
        </div>
      </template>
    </Draggable>

    <!-- Non-draggable list -->
    <div v-else-if="!draggable && modelValue.length > 0" class="product-list">
      <div v-for="(p, i) in modelValue" :key="p.id" class="product-row">
        <div class="product-card">
          <div class="product-thumb">
            <img v-if="p.image" :src="p.image" :alt="p.title" />
          </div>
          <div class="product-info">
            <p class="product-title">{{ p.title }}</p>
            <div class="product-meta">
              <span class="product-asin">ASIN: {{ p.asin }}</span>
              <span class="product-price">{{ p.price }}</span>
            </div>
            <!-- 单选场景：在 ASIN 下方提供「重新选择」入口，点击重新打开抽屉 -->
            <button
              v-if="max === 1"
              type="button"
              class="reselect-btn"
              @click="pickerOpen = true"
            >
              <svg
                class="reselect-btn__icon"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10.9519 1.30859L14.6921 5.04879L5.07379 14.6671L1.33359 14.6671L1.33359 10.9269L10.9519 1.30859ZM10.9519 3.19421L9.09732 5.04879L10.9519 6.90337L12.8065 5.04879L10.9519 3.19421ZM10.0091 7.84618L8.15451 5.9916L2.66692 11.4792L2.66692 13.3338H4.5215L10.0091 7.84618ZM14.8168 14.6671H8.45476V13.3338L14.8168 13.3338V14.6671Z"
                  fill="currentColor"
                />
              </svg>
              <span>Reselect</span>
            </button>
          </div>
        </div>
        <button type="button" class="remove-btn" @click="removeProduct(i)">
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <ProductPickerSheet
      v-model:open="pickerOpen"
      :catalog="adGroupProductCatalog"
      :catalog-total="AD_GROUP_PRODUCT_CATALOG_TOTAL"
      :initial-selected-ids="selectedIds"
      :max-selection="max"
      :title="props.pickerTitle"
      @confirm="onPickerConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import Draggable from 'vuedraggable'
import ProductPickerSheet from '@/components/product/ProductPickerSheet.vue'
import {
  adGroupProductCatalog,
  AD_GROUP_PRODUCT_CATALOG_TOTAL
} from '@/data/adGroupProductCatalog.js'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  draggable: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  pickerTitle: { type: String, default: undefined },
  label: { type: String, default: 'Add' },
  error: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const pickerOpen = ref(false)

const selectedIds = computed(() => props.modelValue.map(p => p.id))

// Local copy for draggable (kept in sync with modelValue)
const localList = ref([...props.modelValue])
watch(() => props.modelValue, (v) => { localList.value = [...v] }, { deep: true })

function onDragEnd() {
  emit('update:modelValue', [...localList.value])
}

function removeProduct(index) {
  const newList = [...props.modelValue]
  newList.splice(index, 1)
  emit('update:modelValue', newList)
}

function onPickerConfirm(list) {
  emit('update:modelValue', list)
}
</script>

<style scoped>
.product-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hint-text {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  line-height: 1.5;
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
}

.add-btn:hover:not(:disabled) {
  background: #d8d8d8;
}

.add-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #424244;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--gray-50, #f8fafc);
  border-radius: var(--radius-md, 8px);
}

.drag-handle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: var(--text-hint, #b0b8c4);
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.product-thumb {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  margin: 0;
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
}

.product-price {
  color: #fe4041;
  font-weight: 500;
}

/* 单选场景下的 Reselect 链接式按钮：与 ASIN 同字号，颜色 #0056E0 */
.reselect-btn {
  margin-top: 4px;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: var(--text-sm, 13px);
  line-height: 1.4;
  color: #0056e0;
  cursor: pointer;
}

.reselect-btn:hover {
  text-decoration: underline;
}

.reselect-btn__icon {
  display: block;
  flex-shrink: 0;
}

.remove-btn {
  padding: 6px;
  background: none;
  border: none;
  color: var(--text-hint);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: var(--color-danger);
}
</style>
