<template>
  <div class="pt-panels-root">
              <!-- ═══════════════ Products Module ═══════════════ -->
              <section class="pt-module">
                <div class="pt-module-head">
                  <h2 class="pt-module-title">{{ productTitle }}</h2>
                </div>
    
                <div class="pt-shell">
                  <!-- Row 1: tabs | right head -->
                  <div class="pt-tabs-row">
                    <UnderlineTabs v-model="form.productProductTab" :items="productSubTabs" size="lg" />
                  </div>
                  <div class="pt-right-head">
                    <span class="added-title">{{ productOnlyTargets.length }} added</span>
                    <button
                      v-if="productOnlyTargets.length > 0"
                      type="button"
                      class="link-btn"
                      @click="removeAllProducts"
                    >
                      Remove all
                    </button>
                  </div>
    
                  <!-- Row 2: left content | right content -->
                  <div class="pt-left-stack">
                    <div v-if="showProductBrowseToolbar" class="pt-toolbar">
                      <div class="toolbar-field match-row">
                        <span class="toolbar-label">Targeting type</span>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.exact" /> Exact</label>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.expanded" /> Expanded</label>
                      </div>
                    </div>
    
                    <!-- Enter list（与 Keyword Targeting · Enter list 同构） -->
                    <div v-if="form.productProductTab === 'enter'" class="pt-toolbar">
                      <div class="toolbar-field">
                        <span class="toolbar-label">Custom bid</span>
                        <div class="enter-bid-wrap">
                          <InlineNumberInput
                            v-model="productEnterBid"
                            :step="0.01"
                            suffix="USD"
                            size="default"
                          />
                        </div>
                      </div>
                      <div class="toolbar-field match-row">
                        <span class="toolbar-label">Targeting type</span>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.exact" /> Exact</label>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.expanded" /> Expanded</label>
                      </div>
                    </div>
    
                    <div v-if="form.productProductTab === 'enter'" class="pt-panel pt-panel--enter">
                      <textarea
                        v-model="productEnterListText"
                        class="enter-textarea"
                        placeholder="Enter ASIN separated by new line"
                        rows="10"
                      />
                      <div class="enter-bottom-row">
                        <div class="enter-upload-side">
                          <input
                            ref="productEnterFileInput"
                            type="file"
                            accept=".txt,.csv,.tsv,.xlsx,.xls,text/plain,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            class="enter-file-input-hidden"
                            @change="onProductEnterListFile"
                          />
                          <div class="enter-file-actions">
                            <button type="button" class="enter-upload-lite" @click="triggerProductEnterFilePick">
                              Upload file
                            </button>
                            <button type="button" class="enter-download-template" @click="downloadProductEnterListTemplate">
                              <Download class="enter-download-template__icon" :size="14" :stroke-width="2" aria-hidden="true" />
                              Download the XLSX template
                            </button>
                          </div>
                        </div>
                        <div class="enter-actions">
                          <UiButton type="button" size="sm" variant="default" @click="commitProductEnterList">
                            Add products
                          </UiButton>
                        </div>
                      </div>
                    </div>
    
                    <!-- ── Products: suggested ── -->
                    <div v-else-if="form.productProductTab === 'suggested'" class="pt-panel">
                      <table class="data-table product-table">
                        <thead>
                          <tr>
                            <th class="col-product">Product</th>
                            <th>Type</th>
                            <th>Suggested bid</th>
                            <th class="action-col" aria-label="Action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="p in filteredSuggestedProducts" :key="p.id">
                            <!-- single-type row -->
                            <tr v-if="!bothDeliveryChecked">
                              <td class="col-product">
                                <div class="prod-cell">
                                  <div class="prod-thumb">
                                    <img :src="p.image" :alt="p.title" />
                                  </div>
                                  <div class="prod-text">
                                    <p class="cell-title">{{ p.title }}</p>
                                    <p class="cell-meta">
                                      <span class="meta-stars">
                                        <svg v-for="i in 5" :key="i" width="10" height="10" viewBox="0 0 12 12" :fill="i <= Math.round(p.rating) ? '#f5a623' : '#e0e0e0'">
                                          <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" />
                                        </svg>
                                      </span>
                                      <span>({{ p.reviews.toLocaleString() }})</span>
                                      <span class="meta-sep">|</span>
                                      <span class="meta-orig-price">{{ p.originalPrice }}</span>
                                      <span class="meta-price">{{ p.price }}</span>
                                      <span class="meta-sep">|</span>
                                      <span>{{ p.stock }}</span>
                                      <span class="meta-sep">|</span>
                                      <span>ASIN: {{ p.asin }}</span>
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>{{ p.matchType === 'exact' ? 'Exact' : 'Expanded' }}</td>
                              <td>
                                <span class="sugg-main">{{ p.suggestBid }}</span>
                                <div v-if="p.suggestRange" class="sugg-range">{{ p.suggestRange }}</div>
                              </td>
                              <td class="action-col">
                                <button type="button" class="text-add-btn" aria-label="Add product" @click="addProduct(p)">Add</button>
                              </td>
                            </tr>
                            <!-- both-type: Exact row -->
                            <template v-else>
                              <tr class="dual-row dual-row--first">
                                <td class="col-product" rowspan="2">
                                  <div class="prod-cell">
                                    <div class="prod-thumb">
                                      <img :src="p.image" :alt="p.title" />
                                    </div>
                                    <div class="prod-text">
                                      <p class="cell-title">{{ p.title }}</p>
                                      <p class="cell-meta">
                                        <span class="meta-stars">
                                          <svg v-for="i in 5" :key="i" width="10" height="10" viewBox="0 0 12 12" :fill="i <= Math.round(p.rating) ? '#f5a623' : '#e0e0e0'">
                                            <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5l-2.6 1.4.5-2.9-2.1-2 2.9-.4z" />
                                          </svg>
                                        </span>
                                        <span>({{ p.reviews.toLocaleString() }})</span>
                                        <span class="meta-sep">|</span>
                                        <span class="meta-orig-price">{{ p.originalPrice }}</span>
                                        <span class="meta-price">{{ p.price }}</span>
                                        <span class="meta-sep">|</span>
                                        <span>{{ p.stock }}</span>
                                        <span class="meta-sep">|</span>
                                        <span>ASIN: {{ p.asin }}</span>
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td>Exact</td>
                                <td>
                                  <span class="sugg-main">{{ p.suggestBid }}</span>
                                  <div v-if="p.suggestRange" class="sugg-range">{{ p.suggestRange }}</div>
                                </td>
                                <td class="action-col">
                                  <button
                                    type="button"
                                    class="text-add-btn"
                                    :class="{ 'text-add-btn--added': isProductAdded(p.asin, 'Exact') }"
                                    aria-label="Add product as Exact"
                                    @click="addProductWithType(p, 'Exact')"
                                  >{{ isProductAdded(p.asin, 'Exact') ? 'Added' : 'Add' }}</button>
                                </td>
                              </tr>
                              <!-- both-type: Expanded row -->
                              <tr class="dual-row dual-row--second">
                                <td>Expanded</td>
                                <td></td>
                                <td class="action-col">
                                  <button
                                    type="button"
                                    class="text-add-btn"
                                    :class="{ 'text-add-btn--added': isProductAdded(p.asin, 'Expanded') }"
                                    aria-label="Add product as Expanded"
                                    @click="addProductWithType(p, 'Expanded')"
                                  >{{ isProductAdded(p.asin, 'Expanded') ? 'Added' : 'Add' }}</button>
                                </td>
                              </tr>
                            </template>
                          </template>
                        </tbody>
                      </table>
                    </div>
    
                    <!-- ── Products: campaigns ── -->
                    <div v-else-if="form.productProductTab === 'campaigns'" class="pt-panel pt-panel--campaigns">
                      <div class="filters-row">
                        <label class="filter-field">
                          <span class="toolbar-label">Campaign</span>
                          <div class="filter-ui-select">
                            <UiSelect
                              v-model="form.productSelectedCampaignId"
                              placeholder="Select campaign"
                              :options="ptCampaignSelectOptions"
                            />
                          </div>
                        </label>
                        <label class="filter-field">
                          <span class="toolbar-label">Ad group</span>
                          <div class="filter-ui-select">
                            <UiSelect
                              v-model="form.productSelectedAdGroupId"
                              placeholder="Select ad group"
                              :options="ptAdGroupSelectOptions"
                              :disabled="!form.productSelectedCampaignId"
                            />
                          </div>
                        </label>
                      </div>
                      <div class="toolbar-field match-row campaigns-match-row">
                        <span class="toolbar-label">Match type</span>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.exact" /> Exact</label>
                        <label class="chk"><UiCheckbox v-model="form.productDeliveryType.expanded" /> Expanded</label>
                      </div>
                      <template v-if="!form.productSelectedCampaignId || !form.productSelectedAdGroupId">
                        <div class="empty-block">
                          <div class="empty-illus" aria-hidden="true">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                              <rect x="8" y="14" width="48" height="36" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
                              <path d="M20 32h24M20 40h16" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
                              <circle cx="32" cy="24" r="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5"/>
                            </svg>
                          </div>
                          <p class="empty-text">请先选择 Campaign 和 Ad Group</p>
                          <p class="empty-hint">选择后将展示该广告组下的历史商品定向</p>
                        </div>
                      </template>
                      <template v-else>
                        <div class="campaigns-table-stack">
                          <div class="campaigns-table-scroll">
                            <table class="data-table flat product-table">
                              <thead>
                                <tr>
                                  <th class="narrow" aria-label="Select rows">
                                    <UiCheckbox
                                      v-if="campaignProductSelectableRowKeys.length"
                                      :model-value="campaignProductAllSelectableSelected"
                                      @update:model-value="onCampaignProductSelectAll"
                                    />
                                  </th>
                                  <th class="col-product">Product</th>
                                  <th>Source group status</th>
                                  <th>Match type</th>
                                  <th>Suggested bid</th>
                                  <th class="action-col">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <template v-if="campaignProductTableGroups.length === 0">
                                  <tr>
                                    <td colspan="6" class="pt-campaign-empty">
                                      {{
                                        campaignProductFilterHasNoTypes
                                          ? '请至少选择一种 Match type（Exact / Expanded）。'
                                          : '该广告组下没有可展示的商品定向。'
                                      }}
                                    </td>
                                  </tr>
                                </template>
                                <template v-else>
                                  <template v-for="group in campaignProductTableGroups" :key="group.base.id">
                                    <tr v-for="(line, lineIdx) in group.lines" :key="line.rowKey">
                                      <td class="narrow">
                                        <UiCheckbox
                                          :model-value="!!campaignProductSelected[line.rowKey]"
                                          :disabled="isProductAdded(group.base.asin, line.deliveryType)"
                                          @update:model-value="
                                            (checked) =>
                                              toggleCampaignProductRow(
                                                line.rowKey,
                                                group.base.asin,
                                                line.deliveryType,
                                                checked
                                              )
                                          "
                                        />
                                      </td>
                                      <td
                                        v-if="lineIdx === 0"
                                        :rowspan="group.lines.length"
                                        class="col-product pt-campaign-prod-td"
                                      >
                                        <div class="prod-cell">
                                          <div class="prod-thumb">
                                            <img :src="group.base.image" :alt="group.base.title" />
                                          </div>
                                          <div class="prod-text">
                                            <p class="cell-title">{{ group.base.title }}</p>
                                            <p class="cell-meta">{{ group.base.asin }}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td
                                        v-if="lineIdx === 0"
                                        :rowspan="group.lines.length"
                                        class="muted pt-campaign-status-td"
                                      >
                                        {{ group.base.sourceStatus }}
                                      </td>
                                      <td>{{ line.deliveryType }}</td>
                                      <td>
                                        <div class="sugg-main">{{ line.suggestBid }}</div>
                                        <div v-if="line.suggestRange" class="sugg-range">{{ line.suggestRange }}</div>
                                      </td>
                                      <td class="action-col">
                                        <button
                                          type="button"
                                          class="text-add-btn"
                                          :disabled="isProductAdded(group.base.asin, line.deliveryType)"
                                          :aria-label="
                                            isProductAdded(group.base.asin, line.deliveryType)
                                              ? 'Already added'
                                              : 'Add product'
                                          "
                                          @click="addProductFromCampaignLine(group.base, line)"
                                        >
                                          {{ isProductAdded(group.base.asin, line.deliveryType) ? 'Added' : 'Add' }}
                                        </button>
                                      </td>
                                    </tr>
                                  </template>
                                </template>
                              </tbody>
                            </table>
                          </div>
                          <div v-if="campaignProductSelectedCount > 0" class="campaigns-bulk-actions">
                            <UiButton type="button" size="sm" variant="default" @click="addSelectedCampaignProductRows">
                              Add selected
                            </UiButton>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
    
                  <div class="pt-right-stack">
                    <div v-if="productOnlyTargets.length === 0" class="empty-block tight">
                      <div class="empty-illus" aria-hidden="true">
                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                          <rect x="6" y="10" width="44" height="32" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
                          <path d="M14 26h28M14 33h18" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
                          <path d="M36 38l6 6M42 38l-6 6" stroke="var(--primary,#1876ff)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
                        </svg>
                      </div>
                      <p class="empty-text">尚未添加商品</p>
                      <p class="empty-hint">从左侧选择并添加</p>
                    </div>
    
                    <div v-else class="added-table-wrap">
                      <table class="data-table added-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Bid</th>
                            <th class="action-col" aria-label="Action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in productOnlyTargets" :key="row.id">
                            <td>
                              <template v-if="row.manual">
                                <input
                                  :id="'added-asin-' + row.id"
                                  v-model="row.asin"
                                  class="added-kw-input"
                                  type="text"
                                  placeholder="Enter ASIN (e.g. B08Q6LV5CR)"
                                  @keydown.enter="commitManualAsin(row)"
                                  @blur="commitManualAsin(row)"
                                />
                              </template>
                              <template v-else>
                                <div class="added-product">
                                  <div class="added-thumb">
                                    <img v-if="row.image" :src="row.image" :alt="row.title" />
                                    <svg v-else width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                                      <rect width="40" height="40" rx="4" fill="#f3f5f8"/>
                                      <rect x="10" y="12" width="20" height="16" rx="2" stroke="#c8cdd4" stroke-width="1.2" fill="none"/>
                                      <circle cx="15" cy="18" r="2" fill="#c8cdd4"/>
                                      <path d="M10 24l5-4 4 3 4-3 7 5" stroke="#c8cdd4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                  </div>
                                  <div class="added-product__info">
                                    <p class="cell-title">{{ row.title || row.asin }}</p>
                                    <p class="cell-meta">
                                      <span class="meta-sep" style="color:#d0d0d0">ASIN:</span>
                                      {{ row.asin }}
                                    </p>
                                  </div>
                                </div>
                              </template>
                            </td>
                            <td class="col-type">
                              <div class="added-match-select">
                                <UiSelect
                                  v-model="row.deliveryType"
                                  size="sm"
                                  :options="deliveryTypeOptions"
                                />
                              </div>
                            </td>
                            <td>
                              <span class="bid-input-wrap bid-input-wrap--minimal">
                                <span class="currency">$</span>
                                <input
                                  v-model.number="row.bid"
                                  class="bid-input"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  :placeholder="Number(form.productTargetingDefaultBid).toFixed(2)"
                                />
                              </span>
                            </td>
                            <td class="action-col">
                              <button type="button" class="icon-remove" aria-label="Remove" @click="removeAdded(row.id)">×</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
    
              <!-- ═══════════════ Categories Module ═══════════════ -->
              <section class="pt-module">
                <div class="pt-module-head">
                  <h2 class="pt-module-title">{{ categoryTitle }}</h2>
                </div>
    
                <div class="pt-shell">
                  <!-- Row 1: tabs | right head -->
                  <div class="pt-tabs-row">
                    <UnderlineTabs v-model="form.productCategoryTab" :items="categorySubTabs" size="lg" />
                  </div>
                  <div class="pt-right-head">
                    <span class="added-title">{{ categoryTargets.length }} added</span>
                    <button
                      v-if="categoryTargets.length > 0"
                      type="button"
                      class="link-btn"
                      @click="removeAllCategories"
                    >
                      Remove all
                    </button>
                  </div>
    
                  <!-- Row 2: left content | right content -->
                  <div class="pt-left-stack">
                    <!-- ── Categories: Amazon suggested ── -->
                    <div v-if="form.productCategoryTab === 'suggested'" class="pt-panel">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Suggested bid</th>
                            <th class="action-col" aria-label="Action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in suggestedCategories" :key="row.id">
                            <td>
                              <p class="cell-title">{{ row.path }}</p>
                            </td>
                            <td>
                              <span class="sugg-main">{{ row.suggestBid }}</span>
                              <div v-if="row.suggestRange" class="sugg-range">{{ row.suggestRange }}</div>
                            </td>
                            <td class="action-col">
                              <button type="button" class="text-add-btn" aria-label="Add category" @click="addCategory(row)">Add</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
    
                    <!-- ── Categories: Search（与 Negative · Exclude products 同构） ── -->
                    <div v-else-if="form.productCategoryTab === 'search'" class="pt-panel pt-panel--search">
                      <div class="pt-search-bar">
                        <input
                          v-model="categorySearchQuery"
                          class="pt-search"
                          type="text"
                          placeholder="Search by category name"
                        />
                        <button class="pt-search-btn" type="button">Search</button>
                      </div>
                      <table v-if="filteredSearchCategories.length > 0" class="data-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Suggested bid</th>
                            <th class="action-col" aria-label="Action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in filteredSearchCategories" :key="row.id">
                            <td>
                              <p class="cell-title">{{ row.path }}</p>
                            </td>
                            <td>
                              <span class="sugg-main">{{ row.suggestBid }}</span>
                              <div v-if="row.suggestRange" class="sugg-range">{{ row.suggestRange }}</div>
                            </td>
                            <td class="action-col">
                              <button type="button" class="text-add-btn" aria-label="Add category" @click="addCategory(row)">Add</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p v-else class="pt-search-empty">No categories found.</p>
                    </div>
                  </div>
    
                  <div class="pt-right-stack">
                    <div v-if="categoryTargets.length === 0" class="empty-block tight">
                      <div class="empty-illus" aria-hidden="true">
                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                          <rect x="6" y="10" width="44" height="32" rx="4" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" fill="var(--gray-50,#f8fafc)"/>
                          <path d="M14 26h28M14 33h18" stroke="var(--gray-300,#d0d7e2)" stroke-width="1.5" stroke-linecap="round"/>
                          <path d="M36 38l6 6M42 38l-6 6" stroke="var(--primary,#1876ff)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
                        </svg>
                      </div>
                      <p class="empty-text">尚未添加分类</p>
                      <p class="empty-hint">从左侧选择并添加</p>
                    </div>
    
                    <div v-else class="added-table-wrap">
                      <table class="data-table added-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Bid</th>
                            <th class="action-col" aria-label="Action"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="row in categoryTargets" :key="row.id">
                            <td>
                              <p class="cell-title">{{ row.title }}</p>
                            </td>
                            <td>
                              <span class="bid-input-wrap bid-input-wrap--minimal">
                                <span class="currency">$</span>
                                <input
                                  v-model.number="row.bid"
                                  class="bid-input"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  :placeholder="Number(form.productTargetingDefaultBid).toFixed(2)"
                                />
                              </span>
                            </td>
                            <td class="action-col">
                              <button type="button" class="icon-remove" aria-label="Remove" @click="removeAdded(row.id)">×</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, toRef } from 'vue'
