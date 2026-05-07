<template>
  <section class="card ep-card" :id="anchorId">
    <h3 class="section-title">
      Exclude brands
      <span class="help-wrap">
        <img :src="iconHelpCircle" alt="" width="16" height="16" class="help-icon" />
        <span class="help-tooltip">Exclude specific brands to prevent your ads from appearing on those brand pages.</span>
      </span>
    </h3>

    <div class="ep-body">
      <!-- Left: Search panel -->
      <div class="ep-left">
        <div class="ep-search-bar">
          <input
            v-model="brandSearchQuery"
            class="ep-search"
            type="text"
            placeholder="Search by brand name"
          />
          <button class="ep-search-btn" type="button">Search</button>
        </div>
        <div class="ep-results">
          <div
            v-for="brand in filteredBrands"
            :key="brand.id"
            class="eb-brand-row"
            :class="{ selected: isBrandExcluded(brand.id) }"
          >
            <span class="eb-brand-name">{{ brand.name }}</span>
            <button
              class="eb-exclude-btn"
              type="button"
              @click="toggleBrand(brand)"
            >
              {{ isBrandExcluded(brand.id) ? 'Added' : 'Exclude' }}
            </button>
          </div>
          <p v-if="filteredBrands.length === 0" class="ep-empty">No brands found.</p>
        </div>
      </div>

      <!-- Right: Added panel -->
      <div class="ep-right">
        <div class="ep-right-header">
          <span class="ep-added-count">{{ list.length }} added</span>
          <button v-if="list.length > 0" class="ep-remove-all" type="button" @click="removeAll">Remove all</button>
        </div>
        <div class="ep-added-list">
          <div v-for="brand in list" :key="brand.id" class="eb-added-row">
            <span class="eb-brand-name">{{ brand.name }}</span>
            <button class="eb-close-btn" type="button" @click="removeBrand(brand.id)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 2l10 10M12 2L2 12"/>
              </svg>
            </button>
          </div>
          <p v-if="list.length === 0" class="ep-empty-right">No excluded brands yet.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import iconHelpCircle from '@/assets/icon-help-circle.svg'

/**
 * Exclude brands 卡片：SP / SB 共用
 *  - list / update:list 受控当前已排除品牌（由父级注入 form.excludedBrands）
 */
const props = defineProps({
  list: { type: Array, default: () => [] },
  anchorId: { type: String, default: 'section-negative-brand' },
})

const emit = defineEmits(['update:list'])

function emitList(next) {
  emit('update:list', next)
}

const MOCK_BRANDS = [
  { id: 'brand-dreo', name: 'DREO' },
  { id: 'brand-vornado', name: 'Vornado' },
  { id: 'brand-lasko', name: 'Lasko' },
  { id: 'brand-delonghi', name: "De'Longhi" },
  { id: 'brand-givebest', name: 'GiveBest' },
  { id: 'brand-honeywell', name: 'Honeywell' },
  { id: 'brand-pelonis', name: 'PELONIS' },
  { id: 'brand-kismile', name: 'Kismile' },
]

const brandSearchQuery = ref('')

const filteredBrands = computed(() => {
  const q = brandSearchQuery.value.trim().toLowerCase()
  if (!q) return MOCK_BRANDS
  return MOCK_BRANDS.filter((b) => b.name.toLowerCase().includes(q))
})

function isBrandExcluded(id) {
  return props.list.some((b) => b.id === id)
}

function toggleBrand(brand) {
  if (isBrandExcluded(brand.id)) {
    emitList(props.list.filter((b) => b.id !== brand.id))
  } else {
    emitList([...props.list, { ...brand }])
  }
}

function removeBrand(id) {
  emitList(props.list.filter((b) => b.id !== id))
}

function removeAll() {
  emitList([])
}
</script>

<style scoped>
/* ── Card ── */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ep-card { gap: 16px; }

.section-title {
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

/* ── Help icon + tooltip ── */
.help-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
  cursor: default;
}

.help-icon {
  display: block;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.help-wrap:hover .help-icon { opacity: 1; }

.help-tooltip {
  display: none;
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  background: #1e293b;
  color: #f8fafc;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 6px;
  width: 240px;
  white-space: normal;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.help-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1e293b;
}

.help-wrap:hover .help-tooltip { display: block; }

/* ── 左右分栏 ── */
.ep-body {
  --ep-list-surface: #f8f8f8;
  --ep-list-hover: #f0f0f0;
  --ep-column-header-height: 84px;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 400px;
  overflow: hidden;
  border-top: 1px solid #e2e8f0;
}

.ep-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-right: 32px;
  border-right: 1px solid #e2e8f0;
}

.ep-search-bar {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 16px 0 20px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.ep-search {
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

.ep-search:focus { border-color: #1876ff; }
.ep-search::placeholder { color: #b0bac8; }

.ep-search-btn {
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

.ep-search-btn:hover { background: #0f5fd4; }

.ep-results {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Right panel */
.ep-right {
  width: 45%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding-left: 12px;
}

.ep-right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 14px;
  box-sizing: border-box;
  min-height: var(--ep-column-header-height);
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-strong, #e2e8f0);
}

.ep-added-count {
  font-size: 20px;
  color: #272b36;
  font-weight: 600;
}

.ep-remove-all {
  background: none;
  border: none;
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s;
}

.ep-remove-all:hover { color: #ef4444; }

/* Empty states */
.ep-empty,
.ep-empty-right {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* ── Brand rows ── */
.eb-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: var(--ep-list-surface);
  transition: border-color 0.15s, background 0.15s;
}

.eb-brand-row:hover:not(.selected) {
  background: var(--ep-list-hover);
}

.eb-brand-row.selected {
  background: #fff;
  border-color: var(--selected-border);
}

.eb-brand-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.eb-exclude-btn {
  background: none;
  border: none;
  color: #1876ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.eb-exclude-btn:hover { opacity: 0.7; }

.eb-added-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: var(--ep-list-surface);
}

.eb-close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s;
}

.eb-close-btn:hover {
  color: #ef4444;
}
</style>
