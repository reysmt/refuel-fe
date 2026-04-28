import { ref } from 'vue'
import { defineStore } from 'pinia'
import OLMap from 'ol/Map.js'
import TileLayer from 'ol/layer/Tile.js'
import View from 'ol/View.js'
import OSM from 'ol/source/OSM.js'
import { useGeographic } from 'ol/proj.js'

type MapTarget = string | HTMLElement

interface OlMapLike {
  getLayers(): any
  addLayer(layer: TileLayer): void
  removeLayer(layer: TileLayer): void
  getView(): any
  [key: string]: any
}

export const useMapStore = defineStore('map', () => {
  const map = ref<OlMapLike | null>(null)

  function getMap(): OlMapLike | null {
    return map.value
  }

  function initMap(target: MapTarget): void {
    useGeographic()

    map.value = new OLMap({
      target,
      layers: [
        new TileLayer({
          preload: Infinity,
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    }) as OlMapLike
  }

  return { map, getMap, initMap }
})
  