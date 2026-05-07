import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSbStore = defineStore('sb', () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const form = ref({
    // ── Step 1: Campaign Plan ──────────────────────────
    // Settings
    campaignName: '',
    budgetType: 'daily',     // 'daily' | 'lifetime'
    dailyBudget: 20.0,
    lifetimeBudget: null,
    scheduleType: 'continuous',
    startTime: todayDate,
    endTime: '',
    portfolio: '',

    // Brand (required for SB)
    brand: '',              // brand id
    brandName: '',          // display name
    brandLogo: '',          // logo URL

    // Goals (driver → affects landing page options in Step 3)
    goals: 'drive_page_visits',   // 'drive_page_visits' | 'brand_impression_share'

    // Sites
    siteType: 'amazon',     // 'amazon' (SB typically only shows on Amazon)

    // Bid Adjustment (Placements + Audiences, no bidding strategy selection)
    bidTop: 0,
    bidRest: 0,
    audienceMode: 'don_t_increase',
    audienceId: '',
    audiencePct: 0,

    // ── Step 2: Ad Group ──────────────────────────
    adGroupName: '',
    adGroupBid: 0.75,

    // Ad Format (driver → affects Step 3 content structure)
    adFormat: 'collections',   // 'collections' | 'video' | 'store_spotlight'

    // Targeting toggle (driver → affects targeting content in Step 3, only for Collections)
    targetingAuto: true,       // true = Automatic, false = Manual

    // Store spotlight (Step 2): same Manual Targeting choice as SP → drives Step 3 modules
    storeSpotlightManualTargetType: 'keyword', // 'keyword' | 'product'

    // Landing page (for Store spotlight + Video, set in Step 2)
    videoLandingType: 'product_detail',  // 'store' | 'product_detail'
    videoStorePage: '',         // selected page id for Video + Store on Amazon

    // ── Step 3: Ad ──────────────────────────
    // Common fields
    headline: '',              // max 50 chars
    landingPageType: 'store',  // 'store' | 'product_detail' (constrained by goals)

    // Products (for Collections + Video)
    // { id, asin, title, image, rating, reviews, originalPrice, price, inStock }
    products: [],

    // Keyword targeting (for Collections + Automatic)
    keywordTargetTab: 'enter',
    keywordTargetingDefaultBid: 0.75,
    keywordTargetingMatchTypes: { exact: true, broad: false, phrase: false },
    keywordSelectedCampaignId: '',
    keywordSelectedAdGroupId: '',
    keywords: [],

    // Product targeting / collections (for Collections + Automatic, optional)
    productCollections: [],    // selected product ASINs for product targeting

    // SP Product targeting parity (Store spotlight + product path; same keys as campaign store slice)
    productTargets: [],
    productProductTab: 'enter',
    productCategoryTab: 'suggested',
    productTargetingDefaultBid: 0.02,
    productDeliveryType: { exact: true, expanded: false },
    productSelectedCampaignId: '',
    productSelectedAdGroupId: '',

    // Store spotlight specific
    storeUrl: '',
    storePages: [],            // [{ id, title, url }] at least 3 pages

    // Video specific
    videoFile: null,
    videoPreviewUrl: '',

    // ── Step 4: Negative Targeting ──────────────────────────
    negativeKeywords: [],
    excludedProducts: [],
    excludedBrands: [],
  })

  // Mock brand list (would come from API)
  const brands = ref([
    { id: 'dreo', name: 'DREO', logo: 'https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/c/AmazonStores/ATVPDKIKX0DER/e38f83c8b3f19f17c5b5a3c8c8a7c1a8.w400.h400.png' },
    { id: 'homasy', name: 'Homasy', logo: 'https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/5/AmazonStores/ATVPDKIKX0DER/homasy-logo.png' },
    { id: 'levoit', name: 'LEVOIT', logo: 'https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/2/AmazonStores/ATVPDKIKX0DER/levoit-logo.png' },
  ])

  function reset() {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

    form.value = {
      campaignName: '',
      budgetType: 'daily',
      dailyBudget: 20.0,
      lifetimeBudget: null,
      scheduleType: 'continuous',
      startTime: todayDate,
      endTime: '',
      portfolio: '',
      brand: '',
      brandName: '',
      brandLogo: '',
      goals: 'drive_page_visits',
      siteType: 'amazon',
      bidTop: 0,
      bidRest: 0,
      audienceMode: 'don_t_increase',
      audienceId: '',
      audiencePct: 0,
      adGroupName: '',
      adGroupBid: 0.75,
      adFormat: 'collections',
      targetingAuto: true,
      storeSpotlightManualTargetType: 'keyword',
      videoLandingType: 'product_detail',
      videoStorePage: '',
      headline: '',
      landingPageType: 'store',
      products: [],
      keywordTargetTab: 'enter',
      keywordTargetingDefaultBid: 0.75,
      keywordTargetingMatchTypes: { exact: true, broad: false, phrase: false },
      keywordSelectedCampaignId: '',
      keywordSelectedAdGroupId: '',
      keywords: [],
      productCollections: [],
      productTargets: [],
      productProductTab: 'enter',
      productCategoryTab: 'suggested',
      productTargetingDefaultBid: 0.02,
      productDeliveryType: { exact: true, expanded: false },
      productSelectedCampaignId: '',
      productSelectedAdGroupId: '',
      storeUrl: '',
      storePages: [],
      videoFile: null,
      videoPreviewUrl: '',
      negativeKeywords: [],
      excludedProducts: [],
      excludedBrands: [],
    }
  }

  return { form, brands, reset }
})
