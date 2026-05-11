import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSbStore } from '@/stores/sb'

const campaignSubItems = [
  { label: 'Settings',        anchorId: 'section-sb-settings' },
  { label: 'Goals',           anchorId: 'section-sb-goals' },
  { label: 'Sites',           anchorId: 'section-sb-sites' }
]

function buildAdGroupSubItems(form) {
  const showBidAdjustmentSection = !(
    form.siteType === 'amazon_business'
    && (
      (
        form.goals === 'brand_impression_share'
        && (
          form.adFormat === 'collections'
          || form.adFormat === 'store_spotlight'
          || form.adFormat === 'video'
        )
      )
      || (
        form.goals === 'drive_page_visits'
        && form.adFormat === 'video'
      )
    )
  )
  const base = [
    { label: 'Ad group name', anchorId: 'section-sb-ad-group-name' },
    { label: 'Ad format', anchorId: 'section-sb-ad-format' },
  ]
  if (form.adFormat === 'collections') {
    base.push({ label: 'Collection type', anchorId: 'section-sb-collection-type' })
    if (
      (
        form.goals === 'drive_page_visits'
        || form.goals === 'brand_impression_share'
      )
      && !form.targetingAuto
    ) {
      base.push({ label: 'Landing page', anchorId: 'section-sb-landing-page' })
    }
    if (showBidAdjustmentSection) {
      base.push({ label: 'Placements', anchorId: 'section-sb-placements' })
      base.push({ label: 'Bid adjustment', anchorId: 'section-sb-bid-adjustment' })
    }
    if (
      !form.targetingAuto
      && form.goals !== 'drive_page_visits'
      && form.goals !== 'brand_impression_share'
    ) {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
  } else if (form.adFormat === 'store_spotlight' || form.adFormat === 'video') {
    base.push({ label: 'Landing page', anchorId: 'section-sb-landing-page' })
    if (showBidAdjustmentSection) {
      base.push({ label: 'Placements', anchorId: 'section-sb-placements' })
      base.push({ label: 'Bid adjustment', anchorId: 'section-sb-bid-adjustment' })
    }
    if (
      form.adFormat === 'store_spotlight'
      && form.goals !== 'drive_page_visits'
      && form.goals !== 'brand_impression_share'
    ) {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
  }
  return base
}

function buildCollectionsAdSubItems(form) {
  const base = [{ label: 'Ad name', anchorId: 'section-sb-ad-name' }]
  const hasSeparateKeywordTargetingStep = (
    form.goals === 'drive_page_visits'
    && !form.targetingAuto
    && form.storeSpotlightManualTargetType === 'keyword'
  )
  const hasSeparateProductTargetingStep = (
    form.goals === 'drive_page_visits'
    && !form.targetingAuto
    && form.storeSpotlightManualTargetType === 'product'
  )
  if (form.targetingAuto) {
    base.push(
      { label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' },
      { label: 'Product exclusions', anchorId: 'section-sb-product-exclusions' }
    )
  } else {
    if (form.goals === 'drive_page_visits' || form.goals === 'brand_impression_share') {
      base.push({ label: 'Ad title', anchorId: 'section-sb-ad-title' })
    }
    base.push({ label: 'Products', anchorId: 'section-sb-products' })
    if (form.goals === 'drive_page_visits') {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
    if (form.storeSpotlightManualTargetType === 'keyword' && !hasSeparateKeywordTargetingStep) {
      base.push({ label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' })
    } else if (form.storeSpotlightManualTargetType === 'product' && !hasSeparateProductTargetingStep) {
      base.push({ label: 'Product targeting', anchorId: 'section-sb-ad-product-targeting' })
    }
  }
  return base
}

function shouldShowKeywordTargetingStep(form) {
  return (
    (
      form.adFormat === 'collections'
      && !form.targetingAuto
      && (
        (
          form.goals === 'drive_page_visits'
          && form.storeSpotlightManualTargetType === 'keyword'
        )
        || form.goals === 'brand_impression_share'
      )
    )
    || (
      form.adFormat === 'store_spotlight'
      && (
        (
          form.goals === 'drive_page_visits'
          && form.storeSpotlightManualTargetType === 'keyword'
        )
        || form.goals === 'brand_impression_share'
      )
    )
    || (
      form.adFormat === 'video'
      && (
        form.goals === 'brand_impression_share'
        || (
          (
            form.videoLandingType === 'product_detail'
            || form.videoLandingType === 'store'
          )
          && form.storeSpotlightManualTargetType === 'keyword'
        )
      )
    )
  )
}

function shouldShowProductTargetingStep(form) {
  return (
    form.goals === 'drive_page_visits'
    && form.storeSpotlightManualTargetType === 'product'
    && (
      (
        form.adFormat === 'collections'
        && !form.targetingAuto
      )
      || form.adFormat === 'store_spotlight'
      || (
        form.adFormat === 'video'
        && (
          form.videoLandingType === 'product_detail'
          || form.videoLandingType === 'store'
        )
      )
    )
  )
}

function buildVideoAdSubItems(form) {
  if (form.videoLandingType === 'store') {
    const base = [
      { label: 'Ad name', anchorId: 'section-sb-ss-ad-name' },
      { label: 'Headline', anchorId: 'section-sb-ss-headline' },
      { label: 'Video', anchorId: 'section-sb-video' },
      { label: 'Products', anchorId: 'section-sb-products' },
      { label: 'Brand assets', anchorId: 'section-sb-ss-brand-assets' }
    ]
    if (form.goals !== 'brand_impression_share') {
      base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
    }
    return base
  }
  if (form.goals === 'drive_page_visits') {
    return [
      { label: 'Ad name', anchorId: 'section-sb-ss-ad-name' },
      { label: 'Product', anchorId: 'section-sb-products' },
      { label: 'Video', anchorId: 'section-sb-video' },
      { label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' }
    ]
  }
  return [
    { label: 'Ad name', anchorId: 'section-sb-video-ad-name' },
    { label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' },
    { label: 'Product', anchorId: 'section-sb-products' },
    { label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' }
  ]
}

function buildStoreSpotlightAdSubItems(form) {
  const base = [
    { label: 'Ad name', anchorId: 'section-sb-ss-ad-name' },
    { label: 'Headline', anchorId: 'section-sb-ss-headline' },
    { label: 'Brand store pages', anchorId: 'section-sb-ss-store-pages' },
    { label: 'Brand assets', anchorId: 'section-sb-ss-brand-assets' },
  ]
  if (form.goals === 'drive_page_visits') {
    base.push({ label: 'Manual targeting', anchorId: 'section-sb-store-spotlight-manual-targeting' })
  }
  const hasSeparateKeywordTargetingStep = (
    (
      form.goals === 'drive_page_visits'
      && form.storeSpotlightManualTargetType === 'keyword'
    )
    || form.goals === 'brand_impression_share'
  )
  const hasSeparateProductTargetingStep = (
    (
      form.goals === 'drive_page_visits'
      && form.storeSpotlightManualTargetType === 'product'
    )
    || form.goals === 'brand_impression_share'
  )

  if (form.storeSpotlightManualTargetType === 'keyword' && !hasSeparateKeywordTargetingStep) {
    base.push({ label: 'Keyword targeting', anchorId: 'section-sb-keyword-targeting' })
  } else {
    if (form.storeSpotlightManualTargetType === 'product' && !hasSeparateProductTargetingStep) {
      base.push({ label: 'Product targeting', anchorId: 'section-sb-ss-products' })
    }
  }
  return base
}

function buildNegativeSubItems(form) {
  const base = []
  const hideProductBrandExclusions = (
    (
      form.adFormat === 'collections'
      && (
        (
          form.goals === 'drive_page_visits'
          && (
            form.targetingAuto
            || form.storeSpotlightManualTargetType === 'keyword'
          )
        )
        || (
          form.goals === 'brand_impression_share'
        )
      )
    )
    || (
      form.adFormat === 'store_spotlight'
      && (
        form.goals === 'brand_impression_share'
        || (
          form.goals === 'drive_page_visits'
          && form.storeSpotlightManualTargetType === 'keyword'
        )
      )
    )
    || (
      form.adFormat === 'video'
      && (
        form.videoLandingType === 'product_detail'
        || form.videoLandingType === 'store'
      )
      && form.storeSpotlightManualTargetType === 'keyword'
    )
  )
  const hideNegativeKeyword = (
    form.goals === 'drive_page_visits'
    && form.storeSpotlightManualTargetType === 'product'
    && (
      (
        form.adFormat === 'collections'
        && !form.targetingAuto
      )
      || form.adFormat === 'store_spotlight'
      || (
        form.adFormat === 'video'
        && (
          form.videoLandingType === 'product_detail'
          || form.videoLandingType === 'store'
        )
      )
    )
  )

  if (!hideNegativeKeyword) {
    base.push({ label: 'Negative keyword', anchorId: 'section-negative-keyword' })
  }
  if (!hideProductBrandExclusions) {
    base.push(
      { label: 'Exclude products', anchorId: 'section-negative-product' },
      { label: 'Exclude brands', anchorId: 'section-negative-brand' }
    )
  }
  return base
}

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
      ...(shouldShowKeywordTargetingStep(form.value)
        ? [{ label: 'Keyword Targeting', path: '/sb/keyword-targeting' }]
        : []),
      ...(shouldShowProductTargetingStep(form.value)
        ? [{ label: 'Product Targeting', path: '/sb/product-targeting' }]
        : []),
      { label: 'Negative（optional）', path: '/sb/negative', subItems: buildNegativeSubItems(form.value) },
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