import UiSelect from '@/components/ui/select/Select.vue'
import UiButton from '@/components/ui/button/Button.vue'
import UiCheckbox from '@/components/ui/checkbox/Checkbox.vue'
import InlineNumberInput from '@/components/base/InlineNumberInput.vue'
import UnderlineTabs from '@/components/ui/UnderlineTabs.vue'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-vue-next'

const props = defineProps({
  /** Ref from storeToRefs — parent campaign or sb form */
  form: { type: Object, required: true },
  productTitle: { type: String, default: 'Products' },
  categoryTitle: { type: String, default: 'Categories' },
})

const form = toRef(props, 'form')
const productTitle = toRef(props, 'productTitle')
const categoryTitle = toRef(props, 'categoryTitle')

const deliveryTypeOptions = [
  { label: 'Exact',    value: 'Exact' },
  { label: 'Expanded', value: 'Expanded' }
]

const categorySubTabs = [
  { id: 'suggested', label: 'Amazon suggested' },
  { id: 'search', label: 'Search' },
]

const productSubTabs = [
  { id: 'enter', label: 'Enter list' },
  { id: 'campaigns', label: 'Select from campaigns' },
  { id: 'suggested', label: 'Amazon suggested' },
]

const categorySearchQuery = ref('')

const showProductBrowseToolbar = computed(() => form.value.productProductTab === 'suggested')

