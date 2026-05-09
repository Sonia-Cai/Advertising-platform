import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/campaign' },

  // ── SP Routes ──────────────────────────────────────────
  {
    path: '/campaign',
    component: () => import('@/pages/CampaignPage/index.vue'),
    meta: { step: 1, label: 'Campaign Plan' }
  },
  {
    path: '/ad-group/auto',
    component: () => import('@/pages/AdGroupPage/AutoPage.vue'),
    meta: { step: 2, label: 'Ad Group' }
  },
  {
    path: '/ad-group/manual',
    component: () => import('@/pages/AdGroupPage/ManualPage.vue'),
    meta: { step: 2, label: 'Ad Group' }
  },
  {
    path: '/keyword-targeting',
    component: () => import('@/pages/KeywordTargetingPage.vue'),
    meta: { step: 3, label: 'Keyword targeting' }
  },
  {
    path: '/product-targeting',
    component: () => import('@/pages/ProductTargetingPage.vue'),
    meta: { step: 3, label: 'Product targeting' }
  },
  {
    path: '/negative-targeting',
    component: () => import('@/pages/NegativeTargetingPage.vue'),
    meta: { label: 'Negative targeting' }
  },
  {
    path: '/ad',
    component: () => import('@/pages/AdPage.vue'),
    meta: { label: 'Targeting' }
  },

  // ── SB Routes ──────────────────────────────────────────
  {
    path: '/sb/campaign',
    component: () => import('@/pages/SbCampaignPage/index.vue'),
    meta: { step: 1, label: 'Campaign Plan', type: 'sb' }
  },
  {
    path: '/sb/ad-group',
    component: () => import('@/pages/SbAdGroupPage/index.vue'),
    meta: { step: 2, label: 'Ad Group', type: 'sb' }
  },
  {
    path: '/sb/ad',
    component: () => import('@/pages/SbAdPage/index.vue'),
    meta: { step: 3, label: 'Ad', type: 'sb' }
  },
  {
    path: '/sb/keyword-targeting',
    component: () => import('@/pages/SbKeywordTargetingPage.vue'),
    meta: { step: 4, label: 'Keyword Targeting', type: 'sb' }
  },
  {
    path: '/sb/product-targeting',
    component: () => import('@/pages/SbProductTargetingPage.vue'),
    meta: { step: 4, label: 'Product Targeting', type: 'sb' }
  },
  {
    path: '/sb/negative',
    component: () => import('@/pages/SbNegativePage.vue'),
    meta: { step: 4, label: 'Negative targeting', type: 'sb' }
  },
  {
    path: '/sb/launch',
    component: () => import('@/pages/SbLaunchPage.vue'),
    meta: { step: 5, label: 'Launch campaign', type: 'sb' }
  }
]

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})
