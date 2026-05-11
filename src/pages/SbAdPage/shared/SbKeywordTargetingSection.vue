<template>
  <section id="section-sb-keyword-targeting" class="card">
    <h2>Keyword Targeting</h2>

    <div class="kt-shell kt-shell--bleed">
      <div class="kt-tabs-row">
        <UnderlineTabs v-model="form.keywordTargetTab" :items="tabs" size="lg" />
      </div>

      <div class="kt-right-head">
        <span class="added-title">{{ form.keywords.length }} added</span>
        <button
          v-if="form.keywords.length > 0"
          type="button"
          class="remove-all-text-btn"
          @click="removeAllAdded"
        >
          Remove all
        </button>
      </div>

      <div class="kt-left-stack">
        <div v-if="form.keywordTargetTab === 'enter'" class="kt-toolbar">
          <div class="toolbar-field">
            <span class="toolbar-label">Custom Bid</span>
            <div class="enter-bid-wrap">
              <InlineNumberInput v-model="enterBid" :step="0.01" suffix="USD" size="default" />
            </div>
          </div>
          <div class="toolbar-field match-types">
            <span class="toolbar-label">Match type</span>
            <label class="chk"><UiCheckbox v-model="enterMatchTypes.exact" /> Exact</label>
            <label class="chk"><UiCheckbox v-model="enterMatchTypes.phrase" /> Phrase</label>
            <label class="chk"><UiCheckbox v-model="enterMatchTypes.broad" /> Broad</label>
          </div>
        </div>

        <div v-if="form.keywordTargetTab === 'amazon'" class="kt-toolbar">
          <div class="toolbar-field">
            <span class="toolbar-label">Custom Bid</span>
            <div class="enter-bid-wrap">
              <InlineNumberInput v-model="form.keywordTargetingDefaultBid" :step="0.01" suffix="USD" size="default" />
            </div>
          </div>
          <div class="toolbar-field match-types">
            <span class="toolbar-label">Match type</span>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.exact" /> Exact</label>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.phrase" /> Phrase</label>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.broad" /> Broad</label>
          </div>
        </div>

        <div v-if="form.keywordTargetTab === 'enter'" class="kt-panel kt-panel--enter">
          <textarea
            v-model="enterListText"
            class="enter-textarea"
            placeholder="Enter keyword separated by new line"
            rows="10"
          />
          <div class="enter-bottom-row">
            <div v-if="!showUploadTab" class="enter-upload-side">
              <input
                ref="enterFileInput"
                type="file"
                accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                class="enter-file-input-hidden"
                @change="onEnterListFile"
              />
              <div class="enter-file-actions">
                <button type="button" class="enter-upload-lite" @click="triggerEnterFilePick">Upload file</button>
                <button type="button" class="enter-download-template" @click="downloadEnterListTemplate">
                  <Download :size="14" :stroke-width="2" />
                  Download the XLSX template
                </button>
              </div>
            </div>
            <div class="enter-actions">
              <UiButton type="button" size="sm" variant="default" @click="commitEnterList">Add keywords</UiButton>
            </div>
          </div>
        </div>

        <div v-else-if="form.keywordTargetTab === 'upload'" class="kt-panel kt-panel--upload">
          <input
            ref="enterFileInput"
            type="file"
            accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            class="enter-file-input-hidden"
            @change="onEnterListFile"
          />
          <div class="upload-panel-card">
            <button type="button" class="enter-upload-lite" @click="triggerEnterFilePick">Upload file</button>
            <button type="button" class="enter-download-template" @click="downloadEnterListTemplate">
              <Download :size="14" :stroke-width="2" />
              Download the XLSX template
            </button>
          </div>
        </div>

        <div v-else-if="form.keywordTargetTab === 'amazon'" class="kt-panel">
          <table class="data-table data-table--kw-stack">
            <thead>
              <tr>
                <th class="kw-stack-th">
                  <span class="kw-stack-th__primary">Keyword</span>
                  <span class="kw-stack-th__secondary">
                    IS | IR
                    <span class="kw-isir-wrap">
                      <button
                        type="button"
                        class="kw-stack-th__info"
                        aria-label="About impression share (IS) and impression rate (IR)"
                      >
                        <img :src="iconHelpCircle" width="14" height="14" alt="" />
                      </button>
                      <span class="kw-isir-tooltip">
                        <strong>Impression share (IS)</strong> is the percentage of impressions
                        you're getting on this term relative to all the impressions it is
                        generating.<br /><br />
                        <strong>Impression rank (IR)</strong> is where your IS stands relative
                        to other advertisers' share of impressions for the same term.<br /><br />
                        Use these to understand your impression coverage and help you decide
                        how much to bid.
                      </span>
                    </span>
                  </span>
                </th>
                <th>Match type</th>
                <th>Suggested bid</th>
                <th class="action-col"></th>
              </tr>
            </thead>
            <tbody>
              <template v-if="amazonTableGroups.length === 0">
                <tr>
                  <td colspan="4" class="kt-match-empty">Select at least one match type above to see suggestions.</td>
                </tr>
              </template>
              <template v-else>
                <template v-for="group in amazonTableGroups" :key="group.base.id">
                  <tr v-for="(line, lineIdx) in group.lines" :key="line.rowKey">
                    <td v-if="lineIdx === 0" :rowspan="group.lines.length" class="kw-stack-td kw-stack-td--rowspan">
                      <p class="cell-title kw-stack-td__title">{{ group.base.text }}</p>
                      <p class="kw-stack-td__meta">IS: {{ group.base.is }} | IR: {{ group.base.ir }}</p>
                    </td>
                    <td>{{ line.matchType }}</td>
                    <td>
                      <div class="sugg-main">{{ line.suggestBid }}</div>
                      <div class="sugg-range">{{ line.suggestRange }}</div>
                    </td>
                    <td class="action-col">
                      <button
                        type="button"
                        class="eb-exclude-btn"
                        :disabled="isAdded(group.base.text, line.matchType)"
                        @click="addFromRow({ text: group.base.text, is: group.base.is, ir: group.base.ir, matchType: line.matchType, suggestBid: line.suggestBid, suggestRange: line.suggestRange })"
                      >
                        {{ isAdded(group.base.text, line.matchType) ? 'Added' : 'Add' }}
                      </button>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>

        <div v-else-if="form.keywordTargetTab === 'campaigns'" class="kt-panel kt-panel--campaigns">
          <div class="filters-row">
            <label class="filter-field">
              <span class="toolbar-label">Campaign</span>
              <div class="filter-ui-select">
                <UiSelect v-model="form.keywordSelectedCampaignId" placeholder="Select campaign" :options="keywordCampaignSelectOptions" />
              </div>
            </label>
            <label class="filter-field">
              <span class="toolbar-label">Ad group</span>
              <div class="filter-ui-select">
                <UiSelect v-model="form.keywordSelectedAdGroupId" placeholder="Select ad group" :options="keywordAdGroupSelectOptions" :disabled="!form.keywordSelectedCampaignId" />
              </div>
            </label>
          </div>
          <div class="campaigns-match-row toolbar-field match-types">
            <span class="toolbar-label">Match type</span>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.exact" /> Exact</label>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.phrase" /> Phrase</label>
            <label class="chk"><UiCheckbox v-model="form.keywordTargetingMatchTypes.broad" /> Broad</label>
          </div>
          <div v-if="!form.keywordSelectedCampaignId || !form.keywordSelectedAdGroupId" class="empty-block">
            <div class="empty-illus" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="14" width="48" height="36" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
                <path d="M20 32h24M20 40h16" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="32" cy="24" r="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5"/>
              </svg>
            </div>
            <p class="empty-text">请先选择 Campaign 和 Ad Group</p>
            <p class="empty-hint">选择后将展示该广告组下的历史关键词</p>
          </div>
          <div v-else class="campaigns-table-stack">
            <div class="campaigns-table-scroll">
              <table class="data-table flat">
                <thead>
                  <tr>
                    <th class="narrow">
                      <UiCheckbox v-if="campaignSelectableRowKeys.length" :model-value="campaignAllSelectableSelected" @update:model-value="onCampaignSelectAll" />
                    </th>
                    <th>Keyword</th>
                    <th>Match type</th>
                    <th>Suggested bid</th>
                    <th class="action-col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="campaignTableGroups.length === 0">
                    <tr><td colspan="5" class="kt-match-empty">No keywords to display for this ad group.</td></tr>
                  </template>
                  <template v-else>
                    <template v-for="group in campaignTableGroups" :key="group.base.id">
                      <tr v-for="(line, lineIdx) in group.lines" :key="line.rowKey">
                        <td class="narrow">
                          <UiCheckbox :model-value="!!campaignSelected[line.rowKey]" :disabled="isAdded(group.base.text, line.matchType)" @update:model-value="(c) => toggleCampaignRow(line.rowKey, group.base.text, line.matchType, c)" />
                        </td>
                        <td v-if="lineIdx === 0" :rowspan="group.lines.length" class="kw-stack-td kw-stack-td--rowspan">
                          <p class="cell-title">{{ group.base.text }}</p>
                          <p class="cell-meta cell-meta--isir">IS: {{ group.base.is }} | IR: {{ group.base.ir }}</p>
                        </td>
                        <td>{{ line.matchType }}</td>
                        <td>
                          <div class="sugg-main">{{ line.suggestBid }}</div>
                          <div class="sugg-range">{{ line.suggestRange }}</div>
                        </td>
                        <td class="action-col">
                          <button type="button" class="eb-exclude-btn" :disabled="isAdded(group.base.text, line.matchType)" @click="addFromRow({ text: group.base.text, is: group.base.is, ir: group.base.ir, matchType: line.matchType, suggestBid: line.suggestBid, suggestRange: line.suggestRange })">
                            {{ isAdded(group.base.text, line.matchType) ? 'Added' : 'Add' }}
                          </button>
                        </td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </table>
            </div>
            <div v-if="campaignSelectedCount > 0" class="campaigns-bulk-actions">
              <UiButton type="button" size="sm" variant="default" @click="addSelectedCampaignRows">Add selected</UiButton>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-right-stack">
        <div v-if="form.keywords.length === 0" class="empty-block tight">
          <div class="empty-illus" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="6" y="10" width="44" height="32" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
              <path d="M14 26h28M14 33h18" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M36 38l6 6M42 38l-6 6" stroke="var(--primary,#1876ff)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </svg>
          </div>
          <p class="empty-text">尚未添加关键词</p>
          <p class="empty-hint">从左侧添加关键词</p>
        </div>
        <div v-else class="added-table-wrap">
          <table class="data-table added-table">
            <thead>
              <tr>
                <th class="kw-stack-th">
                  <span class="kw-stack-th__primary">Keyword</span>
                  <span class="kw-stack-th__secondary">
                    IS | IR
                    <span class="kw-isir-wrap">
                      <button
                        type="button"
                        class="kw-stack-th__info"
                        aria-label="About impression share (IS) and impression rate (IR)"
                      >
                        <img :src="iconHelpCircle" width="14" height="14" alt="" />
                      </button>
                      <span class="kw-isir-tooltip">
                        <strong>Impression share (IS)</strong> is the percentage of impressions
                        you're getting on this term relative to all the impressions it is
                        generating.<br /><br />
                        <strong>Impression rank (IR)</strong> is where your IS stands relative
                        to other advertisers' share of impressions for the same term.<br /><br />
                        Use these to understand your impression coverage and help you decide
                        how much to bid.
                      </span>
                    </span>
                  </span>
                </th>
                <th>Match type</th>
                <th>Suggested bid</th>
                <th>Bid</th>
                <th class="action-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kw in form.keywords" :key="kw.id">
                <td class="kw-stack-td">
                  <p class="cell-title kw-stack-td__title">{{ kw.text }}</p>
                  <p class="kw-stack-td__meta">IS: {{ kw.is ?? '—' }} | IR: {{ kw.ir ?? '—' }}</p>
                </td>
                <td>{{ kw.matchType }}</td>
                <td>
                  <div class="sugg-main">{{ kw.suggestBid ?? '—' }}</div>
                  <div class="sugg-range">{{ kw.suggestRange ?? '—' }}</div>
                </td>
                <td>
                  <span class="bid-input-wrap bid-input-wrap--minimal">
                    <span class="currency">$</span>
                    <input v-model.number="kw.bid" class="bid-input" type="number" step="0.01" min="0" :placeholder="Number(form.keywordTargetingDefaultBid).toFixed(2)" />
                  </span>
                </td>
                <td class="action-col">
                  <button type="button" class="icon-remove" @click="removeAdded(kw.id)">×</button>
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
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import { Download } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import UiButton from '@/components/ui/button/Button.vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiCheckbox from '@/components/ui/checkbox/Checkbox.vue'
import UnderlineTabs from '@/components/ui/UnderlineTabs.vue'
import InlineNumberInput from '@/components/base/InlineNumberInput.vue'
import iconHelpCircle from '@/assets/icon-help-circle.svg'

const { form } = storeToRefs(useSbStore())

const usesSuggestedKeywordTargetingLayout = computed(() => (
  form.value.adFormat === 'collections'
  || (
    form.value.adFormat === 'store_spotlight'
    && (
      (
        form.value.goals === 'drive_page_visits'
        && form.value.storeSpotlightManualTargetType === 'keyword'
      )
      || form.value.goals === 'brand_impression_share'
    )
  )
  || (
    form.value.adFormat === 'video'
    && (
      form.value.goals === 'brand_impression_share'
      || (
        (
          form.value.videoLandingType === 'product_detail'
          || form.value.videoLandingType === 'store'
        )
        && form.value.storeSpotlightManualTargetType === 'keyword'
      )
    )
  )
))
const showUploadTab = computed(() => usesSuggestedKeywordTargetingLayout.value)

const tabs = computed(() => {
  if (form.value.adFormat === 'collections' && form.value.targetingAuto) {
    return [
      { id: 'enter', label: 'Enter list' },
      { id: 'upload', label: 'Upload file' },
    ]
  }

  if (
    (form.value.adFormat === 'collections' && !form.value.targetingAuto)
    || (
      form.value.adFormat === 'store_spotlight'
      && (
        (
          form.value.goals === 'drive_page_visits'
          && form.value.storeSpotlightManualTargetType === 'keyword'
        )
        || form.value.goals === 'brand_impression_share'
      )
    )
    || (
      form.value.adFormat === 'video'
      && (
        form.value.goals === 'brand_impression_share'
        || (
          (
            form.value.videoLandingType === 'product_detail'
            || form.value.videoLandingType === 'store'
          )
          && form.value.storeSpotlightManualTargetType === 'keyword'
        )
      )
    )
  ) {
    return [
      { id: 'amazon', label: 'Suggested' },
      { id: 'enter', label: 'Enter list' },
      { id: 'upload', label: 'Upload file' },
    ]
  }

  return [
    { id: 'enter', label: 'Enter list' },
    { id: 'campaigns', label: 'Select from campaigns' },
    { id: 'amazon', label: 'Amazon Suggested' },
  ]
})

watch(
  tabs,
  (nextTabs) => {
    if (!nextTabs.some((tab) => tab.id === form.value.keywordTargetTab)) {
      form.value.keywordTargetTab = nextTabs[0]?.id ?? 'enter'
    }
  },
  { immediate: true }
)

const enterListText = ref('')
const enterFileInput = ref(null)
const enterBid = ref(form.value.keywordTargetingDefaultBid ?? 0.75)
const enterMatchTypes = ref({ exact: true, broad: false, phrase: false })

const DISPLAY_MATCH_ORDER = ['Phrase', 'Broad', 'Exact']

const amazonSuggestedRows = [
  { id: 'a1', text: 'space heaters indoor use', is: '14.2%', ir: 2, suggestByMatch: { Broad: { bid: '$1.45', range: '$1.12–$1.78' }, Phrase: { bid: '$1.40', range: '$1.08–$1.72' }, Exact: { bid: '$1.37', range: '$1.06–$1.76' } } },
  { id: 'a2', text: 'energy efficient electric heater', is: '11.8%', ir: 3, suggestByMatch: { Broad: { bid: '$1.22', range: '$0.95–$1.48' }, Phrase: { bid: '$1.17', range: '$0.91–$1.42' }, Exact: { bid: '$1.12', range: '$0.88–$1.41' } } },
  { id: 'a3', text: 'dreo portable heater', is: '10.5%', ir: 3, suggestByMatch: { Broad: { bid: '$1.08', range: '$0.82–$1.32' }, Phrase: { bid: '$1.02', range: '$0.78–$1.28' }, Exact: { bid: '$0.98', range: '$0.72–$1.22' } } },
]

const mockCampaigns = [
  { id: 'c1', name: 'SB Heaters Q1' },
  { id: 'c2', name: 'SB Brand Defense' },
]
const mockAdGroups = [
  { id: 'g1', campaignId: 'c1', name: 'Heaters – Exact' },
  { id: 'g2', campaignId: 'c1', name: 'Heaters – Broad' },
  { id: 'g3', campaignId: 'c2', name: 'Brand – Exact' },
]

const keywordCampaignSelectOptions = computed(() => mockCampaigns.map(c => ({ value: c.id, label: c.name })))
const filteredAdGroups = computed(() => mockAdGroups.filter(g => g.campaignId === form.value.keywordSelectedCampaignId))
const keywordAdGroupSelectOptions = computed(() => filteredAdGroups.value.map(g => ({ value: g.id, label: g.name })))

watch(() => form.value.keywordSelectedCampaignId, () => { form.value.keywordSelectedAdGroupId = '' })

function matchTypesFromToolbar() {
  const m = form.value.keywordTargetingMatchTypes
  return DISPLAY_MATCH_ORDER.filter(n => (n === 'Broad' ? m.broad : n === 'Phrase' ? m.phrase : m.exact))
}

const amazonTableGroups = computed(() => {
  const types = matchTypesFromToolbar()
  if (!types.length) return []
  return amazonSuggestedRows.map(base => ({
    base,
    lines: types.map(mt => {
      const s = base.suggestByMatch[mt]
      return { rowKey: `${base.id}-${mt}`, matchType: mt, suggestBid: s?.bid ?? '—', suggestRange: s?.range ?? '—' }
    }),
  }))
})

const campaignKeywordRows = computed(() => {
  if (!form.value.keywordSelectedCampaignId || !form.value.keywordSelectedAdGroupId) return []
  const gid = form.value.keywordSelectedAdGroupId
  const rows = [
    { id: 'ck1', text: 'small space heater', is: '14.2%', ir: 2, suggestByMatch: { Broad: { bid: '$0.98', range: '$0.72–$1.15' }, Phrase: { bid: '$0.92', range: '$0.68–$1.10' }, Exact: { bid: '$0.89', range: '$0.65–$1.08' } } },
    { id: 'ck2', text: 'quiet heater bedroom', is: '11.8%', ir: 3, suggestByMatch: { Broad: { bid: '$0.84', range: '$0.62–$1.02' }, Phrase: { bid: '$0.79', range: '$0.58–$0.98' }, Exact: { bid: '$0.76', range: '$0.55–$0.94' } } },
  ]
  if (gid === 'g1') return rows.map(r => ({ ...r, suggestByMatch: { Exact: r.suggestByMatch.Exact } }))
  if (gid === 'g2') return rows.map(r => ({ ...r, suggestByMatch: { Broad: r.suggestByMatch.Broad, Phrase: r.suggestByMatch.Phrase } }))
  return rows
})

const campaignTableGroups = computed(() => {
  const toolbarTypes = matchTypesFromToolbar()
  if (!toolbarTypes.length) return []
  return campaignKeywordRows.value.map(base => {
    const types = Object.keys(base.suggestByMatch).filter(mt => toolbarTypes.includes(mt))
    return { base, lines: types.map(mt => {
      const s = base.suggestByMatch[mt]
      return { rowKey: `${base.id}-${mt}`, matchType: mt, suggestBid: s?.bid ?? '—', suggestRange: s?.range ?? '—' }
    }) }
  }).filter(g => g.lines.length > 0)
})

const campaignSelected = ref({})
const campaignSelectableRowKeys = computed(() => {
  const keys = []
  for (const g of campaignTableGroups.value) {
    for (const line of g.lines) {
      if (!isAdded(g.base.text, line.matchType)) keys.push(line.rowKey)
    }
  }
  return keys
})
const campaignSelectedCount = computed(() => Object.values(campaignSelected.value).filter(Boolean).length)
const campaignAllSelectableSelected = computed(() => {
  const sel = campaignSelectableRowKeys.value
  return sel.length > 0 && sel.every(k => campaignSelected.value[k])
})

function toggleCampaignRow(rowKey, text, matchType, checked) {
  if (isAdded(text, matchType)) return
  const next = { ...campaignSelected.value }
  if (checked) next[rowKey] = true
  else delete next[rowKey]
  campaignSelected.value = next
}
function onCampaignSelectAll(checked) {
  if (checked) {
    const next = { ...campaignSelected.value }
    for (const k of campaignSelectableRowKeys.value) next[k] = true
    campaignSelected.value = next
  } else {
    campaignSelected.value = {}
  }
}
function addSelectedCampaignRows() {
  for (const g of campaignTableGroups.value) {
    for (const line of g.lines) {
      if (!campaignSelected.value[line.rowKey]) continue
      if (isAdded(g.base.text, line.matchType)) continue
      addFromRow({ text: g.base.text, is: g.base.is, ir: g.base.ir, matchType: line.matchType, suggestBid: line.suggestBid, suggestRange: line.suggestRange })
    }
  }
  campaignSelected.value = {}
}

function isAdded(text, matchType) {
  return form.value.keywords.some(k => k.text.toLowerCase() === text.trim().toLowerCase() && k.matchType === matchType)
}

function addFromRow(row) {
  const text = row.text.trim()
  if (!text || !row.matchType) return
  if (isAdded(text, row.matchType)) return
  form.value.keywords.push({
    id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    matchType: row.matchType,
    is: row.is ?? '—',
    ir: row.ir ?? '—',
    suggestBid: row.suggestBid ?? '—',
    suggestRange: row.suggestRange ?? '—',
    bid: form.value.keywordTargetingDefaultBid,
  })
}

function removeAdded(id) { form.value.keywords = form.value.keywords.filter(k => k.id !== id) }
function removeAllAdded() { form.value.keywords = [] }

function triggerEnterFilePick() { enterFileInput.value?.click() }

function downloadEnterListTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([['Keyword', 'Match type', 'Suggested bid'], ['tower fan', 'Phrase', '1.00']])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Keywords')
  XLSX.writeFile(wb, 'keyword-import-template.xlsx')
}