const productEnterListText = ref('')
const productEnterFileInput = ref(null)
const productEnterBid = ref(form.value.productTargetingDefaultBid ?? 0.02)

const suggestedCategories = [
  { id: 'c1', path: 'Home & Garden > Heating, Cooling & Air Quality > Space Heaters', suggestBid: '—', suggestRange: '' },
  { id: 'c2', path: 'Home & Garden > Heating, Cooling & Air Quality > Fans', suggestBid: '—', suggestRange: '' },
  { id: 'c3', path: 'Home & Garden > Tools & Home Improvement > Electrical', suggestBid: '$0.42', suggestRange: '$0.30–$0.55' },
  { id: 'c4', path: 'Health & Household > Household Supplies > Air Fresheners', suggestBid: '—', suggestRange: '' },
  { id: 'c5', path: 'Books > Engineering & Transportation > Engineering', suggestBid: '—', suggestRange: '' }
]

const searchCategoryPool = [
  ...suggestedCategories,
  { id: 'c6', path: 'Stationery & Office Supplies > Writing & Correction', suggestBid: '$0.28', suggestRange: '$0.20–$0.38' },
  { id: 'c7', path: 'Health & Personal Care > Vitamins & Supplements', suggestBid: '$0.55', suggestRange: '$0.40–$0.72' },
  { id: 'c8', path: 'Books > Literature & Fiction', suggestBid: '—', suggestRange: '' }
]

