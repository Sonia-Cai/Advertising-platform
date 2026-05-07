<template>
  <section id="section-sb-ad-group-name" class="card">
    <h2>Ad group name <span class="required">*</span></h2>
    <div id="field-sb-ad-group-name" class="input-wrap" :class="{ 'has-error': error || lengthHint }">
      <UiInput
        size="lg"
        :model-value="form.adGroupName"
        :class="{ 'input-error': error || lengthHint }"
        @update:model-value="onAdGroupNameInput"
      />
    </div>
    <p v-if="error" class="error-msg">{{ error }}</p>
    <p v-else-if="lengthHint" class="error-msg">{{ lengthHint }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'
import UiInput from '@/components/ui/input/Input.vue'

const AD_GROUP_NAME_MAX = 100
/** 历史默认占位：视为未自定义，进入本步时仍用 Campaign Name 覆盖 */
const LEGACY_DEFAULT_AD_GROUP = 'Ad Group 1'

const { form } = storeToRefs(useSbStore())
const error = ref('')
const lengthHint = ref('')

/** 进入 Ad Group 步骤时：空（或历史默认）则同步 Campaign Name（整段复制，无后缀），仍可由用户编辑 */
function applyDefaultAdGroupFromCampaign() {
  const current = form.value.adGroupName?.trim() ?? ''
  if (current !== '' && current !== LEGACY_DEFAULT_AD_GROUP) return

  const cn = String(form.value.campaignName ?? '').trim()
  if (!cn) {
    form.value.adGroupName = ''
    return
  }
  if (cn.length > AD_GROUP_NAME_MAX) {
    form.value.adGroupName = cn.slice(0, AD_GROUP_NAME_MAX)
    lengthHint.value = '名称过长，请精简'
  } else {
    form.value.adGroupName = cn
  }
}

function onAdGroupNameInput(val) {
  const raw = String(val ?? '')
  error.value = ''
  if (raw.length > AD_GROUP_NAME_MAX) {
    form.value.adGroupName = raw.slice(0, AD_GROUP_NAME_MAX)
    lengthHint.value = '名称过长，请精简'
  } else {
    form.value.adGroupName = raw
    lengthHint.value = ''
  }
}

onMounted(() => {
  applyDefaultAdGroupFromCampaign()
})

function validate() {
  const errorItems = []
  const name = form.value.adGroupName?.trim() ?? ''

  if (!name) {
    error.value = 'Ad group name is required.'
    lengthHint.value = ''
    errorItems.push({ subItem: 'Ad group name', label: 'Ad group name', anchorId: 'field-sb-ad-group-name' })
  } else if (name.length > AD_GROUP_NAME_MAX) {
    error.value = '名称过长，请精简'
    errorItems.push({ subItem: 'Ad group name', label: 'Ad group name', anchorId: 'field-sb-ad-group-name' })
  } else {
    error.value = ''
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

.required {
  color: var(--color-danger);
  font-size: var(--text-sm, 13px);
}

/* 与 SB Campaign Name（#field-campaign-name .input-wrap）同宽：占满卡片内容区 */
#field-sb-ad-group-name.input-wrap {
  max-width: none;
  width: 100%;
}

.input-wrap {
  max-width: 400px;
  width: 100%;
}

.has-error :deep(input) {
  border-color: var(--color-danger) !important;
}

.error-msg {
  margin: 6px 0 0;
  font-size: var(--text-sm, 13px);
  color: var(--color-danger);
  line-height: 1.4;
}
</style>
