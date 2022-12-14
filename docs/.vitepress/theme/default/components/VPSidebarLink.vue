<script lang="ts" setup>
import type { DefaultTheme } from 'vitepress/theme'
import { computed, inject } from 'vue'
import { useData } from 'vitepress'
import { isActive } from '../support/utils.js'
import VPLink from './VPLink.vue'

withDefaults(defineProps<{ item: DefaultTheme.SidebarItem; depth?: number }>(), { depth: 1 })

const { page, frontmatter } = useData()
const maxDepth = computed<number>(() => frontmatter.value.sidebarDepth || Infinity)
const closeSideBar = inject('close-sidebar') as () => void

const getLink = (item) => {
  return item.link || item?.items?.find((item) => /overview/i.test(item?.link?.split('/').pop()))?.link
}
</script>

<template>
  <VPLink
    v-if="!/overview/i.test(item.link)"
    class="link"
    :class="{ active: isActive(page.relativePath, getLink(item), true) }"
    :style="{ paddingLeft: 16 * (depth - 1) + 'px' }"
    :href="getLink(item)"
    @click="closeSideBar">
    <span class="link-text" :class="{ light: depth > 1 }">{{ item.text }}</span>
  </VPLink>
  <template v-if="'items' in item && depth < maxDepth" v-for="child in item.items" :key="child.link">
    <VPSidebarLink :item="child" :depth="depth + 1" />
  </template>
</template>

<style scoped>
.link {
  display: block;
  margin: 4px 0;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.link:hover {
  color: var(--vp-c-text-1);
}

.link.active {
  color: var(--vp-c-brand);
}

.link :deep(.icon) {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.link-text {
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
}

.link-text.light {
  font-size: 13px;
  font-weight: 400;
}
</style>