const filteredSearchCategories = computed(() => {
  const q = categorySearchQuery.value.trim().toLowerCase()
  if (!q) return searchCategoryPool
  return searchCategoryPool.filter(c => c.path.toLowerCase().includes(q))
})

const mockCampaigns = [
  { id: 'c1', name: 'SP Heaters Q1' },
  { id: 'c2', name: 'SP Brand Defense' }
]

const mockAdGroups = [
  { id: 'g1', campaignId: 'c1', name: 'Heaters – Exact' },
  { id: 'g2', campaignId: 'c1', name: 'Heaters – Broad' },
  { id: 'g3', campaignId: 'c2', name: 'Brand – Exact' }
]

const filteredAdGroups = computed(() => {
  const cid = form.value.productSelectedCampaignId
  if (!cid) return mockAdGroups
  return mockAdGroups.filter(g => g.campaignId === cid)
})

const ptCampaignSelectOptions = computed(() =>
  mockCampaigns.map(c => ({ value: c.id, label: c.name }))
)

const ptAdGroupSelectOptions = computed(() =>
  filteredAdGroups.value.map(g => ({ value: g.id, label: g.name }))
)

watch(
  () => form.value.productSelectedCampaignId,
  () => { form.value.productSelectedAdGroupId = '' }
)

const suggestedProducts = [
  { id: 'p1', asin: 'B08Q6LV5CR', title: 'PureMate 46-inch Tower Fan', image: 'https://m.media-amazon.com/images/I/61e7RvINXUL._AC_SL1500_.jpg', stock: 'In stock', suggestBid: '—', suggestRange: '', originalPrice: '$69.99', price: '$59.49', rating: 4.5, reviews: 3201, matchType: 'exact' },
  { id: 'p2', asin: 'B0C5CV8CTW', title: 'Dreo Ceramic Heater, 2025 Winter Mode', image: 'https://m.media-amazon.com/images/I/81G+4gzszVL._AC_SY879_.jpg', stock: 'In stock', suggestBid: '$1.12', suggestRange: '$0.88–$1.35', originalPrice: '$41.22', price: '$39.25', rating: 4.5, reviews: 16346, matchType: 'expanded' },
  { id: 'p3', asin: 'B09XK2DTVP', title: 'Vornado MVH Vortex Heater', image: 'https://m.media-amazon.com/images/I/71pB9RvWyRL._AC_SL1500_.jpg', stock: 'Out of stock', suggestBid: '$0.98', suggestRange: '$0.72–$1.15', originalPrice: '$59.99', price: '$49.99', rating: 4.4, reviews: 8921, matchType: 'exact' }
]

