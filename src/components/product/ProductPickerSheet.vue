<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="picker-overlay" />
      <DialogContent class="picker-content">
        <div class="picker-inner">
          <header class="picker-header">
            <DialogTitle class="picker-title">{{ props.title }}</DialogTitle>
            <DialogClose class="picker-close" aria-label="Close">
              <X :size="18" stroke-width="2" />
            </DialogClose>
          </header>

          <DialogDescription class="sr-only">
            Search by product name or ASIN, select the products you want to advertise, then confirm.
          </DialogDescription>

          <div class="picker-search-row">
            <div class="picker-search-bar">
              <input
                id="product-picker-search"
                v-model="searchQuery"
                class="picker-search"
                type="text"
                placeholder="Search by product name or ASIN"
                autocomplete="off"
              />
              <button type="button" class="picker-search-btn">Search</button>
            </div>
          </div>

          <div class="picker-list-wrap" :role="singleSelect ? 'radiogroup' : undefined">
            <button
              v-for="p in filteredCatalog"
              :key="p.id"
              type="button"
              class="picker-row"
              :class="{ selected: isSelected(p.id) }"
              :role="singleSelect ? 'radio' : undefined"
              :aria-checked="singleSelect ? isSelected(p.id) : undefined"
              @click="toggleRow(p.id)"
            >
              <span
                v-if="singleSelect"
                class="picker-radio"
                :class="{ 'picker-radio--checked': isSelected(p.id) }"
                aria-hidden="true"
              >
                <span v-if="isSelected(p.id)" class="picker-radio__inner" />
              </span>
              <CheckboxIndicator v-else :checked="isSelected(p.id)" />
              <div class="picker-product-card">
                <div class="picker-thumb">
                  <div class="picker-thumb-bg" aria-hidden="true" />
                  <img class="picker-thumb-img" :src="p.image" :alt="p.title" />
                </div>
                <div class="picker-info">
                  <p class="picker-item-title">{{ p.title }}</p>
                  <div class="picker-meta">
                    <span class="picker-stars">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        :width="11"
                        :height="11"
                        viewBox="0 0 12 12"
                        :fill="i <= roundRating(p.rating) ? '#f5a623' : '#e0e0e0'"
                      >
                        <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" />
                      </svg>
                    </span>
                    <span class="picker-reviews">({{ p.reviews.toLocaleString() }})</span>
                    <span class="picker-sep">|</span>
                    <span class="picker-orig-price">{{ p.originalPrice }}</span>
                    <span class="picker-price">{{ p.price }}</span>
                    <span class="picker-sep">|</span>
                    <span class="picker-stock">{{ p.inStock ? 'In stock' : 'Out of stock' }}</span>
                    <span class="picker-sep">|</span>
                    <span class="picker-asin">ASIN：{{ p.asin }}</span>
                  </div>
                </div>
              </div>
            </button>
            <p v-if="filteredCatalog.length === 0" class="picker-empty">No products match your search.</p>
          </div>

          <footer class="picker-footer">
            <span class="picker-count">
              Selected: {{ selectedCount }} / {{ props.maxSelection ?? catalogTotal }}
            </span>
            <div class="picker-actions">
              <button type="button" class="picker-btn picker-btn--outline" @click="onCancel">Cancel</button>
              <button type="button" class="picker-btn picker-btn--primary" @click="onConfirm">Add</button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from 'radix-vue'
import { X } from 'lucide-vue-next'
import CheckboxIndicator from '@/components/ui/checkbox/CheckboxIndicator.vue'
import { useToast } from '@/components/ui/toast/useToast'

const { toast } = useToast()

const props = defineProps({
  open: { type: Boolean, default: false },
  catalog: { type: Array, required: true },
  catalogTotal: { type: Number, required: true },
  /** Product ids currently in the ad group (sync when opening) */
  initialSelectedIds: { type: Array, default: () => [] },
  /** 上限：1 表示单选；>1 表示多选并按上限拦截；null 表示不限 */
  maxSelection: { type: Number, default: null },
  title: { type: String, default: 'Select the products you want to advertise for this ad group' }
})

/** 单选模式：max=1 时点击切换的同时会清空其它选项，并以 radio 视觉呈现 */
const singleSelect = computed(() => props.maxSelection === 1)

const emit = defineEmits(['update:open', 'confirm'])

const searchQuery = ref('')
const draftIds = ref(new Set())

function roundRating(r) {
  return Math.min(5, Math.max(0, Math.round(Number(r) || 0)))
}

const filteredCatalog = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.catalog
  return props.catalog.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      String(p.asin).toLowerCase().includes(q)
  )
})

const selectedCount = computed(() => draftIds.value.size)

function isSelected(id) {
  return draftIds.value.has(id)
}

