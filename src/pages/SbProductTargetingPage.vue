<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper :steps="steps" :current-step="getStepNumber('/sb/product-targeting')" />

      <div class="content-wrapper">
        <h2 class="page-title">Product Targeting</h2>
        <main class="main-content">
          <ProductTargetingPanels
            :form="form"
            product-title="Individual Products"
            product-tabs-variant="sbCollectionsManual"
          />
        </main>
      </div>
    </div>
  </div>

  <BottomBar show-back @cancel="onCancel" @back="onBack" @next="onNext" />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import ProductTargetingPanels from '@/components/product-targeting/ProductTargetingPanels.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'
import { useSbStore } from '@/stores/sb'

const router = useRouter()
const store = useSbStore()
const { form } = storeToRefs(store)
const { steps, getStepNumber, getNextPath, getBackPath } = useSbFlowSteps()

onMounted(() => {
  form.value.productProductTab = 'suggested'
})

function onCancel() { router.push('/') }
function onBack() { router.push(getBackPath('/sb/product-targeting')) }
function onNext() { router.push(getNextPath('/sb/product-targeting')) }
</script>

<style scoped>
.page-layout {
  display: flex;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height, 60px));
  width: 100%;
}

.page-center {
  display: flex;
  align-items: flex-start;
  gap: var(--sidebar-gap, 40px);
  width: var(--content-width, 80vw);
  max-width: 100%;
  box-sizing: border-box;
  padding: 40px 0 0;
}

.content-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: var(--text-3xl, 28px);
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 16px;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