function addEnterListLines(sourceText) {
  const bid = enterBid.value || form.value.keywordTargetingDefaultBid
  const selectedTypes = ['exact', 'phrase', 'broad'].filter(t => enterMatchTypes.value[t]).map(t => t.charAt(0).toUpperCase() + t.slice(1))
  if (!selectedTypes.length) return
  sourceText.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
    selectedTypes.forEach(matchType => {
      if (isAdded(line, matchType)) return
      form.value.keywords.push({
        id: `kw-enter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: line,
        matchType,
        is: '—',
        ir: '—',
        suggestBid: '—',
        suggestRange: '—',
        bid,
      })
    })
  })
}

function commitEnterList() { addEnterListLines(enterListText.value); enterListText.value = '' }

async function onEnterListFile(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  try {
    const lower = file.name.toLowerCase()
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      addEnterListLines(rows.slice(1).map(r => String(r[0] ?? '').trim()).filter(Boolean).join('\n'))
    } else {
      const text = await file.text()
      addEnterListLines(text)
    }
  } catch { /* ignore */ }
  ev.target.value = ''
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

/* 与 StoreSpotlightContent / Collections 等卡片标题完全一致（padding 在 .card 上，不在 h2 上） */
h2 {
  margin: 0 0 16px;
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
}

.kt-shell {
  display: grid;
  grid-template-columns: minmax(0, 46%) 1fr;
  grid-template-rows: auto 1fr;
  min-height: 520px;
}

/* 工作台左右通栏，与 Negative「Exclude products」ep-work 同构 */
.kt-shell--bleed {
  --kt-pad-x: 32px;
  width: calc(100% + 2 * var(--kt-pad-x));
  max-width: none;
  margin-left: calc(-1 * var(--kt-pad-x));
  margin-right: calc(-1 * var(--kt-pad-x));
  box-sizing: border-box;
}

.kt-tabs-row {
  grid-column: 1;
  grid-row: 1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px 20px 0;
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  box-sizing: border-box;
}

.kt-right-head {
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

.kt-left-stack {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
}

.kt-right-stack {
  grid-column: 2;
  grid-row: 2;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.added-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.remove-all-text-btn {
  border: none;
  background: none;
  color: var(--text-sub);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.remove-all-text-btn:hover { color: #ef4444; }

.kt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 24px;
  min-height: 64px;
  padding: 18px 20px;
  flex-shrink: 0;
}

.toolbar-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-label {
  font-size: 13px;
  color: var(--text-sub);
  white-space: nowrap;
}

.match-types { gap: 8px 12px; }

.chk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-main);
  cursor: pointer;
}

.enter-bid-wrap { max-width: 220px; width: 100%; }

.kt-panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 20px 14px;
}

.kt-panel--campaigns { padding-top: 18px; }

.kt-panel--upload {
  display: flex;
  align-items: flex-start;
  padding-top: 18px;
}

.upload-panel-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kt-panel--enter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enter-textarea {
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
}
.enter-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
.enter-textarea::placeholder { color: #9ca3af; }

.enter-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.enter-upload-side { display: flex; flex-direction: column; }

.enter-file-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.enter-file-input-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }

.enter-upload-lite {
  padding: 6px 10px;
  border: 1px dashed #c4c9d4;
  border-radius: 3px;
  background: var(--gray-50, #f8fafc);
  color: var(--text-sub);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
.enter-upload-lite:hover { border-color: var(--primary); color: var(--primary); background: #fff; }

.enter-download-template {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
.enter-download-template:hover { color: var(--primary); }

.enter-actions { display: flex; justify-content: flex-end; flex-shrink: 0; }

.filters-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 0; }

.filter-field { display: flex; flex-direction: column; gap: 6px; }

.filter-ui-select { min-width: 200px; max-width: 320px; }

.campaigns-match-row { flex-wrap: wrap; margin-top: 20px; margin-bottom: 18px; }

.campaigns-table-stack { display: flex; flex-direction: column; width: 100%; }

.campaigns-table-scroll { overflow: auto; width: 100%; }

.campaigns-bulk-actions { display: flex; justify-content: flex-end; padding-top: 12px; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }

.data-table.flat { margin-top: 0; }

.data-table thead tr { background: #f8f9fb; border-bottom: 1px solid var(--border); }

.data-table th { text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-main); white-space: nowrap; }

.data-table td { padding: 12px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }

.kt-left-stack .data-table th, .added-table-wrap .added-table th { padding: 8px 10px; }
.kt-left-stack .data-table td, .added-table-wrap .added-table td { padding: 10px; }

.kw-stack-th { white-space: normal; vertical-align: bottom; min-width: 140px; }

.kw-stack-th__primary { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); line-height: 1.35; }

.kw-stack-th__secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: var(--text-xs, 12px);
  font-weight: 400;
  color: var(--text-sub);
  line-height: 1.3;
}

.kw-stack-th__info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: help;
  line-height: 0;
  opacity: 0.75;
}

.kw-stack-th__info:hover {
  opacity: 1;
}

.kw-isir-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.kw-isir-tooltip {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  left: -8px;
  transform: none;
  width: 280px;
  background: #1c1f23;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.65;
  padding: 10px 14px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 200;
  white-space: normal;
  text-align: left;
}

.kw-isir-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 14px;
  transform: none;
  border: 5px solid transparent;
  border-bottom-color: #1c1f23;
}

.kw-isir-wrap:hover .kw-isir-tooltip {
  display: block;
}

.kw-stack-td--rowspan { vertical-align: top; }

.kw-stack-td__title { font-size: var(--text-md, 15px); }

.kw-stack-td__meta { margin: 6px 0 0; font-size: 12px; font-weight: 400; color: var(--text-sub); line-height: 1.4; }

.kt-match-empty { text-align: center; padding: 28px 16px; font-size: 14px; color: var(--text-sub); }

.data-table .narrow { width: 40px; text-align: center; vertical-align: middle; }

.data-table .action-col { width: 72px; text-align: right; vertical-align: middle; }

.cell-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-main); line-height: 1.35; }

.cell-meta { margin: 4px 0 0; font-size: 13px; color: var(--text-sub); }

.cell-meta--isir { margin: 6px 0 0; font-size: 12px; line-height: 1.4; }

.sugg-main { font-weight: 600; color: var(--text-main); }

.sugg-range { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

.eb-exclude-btn {
  background: none; border: none; color: #1876ff; font-size: 14px; font-weight: 500;
  cursor: pointer; padding: 0; font-family: inherit; white-space: nowrap;
}
.eb-exclude-btn:hover:not(:disabled) { opacity: 0.7; }
.eb-exclude-btn:disabled { color: var(--text-sub); opacity: 1; cursor: default; }

.empty-block {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 40px 24px; min-height: 280px;
}
.empty-block.tight { min-height: 200px; padding: 20px; }

.empty-illus { opacity: 0.6; flex-shrink: 0; }

.empty-text { margin: 10px 0 4px; font-size: 14px; font-weight: 600; color: var(--text-main); }

.empty-hint { margin: 0; font-size: 13px; color: var(--text-sub); text-align: center; line-height: 1.5; }

.added-table-wrap { flex: 1; overflow: auto; padding: 18px 20px 14px; box-sizing: border-box; }

.bid-input-wrap {
  display: inline-flex; align-items: center; border: 1px solid #d0d5dd;
  border-radius: 4px; background: #fff; padding: 0 10px; height: 36px;
}
.bid-input-wrap--minimal { border: none; background: transparent; padding: 0 4px; height: auto; min-height: 32px; }

.currency { color: var(--text-sub); font-size: 14px; }

.bid-input { width: 72px; border: none; outline: none; font-size: 14px; padding: 0 4px; background: transparent; }

.icon-remove {
  width: 32px; height: 32px; border: none; background: none;
  color: var(--text-sub); font-size: 22px; line-height: 1; cursor: pointer; border-radius: 4px;
}
.icon-remove:hover { color: #ef4444; }
</style>
