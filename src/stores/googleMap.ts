import { ref } from 'vue'
import { defineStore } from 'pinia'
import OpenLayersMap from 'ol/Map.js'
import TileLayer from 'ol/layer/Tile.js'
import View from 'ol/View.js'
import { useGeographic } from 'ol/proj.js'
import { XYZ } from 'ol/source'
import type VectorLayer from 'ol/layer/Vector'

type MapTarget = string | HTMLElement | undefined

interface OlMapLike {
  getLayers(): any
  addLayer(layer: VectorLayer): void
  removeLayer(layer: VectorLayer): void
  getView(): any
  [key: string]: any
}

export const useMapStore = defineStore('map', () => {
  const map = ref<OlMapLike | null>(null)

  function getMap(): OlMapLike | null {
    return map.value
  }

  async function initMap(target: MapTarget, session: string, key: string): Promise<void> {
    useGeographic()

    const layer = new TileLayer({
      preload: Infinity,
      source: new XYZ({
        url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${session}&key=${key}`,
      }),
    })

    if (!map.value) {
      map.value = new OpenLayersMap({
        target,
        controls: [],
        layers: [layer],
        view: new View({
          center: [0, 0],
          zoom: 1,
        }),
      }) as OlMapLike
      return
    }

    const currentMap = map.value as any
    const layers = currentMap.getLayers() as any[]
    layers.forEach((existingLayer: any) => {
      if (existingLayer instanceof TileLayer) {
        currentMap.removeLayer(existingLayer)
      }
    })

    currentMap.addLayer(layer)
  }

  return { map, getMap, initMap }
})
  