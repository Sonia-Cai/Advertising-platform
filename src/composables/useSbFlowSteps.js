import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'

const campaignSubItems = [
  { label: 'Settings',        anchorId: 'section-sb-settings' },
  { label: 'Goals',           anchorId: 'section-sb-goals' },
  { label: 'Sites',           anchorId: 'section-sb-sites' },
  { label: 'Placements',      anchorId: 'section-sb-placements' },
  { label: 'Bid adjustment',  anchorId: 'section-sb-bid-adjustment' }
]

function buildAdGroupSubItems(form) {
  const base = [
    { label: 'Ad group name', anchorId: 'section-sb-ad-group-name' },
    { label: 'Ad format', anchorId: 'section-sb-ad-format' },
  ]
  if (form.adFormat === 'collections') {
    base.push({ label: 'Collection type', anchorId: 'section-sb-collection-type' })
    if (!form.targetingAuto) {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
  } else if (form.adFormat === 'store_spotlight' || form.adFormat === 'video') {
    base.push({ label: 'Landing page', anchorId: 'section-sb-landing-page' })
  }
  return base
}

function buildCollectionsAdSubItems(form) {
  const base = [{ label: 'Ad name', anchorId: 'section-sb-ad-name' }]
  if (form.targetingAuto) {
    base.push(
      { label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' },
      { label: 'Product exclusions', anchorId: 'section-sb-product-exclusions' }
    )
  } else {
    base.push({ label: 'Products', anchorId: 'section-sb-products' })
    if (form.storeSpotlightManualTargetType === 'keyword') {
      base.push({ label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' })
    } else {
      base.push({ label: 'Product targeting', anchorId: 'section-sb-ad-product-targeting' })
    }
  }
  return base
}

function buildVideoAdSubItems(form) {
  if (form.videoLandingType === 'store') {
    return [
      { label: 'Ad name', anchorId: 'section-sb-ss-ad-name' },
      { label: 'Headline', anchorId: 'section-sb-ss-headline' },
      { label: 'Brand store pages', anchorId: 'section-sb-ss-store-pages' },
      { label: 'Brand assets', anchorId: 'section-sb-ss-brand-assets' },
      { label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' },
      { label: 'Video', anchorId: 'section-sb-video' },
      { label: 'Products', anchorId: 'section-sb-products' }
    ]
  }
  return [
    { label: 'Ad name', anchorId: 'section-sb-video-ad-name' },
    { label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' },
    { label: 'Products', anchorId: 'section-sb-products' }
  ]
}

function buildStoreSpotlightAdSubItems(form) {
  const base = [
    { label: 'Ad name', anchorId: 'section-sb-ss-ad-name' },
    { label: 'Headline', anchorId: 'section-sb-ss-headline' },
    { label: 'Brand store pages', anchorId: 'section-sb-ss-store-pages' },
    { label: 'Brand assets', anchorId: 'section-sb-ss-brand-assets' },
  ]
  if (form.storeSpotlightManualTargetType === 'keyword') {
    base.push({ label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' })
  } else {
    base.push({ label: 'Product targeting', anchorId: 'section-sb-ss-products' })
  }
  return base
}

const negativeSubItems = [
  { label: 'Negative keyword', anchorId: 'section-negative-keyword' },
  { label: 'Exclude products', anchorId: 'section-negative-product' },
  { label: 'Exclude brands',   anchorId: 'section-negative-brand' }
]

export function useSbFlowSteps() {
  const store = useSbStore()
  const { form } = storeToRefs(store)

  const steps = computed(() => {
    const adFormat = form.value.adFormat

    // Determine Ad step subItems based on ad format
    let adSubItems
    switch (adFormat) {
      case 'video':
        adSubItems = buildVideoAdSubItems(form.value)
        break
      case 'store_spotlight':
        adSubItems = buildStoreSpotlightAdSubItems(form.value)
        break
      case 'collections':
      default:
        adSubItems = buildCollectionsAdSubItems(form.value)
    }

    const nextSteps = [
      { label: 'Campaign Plan', path: '/sb/campaign', subItems: campaignSubItems },
      { label: 'Ad Group', path: '/sb/ad-group', subItems: buildAdGroupSubItems(form.value) },
    ]

    nextSteps.push(
      { label: 'Ad', path: '/sb/ad', subItems: adSubItems },
      { label: 'Negative（optional）', path: '/sb/negative', subItems: negativeSubItems },
      { label: 'Launch campaign', path: '/sb/launch' }
    )

    return nextSteps.map((step, index) => ({ ...step, step: index + 1 }))
  })

  function getStepNumber(path) {
    const found = steps.value.find(s => s.path === path)
    return found ? found.step : 1
  }

  function getNextPath(currentPath) {
    const idx = steps.value.findIndex(s => s.path === currentPath)
    if (idx >= 0 && idx < steps.value.length - 1) {
      return steps.value[idx + 1].path
    }
    return currentPath
  }

  function getBackPath(currentPath) {
    const list = steps.value
    const idx = list.findIndex(s => s.path === currentPath)
    if (idx > 0) {
      return list[idx - 1].path
    }
    if (idx < 0 && currentPath === '/sb/ad') {
      return steps.value.some((s) => s.path === '/sb/product-targeting')
        ? '/sb/product-targeting'
        : '/sb/ad-group'
    }
    return currentPath
  }

  return { steps, getStepNumber, getNextPath, getBackPath }
}
