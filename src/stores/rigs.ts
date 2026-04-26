import { defineStore } from 'pinia'


export const useRigsStore = defineStore('rigs', {
  state: () => {
    return {
      rigs : []
    }
  },
  actions: {
    getRigs(){
      return this.rigs;
    },
    setRigs(rigs){
      this.rigs = rigs;
    },
    getLength(){
      return this.rigs.length
    }
  }
})

export const useRigsToShowStore = defineStore('rigsToShow', {
  state: () => {
    return {
      rigsToShow : []
    }
  },
  actions: {
    getRigs(){
      return this.rigsToShow;
    },
    setRigs(rigs){
      this.rigsToShow = rigs;
    },
    getLength(){
      return this.rigsToShow.length;
    }
  }
})

export const useRigsTypeStore = defineStore('type', {
  state: () => {
    return {
      type : null
    }
  },
  actions: {
    getType(){
      return this.type;
    },
    setType(type){
      this.type = type;
    }
  }
})

export const useAllRigsTypeStore = defineStore('allType', {
  state: () => {
    return {
      allTypes : []
    }
  },
  actions: {
    getAllRigsType(){
      this.allTypes.sort();
      return this.allTypes;
    },
    addAllRigsType(type){
      // this.allTypes.push(type);
      this.allTypes.findIndex(item => item.toLowerCase() === type.toLowerCase()) === -1 ? this.allTypes.push(type) : null
    }
  }
})

