import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { IClip } from '@webav/av-cliper'

export interface MediaResource {
  id: string
  name: string
  type: string
  url?: string
  size: number
  extension: string
  duration?: number
  clip?: IClip
}

export const useMediaResourceStore = defineStore('mediaResource', () => {
  const resources = ref<MediaResource[]>([])

  const addResource = (resource: MediaResource) => {
    resources.value.push(resource)
  }

  const removeResource = (id: string) => {
    const index = resources.value.findIndex(r => r.id === id)
    if (index !== -1) {
      resources.value.splice(index, 1)
    }
  }

  const getResourceById = (id: string) => {
    return resources.value.find(r => r.id === id)
  }

  const updateResource = (id: string, resource: Partial<MediaResource>) => {
    const index = resources.value.findIndex(r => r.id === id)
    if (index !== -1) {
      resources.value[index] = { ...resources.value[index], ...resource }
    }
  }

  const getResourcesByType = computed(() => (type: string) => {
    return resources.value.filter(r => r.type.includes(type))
  })

  return {
    resources,
    addResource,
    removeResource,
    getResourceById,
    updateResource,
    getResourcesByType,
  }
}, {
  persist: {
    afterHydrate(ctx) {
      // 在hydrate之后，删除url和clip，因为持久化，这两个信息是失效的
      ctx.store.resources.forEach((r: MediaResource) => {
        delete r.url
        delete r.clip
      })
    },
  },
})
