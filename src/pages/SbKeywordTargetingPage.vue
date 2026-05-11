<template>
  <div class="page-layout">
    <div class="page-center">
      <Stepper :steps="keywordTargetingSteps" :current-step="currentStep" />

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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Stepper from '@/components/Stepper.vue'
import BottomBar from '@/components/BottomBar.vue'
import { useSbFlowSteps } from '@/composables/useSbFlowSteps'
import SbKeywordTargetingSection from './SbAdPage/shared/SbKeywordTargetingSection.vue'

const router = useRouter()
const { steps } = useSbFlowSteps()

const keywordTargetingSteps = computed(() => {
  if (steps.value.some((step) => step.path === '/sb/keyword-targeting')) {
    return steps.value
  }

  const rawSteps = steps.value.map(({ step, ...rest }) => rest)
  const adIndex = rawSteps.findIndex((step) => step.path === '/sb/ad')
  const insertIndex = adIndex >= 0 ? adIndex + 1 : rawSteps.length - 2

  rawSteps.splice(insertIndex, 0, {
    label: 'Keyword Targeting',
    path: '/sb/keyword-targeting'
  })

  return rawSteps.map((step, index) => ({ ...step, step: index + 1 }))
})

const currentStep = computed(() => (
  keywordTargetingSteps.value.find((step) => step.path === '/sb/keyword-targeting')?.step ?? 1
))

function getSiblingPath(offset) {
  const currentIndex = keywordTargetingSteps.value.findIndex((step) => step.path === '/sb/keyword-targeting')
  return keywordTargetingSteps.value[currentIndex + offset]?.path ?? '/sb/keyword-targeting'
}

function onCancel() { router.push('/') }
function onBack() { router.push(getSiblingPath(-1)) }
function onNext() { router.push(getSiblingPath(1)) }
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
