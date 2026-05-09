<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper :steps="steps" :current-step="getStepNumber('/sb/keyword-targeting')" />

      <div class="content-wrapper">
        <h2 class="page-title">Keyword Targeting</h2>
        <main class="main-content">
          <SbKeywordTargetingSection />
        </main>
      </div>
    </div>
  </div>

  <BottomBar show-back @cancel="onCancel" @back="onBack" @next="onNext" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'
import SbKeywordTargetingSection from './SbAdPage/shared/SbKeywordTargetingSection.vue'

const router = useRouter()
const { steps, getStepNumber, getNextPath, getBackPath } = useSbFlowSteps()

function onCancel() { router.push('/') }
function onBack() { router.push(getBackPath('/sb/keyword-targeting')) }
function onNext() { router.push(getNextPath('/sb/keyword-targeting')) }
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
  margin: 0 0 20px;
  padding: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