const DISPLAY_PRODUCT_DELIVERY_ORDER = ['Exact', 'Expanded']

const campaignProductRows = computed(() => {
  if (!form.value.productSelectedCampaignId || !form.value.productSelectedAdGroupId) return []
  return suggestedProducts.slice(0, 2).map((p, i) => ({
    ...p,
    id: `cp-${p.asin}-${i}`,
    sourceStatus: 'Active',
    suggestByDelivery: {
      Exact: {
        bid: p.matchType === 'exact' ? p.suggestBid : '$0.88',
        range: p.matchType === 'exact' ? (p.suggestRange || '') : '$0.70–$1.05',
      },
      Expanded: {
        bid: p.matchType === 'expanded' ? p.suggestBid : '$0.95',
        range: p.matchType === 'expanded' ? (p.suggestRange || '') : '$0.78–$1.12',
      },
    },
  }))
})

function deliveryTypesFromToolbar() {
  const d = form.value.productDeliveryType
  return DISPLAY_PRODUCT_DELIVERY_ORDER.filter((name) => {
    if (name === 'Exact') return d.exact
    return d.expanded
  })
}

/** 按 suggestByDelivery 里存在的类型过滤，行顺序同 DISPLAY_PRODUCT_DELIVERY_ORDER */
function deliveryTypesFromSuggest(suggestByDelivery) {
  if (!suggestByDelivery || typeof suggestByDelivery !== 'object') return []
  return DISPLAY_PRODUCT_DELIVERY_ORDER.filter((name) => suggestByDelivery[name] != null)
}

const campaignProductTableGroups = computed(() => {
  const toolbarTypes = deliveryTypesFromToolbar()
  if (!toolbarTypes.length) return []
  return campaignProductRows.value
    .map((base) => {
      const fromData = deliveryTypesFromSuggest(base.suggestByDelivery)
      const types = fromData.filter((dt) => toolbarTypes.includes(dt))
      return {
        base,
        lines: types.map((dt) => {
          const s = base.suggestByDelivery[dt]
          return {
            rowKey: `${base.id}-${dt}`,
            deliveryType: dt,
            suggestBid: s?.bid ?? '—',
            suggestRange: s?.range ?? '',
          }
        }),
      }
    })
    .filter((g) => g.lines.length > 0)
})

const campaignProductFilterHasNoTypes = computed(
  () => !form.value.productDeliveryType.exact && !form.value.productDeliveryType.expanded
)

/** Campaigns 商品表：按行多选（rowKey = baseId-Exact|Expanded） */
const campaignProductSelected = ref({})

const campaignProductSelectableRowKeys = computed(() => {
  const keys = []
  for (const g of campaignProductTableGroups.value) {
    for (const line of g.lines) {
      if (!isProductAdded(g.base.asin, line.deliveryType)) keys.push(line.rowKey)
    }
  }
  return keys
})

const campaignProductSelectedCount = computed(
  () => Object.keys(campaignProductSelected.value).filter((k) => campaignProductSelected.value[k]).length
)

