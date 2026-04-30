import { defineStore } from 'pinia'

import type { RigWrapper, RigsState, RigsToShowState, RigsTypeState, AllRigsTypeState } from '@/interfaces/rig'

export const useRigsStore = defineStore('rigs', {
  state: (): RigsState => ({
    rigs: [],
  }),
  actions: {
    getRigs(): RigWrapper[] {
      return this.rigs
    },
    setRigs(rigs: RigWrapper[]): void {
      this.rigs = rigs
    },
    getLength(): number {
      return this.rigs.length
    },
  },
})

export const useRigsToShowStore = defineStore('rigsToShow', {
  state: (): RigsToShowState => ({
    rigsToShow: [],
  }),
  actions: {
    getRigs(): RigWrapper[] {
      return this.rigsToShow
    },
    setRigs(rigs: RigWrapper[]): void {
      this.rigsToShow = rigs
    },
    getLength(): number {
      return this.rigsToShow.length
    },
  },
})

export const useRigsTypeStore = defineStore('type', {
  state: (): RigsTypeState => ({
    type: null,
  }),
  actions: {
    getType(): string | null {
      return this.type
    },
    setType(type: string | null): void {
      this.type = type
    },
  },
})

export const useAllRigsTypeStore = defineStore('allType', {
  state: (): AllRigsTypeState => ({
    allTypes: [],
  }),
  actions: {
    getAllRigsType(): string[] {
      return [...this.allTypes].sort((a, b) => a.localeCompare(b))
    },
    addAllRigsType(type: string): void {
      const normalized = type.trim().toLowerCase()
      if (!this.allTypes.some((item) => item.toLowerCase() === normalized)) {
        this.allTypes.push(type)
      }
    },
  },
})

