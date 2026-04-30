import type VectorLayer from 'ol/layer/Vector'

export interface OlMapLike {
  getLayers(): any
  addLayer(layer: VectorLayer): void
  removeLayer(layer: VectorLayer): void
  getView(): any
  [key: string]: any
}