const campaignProductAllSelectableSelected = computed(() => {
  const sel = campaignProductSelectableRowKeys.value
  if (!sel.length) return false
  return sel.every((k) => campaignProductSelected.value[k])
})

function clearCampaignProductRowSelection() {
  campaignProductSelected.value = {}
}

function toggleCampaignProductRow(rowKey, asin, deliveryType, checked) {
  if (isProductAdded(asin, deliveryType)) return
  const next = { ...campaignProductSelected.value }
  if (checked) next[rowKey] = true
  else delete next[rowKey]
  campaignProductSelected.value = next
}

function onCampaignProductSelectAll(checked) {
  if (checked) {
    const next = { ...campaignProductSelected.value }
    for (const k of campaignProductSelectableRowKeys.value) next[k] = true
    campaignProductSelected.value = next
  } else {
    campaignProductSelected.value = {}
  }
}

function addProductFromCampaignLine(base, line) {
  addProductWithType(base, line.deliveryType, {
    suggestBid: line.suggestBid,
    suggestRange: line.suggestRange,
  })
}

function addSelectedCampaignProductRows() {
  for (const g of campaignProductTableGroups.value) {
    for (const line of g.lines) {
      if (!campaignProductSelected.value[line.rowKey]) continue
      if (isProductAdded(g.base.asin, line.deliveryType)) continue
      addProductFromCampaignLine(g.base, line)
    }
  }
  clearCampaignProductRowSelection()
}

watch(
  () => [
    form.value.productSelectedCampaignId,
    form.value.productSelectedAdGroupId,
    form.value.productDeliveryType.exact,
    form.value.productDeliveryType.expanded,
  ],
  () => clearCampaignProductRowSelection()
)

watch(
  () => form.value.productProductTab,
  (tab) => {
    if (tab !== 'campaigns') clearCampaignProductRowSelection()
  }
)

const categoryTargets = computed(() =>
  form.value.productTargets.filter(t => t.kind === 'category')
)

const productOnlyTargets = computed(() =>
  form.value.productTargets.filter(t => t.kind === 'product')
)

const bothDeliveryChecked = computed(() =>
  form.value.productDeliveryType.exact && form.value.productDeliveryType.expanded
)

const filteredSuggestedProducts = computed(() => {
  const { exact, expanded } = form.value.productDeliveryType
  if (!exact && !expanded) return []
  if (exact && expanded) return suggestedProducts
  return suggestedProducts.filter(p =>
    exact ? p.matchType === 'exact' : p.matchType === 'expanded'
  )
})

function pickDeliveryTypeForAdd() {
  const d = form.value.productDeliveryType
  if (d.exact && !d.expanded) return 'Exact'
  if (!d.exact && d.expanded) return 'Expanded'
  if (d.exact && d.expanded) return 'Exact'
  return 'Exact'
}

function pickDeliveryLabel() {
  const d = form.value.productDeliveryType
  if (d.exact && d.expanded) return 'Exact / Expanded'
  if (d.expanded) return 'Expanded'
  if (d.exact) return 'Exact'
  return 'Exact'
}

function categoryKey(path) {
  return `cat:${path}`
}

/** 用于去重 / productKey；展示仍可用文件中的原字符串 */
function productDedupeKey(asin) {
  return String(asin ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function productKey(asin, delivery) {
  const k = productDedupeKey(asin)
  const base = k || String(asin ?? '').trim()
  return `prod:${base}:${delivery}`
}

function isCategoryAdded(path) {
  const k = categoryKey(path)
  return form.value.productTargets.some(t => t.kind === 'category' && t.pathKey === k)
}

function isProductAdded(asin, delivery) {
  const k = productKey(asin, delivery)
  return form.value.productTargets.some(t => t.kind === 'product' && t.productKey === k)
}

function addCategory(row) {
  const k = categoryKey(row.path)
  if (isCategoryAdded(row.path)) return
  const def = form.value.productTargetingDefaultBid
  form.value.productTargets.push({
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'category',
    pathKey: k,
    title: row.path,
    subtitle: '',
    deliveryType: 'Category',
    suggestBid: row.suggestBid || '—',
    suggestRange: row.suggestRange || '',
    bid: def,
    checked: false,
    asin: '',
    image: ''
  })
}

function addProduct(p) {
  const delivery = pickDeliveryTypeForAdd()
  if (isProductAdded(p.asin, delivery)) return
  const def = form.value.productTargetingDefaultBid
  form.value.productTargets.push({
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'product',
    productKey: productKey(p.asin, delivery),
    title: p.title,
    subtitle: '',
    asin: p.asin,
    image: p.image,
    deliveryType: delivery,
    suggestBid: p.suggestBid || '—',
    suggestRange: p.suggestRange || '',
    bid: def,
    checked: false
  })
}

function addProductWithType(p, delivery, opts = {}) {
  if (isProductAdded(p.asin, delivery)) return
  const def = form.value.productTargetingDefaultBid
  form.value.productTargets.push({
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: 'product',
    productKey: productKey(p.asin, delivery),
    title: p.title,
    subtitle: '',
    asin: p.asin,
    image: p.image,
    deliveryType: delivery,
    suggestBid: opts.suggestBid != null ? opts.suggestBid : (p.suggestBid || '—'),
    suggestRange: opts.suggestRange != null ? opts.suggestRange : (p.suggestRange || ''),
    bid: def,
    checked: false
  })
}

function commitManualAsin(row) {
  const asin = (row.asin || '').trim().toUpperCase()
  if (!asin) return
  row.asin = asin
  row.title = row.title || asin
  row.productKey = productKey(asin, row.deliveryType)
  row.manual = false
}

function triggerProductEnterFilePick() {
  productEnterFileInput.value?.click()
}

function downloadProductEnterListTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([['ASIN']])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, 'product-asin-import-template.xlsx')
}