function toggleRow(id) {
  if (singleSelect.value) {
    draftIds.value = isSelected(id) ? new Set() : new Set([id])
    return
  }
  const next = new Set(draftIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    if (props.maxSelection != null && next.size >= props.maxSelection) {
      toast({
        variant: 'limit',
        description: `Select up to ${props.maxSelection} products.`,
        duration: 3500
      })
      return
    }
    next.add(id)
  }
  draftIds.value = next
}

function syncDraftFromProps() {
  draftIds.value = new Set(props.initialSelectedIds.filter(Boolean))
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      searchQuery.value = ''
      syncDraftFromProps()
    }
  }
)

watch(
  () => props.initialSelectedIds,
  () => {
    if (props.open) syncDraftFromProps()
  },
  { deep: true }
)

function onOpenChange(v) {
  emit('update:open', v)
}

function onCancel() {
  emit('update:open', false)
}

function onConfirm() {
  const map = new Map(props.catalog.map((p) => [p.id, p]))
  const list = []
  for (const id of draftIds.value) {
    const p = map.get(id)
    if (p) list.push({ ...p })
  }
  emit('confirm', list)
  emit('update:open', false)
}
</script>

<style scoped>
/* shadcn Sheet: overlay */
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: hsl(0 0% 0% / 0.5);
  animation: picker-fade-in 0.2s ease-out;
}

@keyframes picker-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* shadcn Sheet: right panel — large width per Figma ~1075px */
.picker-content {
  position: fixed;
  z-index: 211;
  top: 0;
  right: 0;
  bottom: 0;
  left: auto;
  display: flex;
  flex-direction: column;
  width: min(1075px, 100vw);
  max-width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  border-left: 1px solid var(--border-strong);
  border-radius: 0;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  outline: none;
  animation: picker-slide-in 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes picker-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.picker-inner {
  --ep-list-surface: #f8f8f8;
  --ep-list-hover: #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  min-height: 56px;
  padding: 16px 16px 16px 20px;
  border-bottom: 1px solid var(--border-strong);
  box-sizing: border-box;
}

.picker-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: var(--text-lg, 16px);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-main);
}

.picker-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.picker-close:hover {
  color: var(--text-main);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Align with NegativeTargetingPage .ep-search-bar / .ep-search / .ep-search-btn */
.picker-search-row {
  flex-shrink: 0;
  padding: 24px 24px;
}

.picker-search-bar {
  display: flex;
  align-items: center;
  gap: 0;
}

.picker-search {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid #d0d5dd;
  border-radius: 3px 0 0 3px;
  padding: 0 12px;
  font-size: 14px;
  font-family: inherit;
  color: #111;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.picker-search:focus {
  border-color: #1876ff;
}

.picker-search::placeholder {
  color: #b0bac8;
}

.picker-search-btn {
  height: 36px;
  padding: 0 18px;
  border: 1px solid #1876ff;
  border-left: none;
  border-radius: 0 3px 3px 0;
  background: #1876ff;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.picker-search-btn:hover {
  background: #0f5fd4;
}

.picker-list-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 0 16px;
}

/* Match NegativeTargetingPage .ep-product-row / .ep-product-card / picker row layout */
.picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  padding: 16px;
  margin: 0 14px;
  align-self: stretch;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--ep-list-surface);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.picker-row + .picker-row {
  margin-top: 24px;
}

.picker-row:hover {
  background: var(--ep-list-hover);
}

.picker-row.selected {
  background: #fff;
  border-color: var(--selected-border);
}

.picker-row.selected:hover {
  background: #fff;
}

.picker-product-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.picker-thumb {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--ep-list-surface);
}

.picker-thumb-bg {
  position: absolute;
  inset: 0;
  background: var(--ep-list-surface);
}

.picker-thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.picker-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picker-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.45;
}

.picker-stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.picker-reviews {
  color: #1876ff;
}

.picker-sep {
  color: #d0d0d0;
}

.picker-orig-price {
  color: #999;
  text-decoration: line-through;
}

.picker-price {
  color: #fe4041;
  font-weight: 500;
}

.picker-stock {
  color: #999;
}

.picker-asin {
  color: #999;
}

/* 单选模式：圆形 radio 视觉 */
.picker-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dcdcdc;
  background: #fff;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
}

.picker-radio--checked {
  border-color: #1876ff;
}

.picker-radio__inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1876ff;
}

.picker-empty {
  margin: 0 14px;
  padding-top: 0;
  text-align: center;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
}

.picker-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-strong);
  background: var(--bg-card);
}

.picker-count {
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--text-main);
}

.picker-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.picker-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-base, 14px);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.picker-btn--outline {
  border: 1px solid var(--border-strong);
  background: var(--bg-card);
  color: var(--text-main);
}

.picker-btn--outline:hover {
  background: var(--gray-50);
}

.picker-btn--primary {
  border: none;
  background: var(--primary);
  color: #fff;
}

.picker-btn--primary:hover {
  background: var(--primary-hover);
}
</style>
