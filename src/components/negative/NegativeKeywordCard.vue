<template>
  <section :id="anchorId" class="card ep-card nk-product-section">
    <h3 class="section-title">
      Negative keyword
      <span class="help-wrap">
        <img :src="iconHelpCircle" alt="" width="16" height="16" class="help-icon" />
        <span class="help-tooltip">
          Add negative keywords to prevent your ads from showing for irrelevant searches.
        </span>
      </span>
    </h3>

    <div class="nk-work">
      <div class="nk-work-lead">
        <h4 class="nk-enter-heading">Enter list</h4>
      </div>

      <div class="nk-work-head">
        <span class="nk-work-added-title">{{ list.length }} added</span>
        <button
          v-if="list.length > 0"
          type="button"
          class="remove-all-text-btn"
          @click="removeAll"
        >
          Remove all
        </button>
      </div>

      <div class="nk-work-left">
        <div class="nk-enter-block">
          <div class="nk-enter-match-row">
            <span class="nk-enter-match-label">Match type</span>
            <label class="nk-radio">
              <input v-model="enterMatchType" type="radio" value="Negative Exact" />
              Negative exact
            </label>
            <label class="nk-radio">
              <input v-model="enterMatchType" type="radio" value="Negative Phrase" />
              Negative phrase
            </label>
          </div>
          <textarea
            v-model="enterListText"
            class="nk-enter-textarea"
            placeholder="Enter keyword separated by new line"
            rows="8"
          />
          <div class="nk-enter-bottom-row">
            <div class="nk-enter-upload-side">
              <input
                ref="fileInputRef"
                type="file"
                accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                class="nk-file-hidden"
                @change="onUploadFile"
              />
              <div class="nk-enter-file-actions">
                <button type="button" class="nk-upload-lite" @click="triggerFilePick">
                  Upload file
                </button>
                <button type="button" class="nk-download-template" @click="downloadTemplate">
                  <Download class="nk-download-template__icon" :size="14" :stroke-width="2" aria-hidden="true" />
                  Download the XLSX template
                </button>
              </div>
            </div>
            <div class="nk-enter-actions">
              <UiButton type="button" size="sm" variant="default" @click="commitEnterList">
                Add keywords
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <div class="nk-work-right">
        <div v-if="list.length === 0" class="nk-empty-block nk-empty-block--kw">
          <div class="nk-empty-illus" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="10" width="44" height="32" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
              <path d="M14 26h28M14 33h18" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M36 38l6 6M42 38l-6 6" stroke="var(--primary,#1876ff)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </svg>
          </div>
          <p class="nk-empty-text">尚未添加否定关键词</p>
          <p class="nk-empty-hint">从左侧输入或上传添加</p>
        </div>

        <div v-else class="kw-table-wrap nk-kw-table-wrap nk-table-wrap--shell">
          <table class="kw-table">
            <thead>
              <tr>
                <th class="col-kw">Keyword</th>
                <th class="col-match">Match type</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id">
                <td class="col-kw">
                  <input
                    :id="'negative-kw-' + row.id"
                    :value="row.keyword"
                    class="kw-input"
                    type="text"
                    placeholder="Enter Negative keyword"
                    @input="updateRow(row.id, { keyword: $event.target.value })"
                  />
                </td>
                <td class="col-match">
                  <div class="match-select-wrap">
                    <select
                      :value="row.matchType"
                      class="match-select"
                      @change="updateRow(row.id, { matchType: $event.target.value })"
                    >
                      <option value="Negative Exact">Negative Exact</option>
                      <option value="Negative Phrase">Negative Phrase</option>
                    </select>
                    <svg class="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </td>
                <td class="col-action">
                  <button class="delete-btn" type="button" @click="removeRow(row.id)">Delete</button>
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
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-vue-next'
import UiButton from '@/components/ui/button/Button.vue'
import iconHelpCircle from '@/assets/icon-help-circle.svg'

/**
 * Negative keyword 卡片：SP / SB 共用，行结构 { id, keyword, matchType }
 *  - list / update:list 受控当前行集合，由父级注入 store 字段（如 form.negativeKeywords）
 *  - anchorId 仅用于父级 IntersectionObserver / Stepper 跳转
 */
const props = defineProps({
  list: { type: Array, default: () => [] },
  anchorId: { type: String, default: 'section-negative-keyword' },
})

const emit = defineEmits(['update:list'])

function emitList(next) {
  emit('update:list', next)
}

/* ── 当前 enter list 草稿 ── */
const enterListText = ref('')
const enterMatchType = ref('Negative Exact')
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

function nextId() {
  return `nk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function addEnterListLines(sourceText, fromUpload = false) {
  const mt = enterMatchType.value
  const lines = fromUpload
    ? normalizeUploadText(sourceText)
        .split('\n')
        .map((l) => l.replace(/\r$/, ''))
        .filter((l) => l !== '')
    : sourceText.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length === 0) return

  const next = [...props.list]
  for (const keyword of lines) {
    const exists = fromUpload
      ? next.some((k) => k.keyword === keyword && k.matchType === mt)
      : next.some(
          (k) => k.keyword.trim().toLowerCase() === keyword.toLowerCase() && k.matchType === mt
        )
    if (exists) continue
    next.push({ id: nextId(), keyword, matchType: mt })
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
  const ws = XLSX.utils.aoa_to_sheet([['Keyword']])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keywords')
  XLSX.writeFile(wb, 'negative-keyword-import-template.xlsx')
}

/* ── 已添加列表行操作 ── */
function updateRow(id, patch) {
  const next = props.list.map((row) => (row.id === id ? { ...row, ...patch } : row))
  emitList(next)
}

function removeRow(id) {
  emitList(props.list.filter((row) => row.id !== id))
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

/* ── 通栏工作台（与 SP Negative keyword 同构） ── */
.nk-product-section .nk-work {
  --neg-target-pad-x: 32px;
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

.nk-product-section .nk-work-lead {
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

.nk-product-section .nk-work-lead .nk-enter-heading {
  margin: 0;
  padding-bottom: 14px;
  font-size: var(--text-lg, 16px);
  font-weight: 600;
  color: var(--text-main);
}

.nk-product-section .nk-work-left .nk-enter-block {
  flex: 1;
  min-height: 0;
  padding: 18px 20px 14px;
}

.nk-product-section .nk-work-head {
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

.nk-product-section .nk-work-added-title {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.nk-product-section .nk-work-left {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  box-sizing: border-box;
}

.nk-product-section .nk-work-right {
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

.nk-product-section .nk-work-right .nk-empty-block--kw {
  flex: 1;
  min-height: 200px;
  padding: 40px 20px;
  box-sizing: border-box;
}

.nk-product-section .nk-work-right .nk-empty-block--kw .nk-empty-text {
  margin: 10px 0 4px;
  font-size: var(--text-base, 14px);
  font-weight: 600;
  color: var(--text-main);
}

.nk-product-section .nk-work-right .nk-empty-block--kw .nk-empty-hint {
  margin: 0;
  font-size: var(--text-sm, 13px);
  color: var(--text-sub);
  text-align: center;
  line-height: 1.5;
}

.nk-product-section .nk-table-wrap--shell {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 20px 14px;
  box-sizing: border-box;
}

/* ── Enter list ── */
.nk-enter-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nk-enter-match-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
}

.nk-enter-match-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-sub);
  white-space: nowrap;
}

.nk-radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  font-family: inherit;
}

.nk-radio input {
  width: 14px;
  height: 14px;
  accent-color: var(--primary, #1d4ed8);
  cursor: pointer;
}

.nk-enter-textarea {
  flex: 1;
  min-height: 140px;
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

.nk-enter-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.nk-enter-textarea::placeholder {
  color: #9ca3af;
}

.nk-enter-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.nk-enter-upload-side {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.nk-file-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.nk-enter-file-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.nk-upload-lite {
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

.nk-upload-lite:hover {
  border-color: var(--primary, #1d4ed8);
  color: var(--primary, #1d4ed8);
  background: #fff;
}

.nk-download-template {
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

.nk-download-template:hover {
  color: var(--primary, #1d4ed8);
}

.nk-download-template:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.nk-download-template__icon {
  flex-shrink: 0;
  color: inherit;
}

.nk-enter-actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Table ── */
.kw-table-wrap {
  width: 100%;
  overflow: hidden;
}

.kw-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  caption-side: bottom;
}

.kw-table thead tr {
  background: #f8f9fb;
  border-bottom: 1px solid #e2e8f0;
}

.kw-table th {
  height: 48px;
  padding: 0 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  vertical-align: middle;
}

.kw-table td {
  padding: 12px 16px;
  font-size: 16px;
  color: #0f172a;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.kw-table tbody tr:last-child td { border-bottom: none; }
.kw-table tbody tr:hover { background: rgba(0,0,0,0.025); }

.col-kw     { width: 30%; }
.col-match  { width: 200px; }
.col-action { width: 72px; text-align: right; }

.kw-input {
  width: 100%;
  height: 36px;
  border: none;
  padding: 0 4px;
  font-size: 16px;
  font-family: inherit;
  color: #111;
  background: transparent;
  box-sizing: border-box;
  outline: none;
}

.kw-input::placeholder { color: #c0c8d8; }

.match-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.match-select {
  appearance: none;
  height: 32px;
  border: none;
  padding: 0 24px 0 0;
  font-size: 16px;
  font-family: inherit;
  color: #374151;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.select-chevron {
  position: absolute;
  right: 0;
  pointer-events: none;
  color: #94a3b8;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--text-sub);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s;
}

.delete-btn:hover {
  color: #ef4444;
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

/* ── Empty state ── */
.nk-empty-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 16px;
  gap: 8px;
}

.nk-empty-illus {
  opacity: 0.6;
}
</style>