function normalizeUploadText(raw) {
  return raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/** Upload file：首列原样保留（不 trim） */
function workbookFirstColumnLinesRaw(wb) {
  const sn = wb.SheetNames[0]
  if (!sn) return ''
  const ws = wb.Sheets[sn]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  return rows
    .map(r => String(Array.isArray(r) ? r[0] : ''))
    .filter(cell => cell.length > 0)
    .join('\n')
}

async function onProductEnterListFile(ev) {
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
        .map(line => (line.split('\t')[0] ?? '').replace(/\r$/, ''))
        .filter(cell => cell.length > 0)
        .join('\n')
    } else {
      out = normalizeUploadText(await file.text())
    }
    if (out.trim()) addProductEnterListLines(out, { fromUpload: true })
  } catch {
    /* ignore read / parse errors */
  }
  input.value = ''
}

/** 按 Custom bid、勾选的 Targeting type 将多行 ASIN 加入右侧列表 */
function addProductEnterListLines(sourceText, { fromUpload = false } = {}) {
  const bid = productEnterBid.value ?? form.value.productTargetingDefaultBid
  const deliveries = []
  if (form.value.productDeliveryType.exact) deliveries.push('Exact')
  if (form.value.productDeliveryType.expanded) deliveries.push('Expanded')
  if (!deliveries.length) return

  const lines = fromUpload
    ? normalizeUploadText(sourceText)
        .split('\n')
        .map(l => l.replace(/\r$/, ''))
        .filter(l => l !== '')
    : sourceText.split('\n').map(l => l.trim().toUpperCase()).filter(Boolean)
  lines.forEach(asin => {
    deliveries.forEach(delivery => {
      if (isProductAdded(asin, delivery)) return
      form.value.productTargets.push({
        id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind: 'product',
        productKey: productKey(asin, delivery),
        title: `ASIN ${asin}`,
        subtitle: '',
        asin,
        image: '',
        deliveryType: delivery,
        suggestBid: '—',
        suggestRange: '',
        bid,
        checked: false,
      })
    })
  })
}

function commitProductEnterList() {
  addProductEnterListLines(productEnterListText.value, { fromUpload: false })
  productEnterListText.value = ''
}

function addAllCategorySource() {
  const tab = form.value.productCategoryTab
  let rows = []
  if (tab === 'suggested') rows = suggestedCategories
  else if (tab === 'search') rows = filteredSearchCategories.value
  rows.forEach(row => addCategory(row))
}

function addAllProductSource() {
  const tab = form.value.productProductTab
  if (tab === 'suggested') {
    suggestedProducts.forEach(p => addProduct(p))
  } else if (tab === 'campaigns') {
    campaignProductRows.value.forEach(p => addProduct(p))
  }
}

function removeAdded(id) {
  form.value.productTargets = form.value.productTargets.filter(t => t.id !== id)
}

function removeAllCategories() {
  form.value.productTargets = form.value.productTargets.filter(t => t.kind !== 'category')
}

function removeAllProducts() {
  form.value.productTargets = form.value.productTargets.filter(t => t.kind !== 'product')
}
</script>

<style scoped>
/* ── Module card ── */
.pt-module {
  background: var(--bg-card);
  overflow: hidden;
}

