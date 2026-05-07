<template>
  <TopNav :user-name="userName" page-title="New SB Campaign" />
  <RouterView />
  <Toaster />
</template>

<script setup>
import TopNav from '@/components/TopNav.vue'
import { Toaster } from '@/components/ui/toast'

const userName = 'Mia Hu'
</script>
