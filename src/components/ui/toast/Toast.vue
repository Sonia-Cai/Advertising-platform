<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  toasts: { type: Array, default: () => [] },
  // [{ id, title, description, variant, duration }]
})

const emit = defineEmits(['dismiss'])

const variantClasses = {
  default: 'border bg-background text-foreground',
  destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
  success: 'border-green-500 bg-green-50 text-green-800',
  /** 产品选择器上限提示：白底、无边框、文案 #0C1322 14px */
  limit: 'border-0 bg-white text-[#0C1322]'
}
</script>

<template>
  <Teleport to="body">
    <!-- 贴顶、相对视口水平居中；多 toast 纵向堆叠 -->
    <div
      class="pointer-events-none fixed left-1/2 top-4 z-[2147483647] flex max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-2"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="cn(
            'pointer-events-auto relative inline-flex max-w-full overflow-hidden rounded-lg',
            toast.variant === 'limit'
              ? 'items-center gap-2 border-0 bg-white px-3 py-2 shadow-md'
              : 'items-start gap-3 border p-4 shadow-lg',
            variantClasses[toast.variant] ?? variantClasses.default
          )"
        >
          <!-- limit：图标 + 单行文案（设计稿 info-circle-filled） -->
          <template v-if="toast.variant === 'limit' && toast.description">
            <svg
              class="h-5 w-5 flex-shrink-0"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.0002 19.1663C15.0628 19.1663 19.1668 15.0623 19.1668 9.99968C19.1668 4.93707 15.0628 0.833008 10.0002 0.833008C4.93755 0.833008 0.833496 4.93706 0.833496 9.99968C0.833496 15.0623 4.93755 19.1663 10.0002 19.1663ZM9.16348 7.08302V5.4131H10.8334V7.08302H9.16348ZM10.8334 8.33302L10.8334 14.583H9.16673V8.33302L10.8334 8.33302Z"
                fill="#FFC000"
              />
            </svg>
            <p class="text-[14px] leading-[22px] text-[#0C1322] whitespace-nowrap">{{ toast.description }}</p>
          </template>
          <div v-else class="grid gap-1">
            <p v-if="toast.title" class="text-sm font-semibold">{{ toast.title }}</p>
            <p v-if="toast.description" class="text-sm opacity-80">{{ toast.description }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
