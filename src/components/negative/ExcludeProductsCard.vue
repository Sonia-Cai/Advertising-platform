<template>
  <section class="card ep-card ep-product-section" :id="anchorId">
    <h3 class="section-title">
      Exclude products
      <span class="help-wrap">
        <img :src="iconHelpCircle" alt="" width="16" height="16" class="help-icon" />
        <span class="help-tooltip">Exclude specific products to prevent your ads from appearing on those product pages.</span>
      </span>
    </h3>

    <div class="ep-work">
      <div class="ep-work-tabs">
        <UnderlineTabs v-model="leftTab" :items="leftTabs" size="lg" />
      </div>

      <div class="ep-work-head">
        <span class="ep-work-added-title">{{ list.length }} added</span>
        <button
          v-if="list.length > 0"
          type="button"
          class="remove-all-text-btn"
          @click="removeAll"
        >
          Remove all
        </button>
      </div>

      <div class="ep-work-left">
        <template v-if="leftTab === 'search'">
          <div class="ep-search-bar">
            <input
              v-model="searchQuery"
              class="ep-search"
              type="text"
              placeholder="Search by product name or ASIN"
            />
            <button class="ep-search-btn" type="button">Search</button>
          </div>
          <div class="ep-results">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="ep-product-row"
              :class="{ selected: isExcluded(product.id) }"
            >
              <div class="ep-product-card">
                <div class="ep-thumb">
                  <div class="ep-thumb-bg"></div>
                  <img class="ep-thumb-img" :src="product.image" :alt="product.title" />
                </div>
                <div class="ep-info">
                  <p class="ep-title">{{ product.title }}</p>
                  <div class="ep-meta">
                    <span class="ep-stars">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        :width="11"
                        :height="11"
                        viewBox="0 0 12 12"
                        :fill="i <= roundRating(product.rating) ? '#f5a623' : '#e0e0e0'"
                      >
                        <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z"/>
                      </svg>
                    </span>
                    <span class="ep-reviews">({{ product.reviews.toLocaleString() }})</span>
                    <span class="ep-sep">|</span>
                    <span class="ep-orig-price">{{ product.originalPrice }}</span>
                    <span class="ep-price">{{ product.price }}</span>
                    <span class="ep-sep">|</span>
                    <span class="ep-stock">In stock</span>
                    <span class="ep-sep">|</span>
                    <span class="ep-asin">ASIN：{{ product.asin }}</span>
                  </div>
                </div>
              </div>
              <button
                class="eb-exclude-btn"
                type="button"
                @click="toggleProduct(product)"
              >
                {{ isExcluded(product.id) ? 'Added' : 'Exclude' }}
              </button>
            </div>
            <p v-if="filteredProducts.length === 0" class="ep-empty">No products found.</p>
          </div>
        </template>

        <template v-else-if="leftTab === 'enter'">
          <div class="ep-enter-block">
            <textarea
              v-model="enterListText"
              class="ep-enter-textarea"
              placeholder="Enter ASIN separated by new line"
              rows="8"
            />
            <div class="ep-enter-bottom-row">
              <div v-if="!showUploadTab" class="ep-enter-upload-side">
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  class="ep-file-hidden"
                  @change="onUploadFile"
                />
                <div class="ep-enter-file-actions">
                  <button type="button" class="ep-upload-lite" @click="triggerFilePick">
                    Upload file
                  </button>
                  <button type="button" class="ep-download-template" @click="downloadTemplate">
                    <Download class="ep-download-template__icon" :size="14" :stroke-width="2" aria-hidden="true" />
                    Download the XLSX template
                  </button>
                </div>
              </div>
              <div class="ep-enter-actions">
                <UiButton type="button" size="sm" variant="default" @click="commitEnterList">
                  Add products
                </UiButton>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="leftTab === 'upload'">
          <div class="ep-upload-panel">
            <input
              ref="fileInputRef"
              type="file"
              accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              class="ep-file-hidden"
              @change="onUploadFile"
            />
            <div class="ep-enter-file-actions">
              <button type="button" class="ep-upload-lite" @click="triggerFilePick">
                Upload file
              </button>
              <button type="button" class="ep-download-template" @click="downloadTemplate">
                <Download class="ep-download-template__icon" :size="14" :stroke-width="2" aria-hidden="true" />
                Download the XLSX template
              </button>
            </div>
          </div>
        </template>
      </div>

      <div class="ep-work-right">
        <div v-if="list.length === 0" class="ep-empty-block ep-empty-block--kw">
          <div class="ep-empty-illus" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="10" width="44" height="32" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
              <path d="M14 26h28M14 33h18" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M36 38l6 6M42 38l-6 6" stroke="var(--primary,#1876ff)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </svg>
          </div>
          <p class="ep-empty-text">尚未添加商品</p>
          <p class="ep-empty-hint">从左侧添加商品</p>
        </div>

        <div v-else class="ep-added-table-wrap ep-added-table-wrap--shell">
          <table class="ep-added-table">
            <thead>
              <tr>
                <th>Product</th>
                <th class="ep-action-col" aria-label="Action"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id">
                <td class="ep-col-product">
                  <template v-if="row.manual">
                    <input
                      :id="'ep-asin-' + row.id"
                      :value="row.asin"
                      class="ep-asin-input"
                      type="text"
                      placeholder="Enter ASIN (e.g. B08Q6LV5CR)"
                      @input="updateRow(row.id, { asin: $event.target.value })"
                      @keydown.enter.prevent="commitManualAsin(row)"
                      @blur="commitManualAsin(row)"
                    />
                  </template>
                  <template v-else>
                    <div class="ep-added-product">
                      <div class="ep-added-thumb">
                        <img v-if="row.image" :src="row.image" :alt="row.title" />
                        <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                          <rect width="40" height="40" rx="4" fill="#f3f5f8"/>
                          <rect x="10" y="12" width="20" height="16" rx="2" stroke="#c8cdd4" stroke-width="1.2" fill="none"/>
                          <circle cx="15" cy="18" r="2" fill="#c8cdd4"/>
                          <path d="M10 24l5-4 4 3 4-3 7 5" stroke="#c8cdd4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div class="ep-added-info">
                        <p v-if="row.title" class="ep-added-title">{{ row.title }}</p>
                        <p class="ep-added-meta">ASIN: {{ row.asin }}</p>
                      </div>
                    </div>
                  </template>
                </td>
                <td class="ep-action-col">
                  <button type="button" class="ep-remove-btn" aria-label="Remove" @click="removeRow(row.id)">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-vue-next'
import UnderlineTabs from '@/components/ui/UnderlineTabs.vue'
import UiButton from '@/components/ui/button/Button.vue'
import iconHelpCircle from '@/assets/icon-help-circle.svg'

/**
 * Exclude products 卡片：SP / SB 共用，行结构兼容 SP 旧实现
 *  - 原 mock 结构 { id, asin, title, image, rating, reviews, originalPrice, price, manual?, bid? }
 *  - manual=true 表示从 Enter list 输入但未识别的 ASIN，提供可编辑文本框
 *  - list / update:list 受控当前行集合（由父级注入 form.excludedProducts）
 */
const props = defineProps({
  list: { type: Array, default: () => [] },
  anchorId: { type: String, default: 'section-negative-product' },
})

const emit = defineEmits(['update:list'])

function emitList(next) {
  emit('update:list', next)
}

/* ── Mock catalog（与 SP 原值保持一致，便于演示） ── */
const MOCK_PRODUCTS = [
  { id: 'B0C5CV8CTW', image: 'https://m.media-amazon.com/images/I/81G+4gzszVL._AC_SY879_.jpg', title: 'Dreo Ceramic Heater, 2025 Winter Mode, Small, Electric Stove, Automatic Temperature Adjustment and Timer Function, Fall Off, Overheating Protection, Memory Function, 1,200 W/1,000 W/800 W, Power, Eco', rating: 4.5, reviews: 16346, originalPrice: 'US$41.22', price: 'US$39.25', asin: 'B0C5CV8CTW' },
  { id: 'B09XK2DTVP', image: 'https://m.media-amazon.com/images/I/71pB9RvWyRL._AC_SL1500_.jpg', title: 'Vornado MVH Vortex Heater with 3 Heat Settings, Fan Circulator, Auto Climate Control, and Safety Tip-Over Protection', rating: 4.4, reviews: 8921, originalPrice: 'US$59.99', price: 'US$49.99', asin: 'B09XK2DTVP' },
  { id: 'B08BDRG9WR', image: 'https://m.media-amazon.com/images/I/71zb9zUZLKL._AC_SL1500_.jpg', title: 'Lasko 5775 Electric 1500W Bathroom Space Heater with Fan & Adjustable Thermostat for Home', rating: 4.3, reviews: 12450, originalPrice: 'US$45.00', price: 'US$38.99', asin: 'B08BDRG9WR' },
  { id: 'B07WNKRP8V', image: 'https://m.media-amazon.com/images/I/61e7RvINXUL._AC_SL1500_.jpg', title: 'De\'Longhi Ceramic Tower Heater, Full Room Quiet 1500W, Adjustable Thermostat, 3 Heat Settings, Energy Saving Mode, Remote Control', rating: 4.5, reviews: 5320, originalPrice: 'US$89.99', price: 'US$74.99', asin: 'B07WNKRP8V' },
  { id: 'B09G9TQ71Z', image: 'https://m.media-amazon.com/images/I/71Q9U8RBCBL._AC_SL1500_.jpg', title: 'GiveBest Portable Electric Space Heater, 1500W/750W ETL Certified Ceramic Heater with Thermostat, Safe Plug-in Wall Heater with Overheat Protection', rating: 4.2, reviews: 9876, originalPrice: 'US$29.99', price: 'US$24.99', asin: 'B09G9TQ71Z' },
]

/* ── Search ── */
const leftTab = ref('enter')
const showUploadTab = true
const leftTabs = [
  { id: 'enter', label: 'Enter list' },
  { id: 'search', label: 'Search' },
  { id: 'upload', label: 'Upload' },
]

const searchQuery = ref('')

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return MOCK_PRODUCTS
  return MOCK_PRODUCTS.filter(
    (p) => p.title.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q)
  )
})