.pt-module-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.pt-module-title {
  font-size: var(--text-2xl, 22px);
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

/* ── Shell: 2×2 grid (tabs|head / content|content) ── */
.pt-shell {
  display: grid;
  grid-template-columns: minmax(0, 56%) 1fr;
  grid-template-rows: auto 1fr;
  min-height: 400px;
}

/* Row 1 col 1: tabs */
.pt-tabs-row {
  grid-column: 1;
  grid-row: 1;
  align-self: stretch;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  box-sizing: border-box;
}

.pt-tabs-row :deep(.underline-tabs) {
  width: 100%;
}

.pt-tabs-row :deep(.underline-tabs--lg .underline-tabs__trigger) {
  padding-left: 0;
  padding-right: 0;
}

/* Row 1 col 2: "N added" head */
.pt-right-head {
  grid-column: 2;
  grid-row: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  box-sizing: border-box;
}

/* Row 2 col 1: left content */
.pt-left-stack {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
}

.added-kw-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  padding: 0 4px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-main);
  background: transparent;
  outline: none;
}
.added-kw-input::placeholder { color: #c0c8d8; }

/* Row 2 col 2: right content */
.pt-right-stack {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.link-btn {
  background: none;
  border: none;
  color: #1876ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 8px;
  font-family: inherit;
}

.link-btn:hover {
  opacity: 0.8;
}

.pt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 24px;
  box-sizing: border-box;
  flex-shrink: 0;
  min-height: 64px;
  padding: 18px 20px;
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

.bid-input-wrap {
  display: inline-flex;
  align-items: center;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  background: #fff;
  padding: 0 10px;
  height: 36px;
}

.col-type {
  white-space: nowrap;
}

.added-match-select {
  min-width: 0;
  width: fit-content;
  max-width: 100%;
}

.added-match-select :deep(.ui-select-wrap) {
  width: auto;
  min-width: 0;
  max-width: 100%;
  display: inline-block;
  vertical-align: middle;
}

.added-match-select :deep(.ui-select-trigger) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding-left: 0;
  padding-right: 2px;
  width: auto;
  min-width: 0;
  justify-content: flex-start;
}

.added-match-select :deep(.ui-select-trigger:hover) { border-color: transparent; }
.added-match-select :deep(.ui-select-trigger:focus-visible) {
  outline: none;
  border-color: transparent;
  box-shadow: none;
}

.added-match-select :deep(.ui-select-chevron) { color: #94a3b8; }

.added-table .bid-input-wrap--minimal {
  border: none;
  background: transparent;
  padding: 0 4px;
  height: auto;
  min-height: 32px;
}

.added-table .bid-input-wrap--minimal .bid-input {
  flex: 1 1 auto;
  width: 72px;
  min-width: 56px;
  max-width: 100%;
}

.currency {
  color: var(--text-sub);
  font-size: 14px;
}

.bid-input {
  width: 72px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 0 4px;
  background: transparent;
}

.match-row {
  gap: 12px;
}

.enter-bid-wrap {
  max-width: 220px;
  width: 100%;
}

.chk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.theme-field {
  flex: 1;
  min-width: 200px;
}

.theme-select {
  flex: 1;
  max-width: 360px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.pt-panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 20px 14px;
}

.pt-panel--campaigns {
  padding-top: 18px;
}

.pt-panel--enter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enter-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.enter-upload-side {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.enter-file-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.enter-file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.enter-upload-lite {
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

.enter-upload-lite:hover {
  border-color: var(--primary, #1d4ed8);
  color: var(--primary, #1d4ed8);
  background: #fff;
}

.enter-download-template {
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

.enter-download-template:hover {
  color: var(--primary, #1d4ed8);
}

.enter-download-template:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.enter-download-template__icon {
  flex-shrink: 0;
  color: inherit;
}

.enter-actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
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
  transition: border-color 0.15s, box-shadow 0.15s;
}

.enter-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.enter-textarea::placeholder {
  color: #9ca3af;
}

.pt-panel--search {
  padding-top: 0;
}

/* 与 NegativeTargetingPage · Exclude products 搜索条视觉对齐 */
.pt-search-bar {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 16px 0 20px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.pt-search {
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

.pt-search:focus {
  border-color: #1876ff;
}

.pt-search::placeholder {
  color: #b0bac8;
}

.pt-search-btn {
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

.pt-search-btn:hover {
  background: #0f5fd4;
}

.pt-search-empty {
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--text-sub, #6b7280);
}

.panel-count {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--text-sub);
}

.panel-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--text-sub);
}

.search-input {
  width: 100%;
  max-width: 400px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 12px;
  font-family: inherit;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
}

.campaigns-match-row {
  flex-wrap: wrap;
  margin-top: 0;
  margin-bottom: 18px;
}

.campaigns-table-stack {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.campaigns-table-scroll {
  overflow: auto;
  width: 100%;
}

.campaigns-bulk-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  flex-shrink: 0;
}

.campaigns-table-stack .narrow {
  width: 40px;
  text-align: center;
  vertical-align: middle;
}

.pt-campaign-empty {
  padding: 20px 12px;
  text-align: center;
  color: var(--text-sub, #6b7280);
  font-size: 13px;
}

.pt-campaign-prod-td {
  vertical-align: top;
}

.pt-campaign-status-td {
  vertical-align: middle;
}

.data-table.flat {
  margin-top: 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-ui-select {
  min-width: 200px;
  max-width: 320px;
}

/* ── Data table ── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr {
  background: #f8f9fb;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  text-align: left;
  padding: 10px 12px;
  font-weight: 600;
  color: var(--text-main);
}

.data-table td {
  padding: 12px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.action-col {
  width: 56px;
  text-align: center;
}

.col-product {
  min-width: 220px;
}

.cell-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.35;
}

.cell-meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
}

.meta-stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.meta-sep {
  color: #d0d0d0;
}

.meta-orig-price {
  color: #999;
  text-decoration: line-through;
}

.meta-price {
  color: #fe4041;
  font-weight: 500;
}

.muted {
  color: var(--text-sub);
}

.sugg-main {
  font-weight: 600;
  color: var(--text-main);
}

.sugg-range {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}

.text-add-btn {
  background: none;
  border: none;
  color: #1876ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.text-add-btn:hover {
  opacity: 0.7;
}

.text-add-btn:disabled {
  color: var(--text-sub);
  cursor: default;
  opacity: 0.85;
  pointer-events: none;
}

.text-add-btn--added {
  color: var(--text-sub);
  cursor: default;
  pointer-events: none;
}

.prod-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.prod-thumb {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.prod-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.prod-text {
  min-width: 0;
}

.product-table .col-product {
  max-width: 320px;
}

/* When a product spans 2 rows, suppress the inner border between them */
.product-table .dual-row--first td:not(.col-product) {
  border-bottom: none;
}

.product-table .dual-row--second td {
  border-bottom: 1px solid #f1f5f9;
  padding-top: 6px;
}

.product-table .dual-row--first .col-product {
  vertical-align: middle;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.page-info {
  font-size: 13px;
  color: var(--text-sub);
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}

.page-btn.active {
  border-color: #1876ff;
  color: #1876ff;
  background: #eff6ff;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-size {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
}

/* ── Empty states ── */
.empty-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 240px;
}

.empty-block.tight {
  min-height: 200px;
}

.empty-text {
  margin: 8px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.empty-hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-sub);
  text-align: center;
}


.added-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.added-table-wrap {
  flex: 1;
  overflow: auto;
}

.th-refresh {
  margin-left: 6px;
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  font-size: 14px;
  vertical-align: middle;
}

.th-refresh:hover {
  color: #1876ff;
}

.added-product {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.added-product__info {
  min-width: 0;
  flex: 1;
}

.added-thumb {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f3f5f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.added-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-sub);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
}

.icon-remove:hover {
  color: #ef4444;
}

.pt-panels-root {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
