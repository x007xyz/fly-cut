import { defineStore } from 'pinia'
import type { IClip } from '@webav/av-cliper'

interface MediaResource {
  id: string
  name: string
  type: string
  url: string
  size: number
  duration?: number
  clip?: IClip
}

export const useMediaResourceStore = defineStore('mediaResource', {
  state: () => ({
    resources: [] as MediaResource[],
  }),
  actions: {
    addResource(resource: MediaResource) {
      this.resources.push(resource)
    },
    removeResource(id: string) {
      const index = this.resources.findIndex(r => r.id === id)
      if (index !== -1) {
        this.resources.splice(index, 1)
      }
    },
    getResourceById(id: string) {
      return this.resources.find(r => r.id === id)
    },
    // 更新资源信息
    updateResource(id: string, resource: Partial<MediaResource>) {
      const index = this.resources.findIndex(r => r.id === id)
      if (index !== -1) {
        this.resources[index] = { ...this.resources[index], ...resource }
      }
    },
  },
  getters: {
    getResourcesByType: state => (type: string) => {
      return state.resources.filter(r => r.type.includes(type))
    },
  },
})