function isExcluded(id) {
  return props.list.some((p) => p.id === id)
}

function toggleProduct(product) {
  if (isExcluded(product.id)) {
    emitList(props.list.filter((p) => p.id !== product.id))
  } else {
    emitList([...props.list, { ...product, bid: 0.02, manual: false }])
  }
}

function roundRating(r) {
  return Math.round(r)
}

/* ── Enter list ── */
const enterListText = ref('')
const fileInputRef = ref(null)

function triggerFilePick() {
  fileInputRef.value?.click()
}

function normalizeUploadText(raw) {
  return raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function workbookFirstColumnLinesRaw(wb) {
  const sn = wb.SheetNames[0]
  if (!sn) return ''
  const ws = wb.Sheets[sn]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  return rows
    .map((r) => String(Array.isArray(r) ? r[0] : ''))
    .filter((cell) => cell.length > 0)
    .join('\n')
}

function parseAsinLine(line) {
  const raw = String(line || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  if (raw.length !== 10) return ''
  return /^[A-Z0-9]{10}$/.test(raw) ? raw : ''
}

function asinDedupeKey(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function nextBulkId() {
  return `ep-bulk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function addEnterListLines(sourceText, fromUpload = false) {
  const lines = fromUpload
    ? normalizeUploadText(sourceText)
        .split('\n')
        .map((l) => l.replace(/\r$/, ''))
        .filter((l) => l !== '')
    : sourceText.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length === 0) return

  const next = [...props.list]
  const seen = new Set()

  for (const line of lines) {
    if (fromUpload) {
      if (seen.has(line)) continue
      seen.add(line)
      const dup = next.some((p) => p.asin === line)
      if (dup) continue
      const norm = asinDedupeKey(line)
      const mock =
        norm.length === 10 ? MOCK_PRODUCTS.find((p) => p.asin.toUpperCase() === norm) : null
      const id = nextBulkId()
      if (mock) {
        next.push({ ...mock, id, asin: line, bid: 0.02, manual: false })
      } else {
        next.push({ id, asin: line, title: '', image: '', bid: 0.02, manual: false })
      }
      continue
    }

    const asin = parseAsinLine(line)
    if (!asin || seen.has(asin)) continue
    seen.add(asin)
    const dup = next.some((p) => (p.asin || '').toUpperCase() === asin)
    if (dup) continue
    const mock = MOCK_PRODUCTS.find((p) => p.asin.toUpperCase() === asin)
    if (mock) {
      next.push({ ...mock, bid: 0.02, manual: false })
    } else {
      next.push({ id: nextBulkId(), asin, title: '', image: '', bid: 0.02, manual: false })
    }
  }

  emitList(next)
}

function commitEnterList() {
  addEnterListLines(enterListText.value, false)
  enterListText.value = ''
}

async function onUploadFile(ev) {
  const input = ev.target
  const file = input.files?.[0]
  if (!file) return
  const lower = file.name.toLowerCase()
  const type = file.type || ''
  try {
    let out = ''
    const isXlsx =
      lower.endsWith('.xlsx') ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const isXls = lower.endsWith('.xls') || type === 'application/vnd.ms-excel'
    const isCsv = lower.endsWith('.csv') || type === 'text/csv'
    const isTsv = lower.endsWith('.tsv') || type === 'text/tab-separated-values'

    if (isXlsx || isXls) {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      out = workbookFirstColumnLinesRaw(wb)
    } else if (isCsv) {
      const text = normalizeUploadText(await file.text())
      const wb = XLSX.read(text, { type: 'string' })
      out = workbookFirstColumnLinesRaw(wb)
    } else if (isTsv) {
      const text = normalizeUploadText(await file.text())
      out = text
        .split('\n')
        .map((line) => (line.split('\t')[0] ?? '').replace(/\r$/, ''))
        .filter((cell) => cell.length > 0)
        .join('\n')
    } else {
      out = normalizeUploadText(await file.text())
    }
    if (out.trim()) addEnterListLines(out, true)
  } catch {
    /* ignore */
  }
  input.value = ''
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([['ASIN']])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, 'exclude-product-asin-import-template.xlsx')
}

/* ── Added rows ── */
function updateRow(id, patch) {
  emitList(props.list.map((row) => (row.id === id ? { ...row, ...patch } : row)))
}

function commitManualAsin(row) {
  const asin = (row.asin || '').trim().toUpperCase()
  if (!asin) {
    emitList(props.list.filter((p) => p.id !== row.id))
    return
  }
  updateRow(row.id, { asin, manual: false })
}

function removeRow(id) {
  emitList(props.list.filter((p) => p.id !== id))
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

/* ── 通栏工作台 ── */
.ep-product-section .ep-work {
  --neg-target-pad-x: 32px;
  --ep-list-surface: #f8f8f8;
  --ep-list-hover: #f0f0f0;
  display: grid;
  grid-template-columns: minmax(0, 46%) 1fr;
  grid-template-rows: auto 1fr;
  min-height: 520px;
  width: calc(100% + 2 * var(--neg-target-pad-x));
  margin-left: calc(-1 * var(--neg-target-pad-x));
  margin-right: calc(-1 * var(--neg-target-pad-x));
  background: var(--bg-card);
  border-radius: 0;
  overflow: hidden;
  box-sizing: border-box;
  border-top: 1px solid var(--border);
}

.ep-product-section .ep-work-tabs {
  grid-column: 1;
  grid-row: 1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px 20px 0;
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  box-sizing: border-box;
}

.ep-product-section .ep-work-tabs :deep(.underline-tabs) {
  width: 100%;
}

.ep-product-section .ep-work-tabs :deep(.underline-tabs--lg .underline-tabs__trigger) {
  padding: 0 0 14px;
}

.ep-product-section .ep-work-head {
  grid-column: 2;
  grid-row: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  box-sizing: border-box;
}

.ep-product-section .ep-work-added-title {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.ep-product-section .ep-work-left {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  box-sizing: border-box;
}

.ep-product-section .ep-work-right {
  grid-column: 2;
  grid-row: 2;
  min-width: 300px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-sizing: border-box;
}

.remove-all-text-btn {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-sub);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.25;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;
}

.remove-all-text-btn:hover {
  color: #ef4444;
}

.ep-product-section .ep-work-left .ep-search-bar {
  padding: 18px 20px 16px;
}

.ep-product-section .ep-work-left .ep-enter-block {
  flex: 1;
  min-height: 0;
  padding: 18px 20px 14px;
}

.ep-product-section .ep-work-left .ep-results {
  flex: 1;
  min-height: 0;
}

.ep-product-section .ep-work-right .ep-empty-block--kw {
  flex: 1;
  min-height: 200px;
  padding: 40px 20px;
  box-sizing: border-box;
}

.ep-product-section .ep-work-right .ep-empty-block--kw .ep-empty-text {
  margin: 10px 0 4px;
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
}

.ep-product-section .ep-work-right .ep-empty-block--kw .ep-empty-hint {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  text-align: center;
  line-height: 1.5;
}

.ep-product-section .ep-added-table-wrap--shell {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 20px 14px;
  box-sizing: border-box;
}

/* ── Enter list ── */
.ep-enter-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 0;
  box-sizing: border-box;
}

.ep-enter-textarea {
  flex: 1;
  min-height: 120px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: var(--text-base, 14px);
  color: #111;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.ep-enter-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.ep-enter-textarea::placeholder {
  color: #9ca3af;
}

.ep-enter-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.ep-enter-upload-side {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ep-upload-panel {
  position: relative;
  padding: 18px 20px;
}

.ep-file-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.ep-enter-file-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.ep-upload-lite {
  margin: 0;
  padding: 6px 10px;
  border: 1px dashed #c4c9d4;
  border-radius: 3px;
  background: var(--gray-50, #f8fafc);
  color: var(--text-sub, #6b7280);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.ep-upload-lite:hover {
  border-color: var(--primary, #1d4ed8);
  color: var(--primary, #1d4ed8);
  background: #fff;
}

.ep-download-template {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 4px 2px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--text-main, #374151);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, opacity 0.15s;
}

.ep-download-template:hover {
  color: var(--primary, #1d4ed8);
}

.ep-download-template:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.ep-download-template__icon {
  flex-shrink: 0;
  color: inherit;
}

.ep-enter-actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Search ── */
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

.ep-product-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: var(--ep-list-surface);
  cursor: default;
  transition: border-color 0.15s, background 0.15s;
}
.ep-product-row:hover:not(.selected) { background: var(--ep-list-hover); }
.ep-product-row.selected {
  background: #fff;
  border-color: var(--selected-border);
}

.ep-product-row .eb-exclude-btn {
  align-self: center;
  flex-shrink: 0;
}

/* ── Added table ── */
.ep-added-table-wrap {
  flex: 1;
  overflow-y: auto;
}

.ep-added-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.ep-added-table thead tr {
  background: #f8f9fb;
  border-bottom: 1px solid #e2e8f0;
}

.ep-added-table th {
  height: 44px;
  padding: 0 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  vertical-align: middle;
}

.ep-added-table td {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-main);
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.ep-added-table tbody tr:last-child td { border-bottom: none; }
.ep-added-table tbody tr:hover { background: rgba(0,0,0,0.02); }

.ep-col-product { width: auto; }
.ep-action-col { width: 36px; text-align: center; }

.ep-added-product {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.ep-added-thumb {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f3f5f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ep-added-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ep-added-info {
  min-width: 0;
  flex: 1;
}

.ep-added-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ep-added-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-hint);
}

.ep-asin-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-main);
  padding: 0 4px;
}

.ep-asin-input::placeholder { color: #c0c8d8; }

.ep-remove-btn {
  background: none;
  border: none;
  color: var(--text-hint);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: inherit;
  transition: color 0.15s;
}

.ep-remove-btn:hover { color: #ef4444; }

/* Empty states */
.ep-empty-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 16px;
  gap: 8px;
}

.ep-empty-illus { opacity: 0.6; }

.ep-empty-text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub);
}

.ep-empty-hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-hint);
  text-align: center;
}

/* Product card shared */
.ep-product-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.ep-thumb {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--ep-list-surface);
}

.ep-thumb-bg {
  position: absolute;
  inset: 0;
  background: var(--ep-list-surface);
}

.ep-thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ep-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ep-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.ep-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.45;
}

.ep-stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.ep-reviews { color: #1876ff; }
.ep-sep { color: #d0d0d0; }
.ep-orig-price { color: #999; text-decoration: line-through; }
.ep-price { color: #fe4041; font-weight: 500; }
.ep-stock { color: #999; }
.ep-asin { color: #999; }

.ep-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* Exclude button used by product list */
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
</style>
