<template>
  <div id="map" class="map-container border rounded-4" ref="mapContainer">
    <MapPopup
      v-if="mapStore.getMap() && gmapSession?.key && authWs?.token"
      :popupContent="clickedFeaturesProp"
      :gmapKey="gmapSession?.key"
      :token="authWs?.token"
      ref="mapPopup"
    />
  </div>

  <img
    src="../../../google_logo/google_logo/android/res/drawable-xxxhdpi/google_on_non_white.png"
    class="google-logo"
  />

  <YourPosition
    v-if="mapStore.getMap() && isMapLoaded"
    :popupContent="'blank'"
    :latitude="props.latitude"
    :longitude="props.longitude"
    :mapObj="mapStore.getMap()"
    :key="1"
    ref="position"
  />

  <div class="loading-spinner" v-if="!areRigsLoaded">
    <ProgressSpinner
      style="width: 50px; height: 50px; z-index:999;"
      strokeWidth="100"
      fill="var(--surface-ground)"
      animationDuration=".9s"
      aria-label="Custom ProgressSpinner"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, type ComponentPublicInstance, type Ref } from 'vue'
import { Network } from '@capacitor/network'
import YourPosition from './YourPosition.vue'
import proj4 from 'proj4'
import { getNearbyRigs } from '../../services/rigsService'
import { authenticate } from '@/services/authService'
import { useRigsStore, useRigsToShowStore, useAllRigsTypeStore, useRigsTypeStore } from '@/stores/rigs'
import type { RigItem, RigWrapper } from '@/interfaces/rig'
import { useMapStore } from '@/stores/googleMap.js'
import { getLastValidSession, getReverseGeocoding } from '@/services/googleMapService'
import Feature from 'ol/Feature.js'
import MapBrowserEvent from 'ol/MapBrowserEvent.js'
import { Cluster, Vector as VectorSource } from 'ol/source.js'
import { Vector as VectorLayer } from 'ol/layer.js'
import Point from 'ol/geom/Point.js'
import colors from '@/assets/rigTypesColor'
import { Fill, Style, Text, Icon } from 'ol/style.js'
import MapPopup from './MapPopup.vue'
import { useToast } from 'primevue/usetoast'
import ProgressSpinner from 'primevue/progressspinner'
import Overlay from 'ol/Overlay.js'

interface Props {
  rigs?: RigWrapper[]
  longitude: number
  latitude: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'getIsMapLoaded', value: boolean): void }>()

const rigsStore = useRigsStore()
const rigsToShowStore = useRigsToShowStore()
const allRigsTypeStore = useAllRigsTypeStore()
const rigsTypeStore = useRigsTypeStore()
const mapStore = useMapStore()

const mapContainer = ref<HTMLDivElement>()
const mapPopup = ref<ComponentPublicInstance | null>(null)
const position = ref<ComponentPublicInstance | null>(null)
const isMapLoaded = ref<boolean>(false)
const authWs = ref<{ token?: string } | null>(null)
const gmapSession = ref<{ session?: string; key?: string } | null>(null)
const vectorSource = ref<VectorSource | null>(null)
const clusterSource = ref<Cluster | null>(null)
const clusters = ref<VectorLayer | null>(null)
const clickedFeature = ref<Feature<any> | null>(null)
const overlay = ref<Overlay | null>(null)
const clickedFeaturesProp = ref<RigWrapper[] | null>(null)
const networkStatus = ref<'Online' | 'Offline' | null>(null)
const networkType = ref<string | null>(null)
const interval = ref<number | null>(null)
const areRigsLoaded = ref<boolean>(false)
const randomGcPoints = ref<Array<{ lat: number; lon: number }>>([])
const isReviewMode = import.meta.env.VITE_REVIEW_MODE as boolean
const toast = useToast()

const mainAuth = async (): Promise<void> => {
  await auth()
  await getGmapSession(authWs.value?.token ?? '')

  if (!gmapSession.value?.session || !gmapSession.value?.key) {
    return
  }

  await mapStore.initMap(mapContainer.value, gmapSession.value.session, gmapSession.value.key)
  setZoomAndPosition()
  dragMap()
  postRenderMap()
  singleClickEvent()
  checkNetworkStatus()
  rigsTypeStore.$subscribe(() => {
    const map = mapStore.getMap()
    if (map && overlay.value) {
      map.removeOverlay(overlay.value)
    }
    clickedFeaturesProp.value = null
    reloadOverlaysRigs()
  })
}

const checkNetworkStatus = (): void => {
  Network.addListener('networkStatusChange', (networkStatusEvent) => {
    const { connected, connectionType } = networkStatusEvent
    networkStatus.value = connected ? 'Online' : 'Offline'
    networkType.value = connectionType
  })
}

const singleClickEvent = (): void => {
  const map = mapStore.getMap()
  if (map) {
    map.on('click', manageOverlay)
  }
}

const manageOverlay = (e: MapBrowserEvent<PointerEvent> | null): void => {
  if (!mapPopup.value?.$refs?.popup) {
    return
  }

  overlay.value = new Overlay({
    element: mapPopup.value.$refs.popup as HTMLElement,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  })

  const map = mapStore.getMap()
  if (!map || !e) {
    if (overlay.value && map?.getOverlays().getArray().includes(overlay.value)) {
      map.removeOverlay(overlay.value)
    }
    return
  }

  clickedFeature.value = map.forEachFeatureAtPixel(e.pixel, (feature : any) => feature) as Feature<any> | null

  if (clickedFeature.value) {
    const arrayOfFeatures = clickedFeature.value.get('features')
    const arrayOfRigs = arrayOfFeatures.map((feature: any) => feature.get('rig') as RigItem)
    clickedFeaturesProp.value = arrayOfRigs
    overlay.value.set('isPopup', 'true')
    map.addOverlay(overlay.value)
    overlay.value.setPosition(clickedFeature.value.getGeometry().getCoordinates())
  } else if (overlay.value && map.getOverlays().getArray().includes(overlay.value)) {
    map.removeOverlay(overlay.value)
  }
}

const getGmapSession = async (token: string): Promise<void> => {
  gmapSession.value = await getLastValidSession(token)
  if (hasErrors(gmapSession.value)) {
    return
  }
}

const auth = async (): Promise<void> => {
  authWs.value = await authenticate('refuel', 'refuelistheway')
  if (hasErrors(authWs.value)) {
    return
  }
}

const showAndClusterizePopups = async (): Promise<void> => {
  removeClusterizedPopups()

  const features = rigsToShowStore.getRigs().map((rig: RigWrapper) => {
    let longitude = rig.rig.longitude as number
    let latitude = rig.rig.latitude as number
    const feature = new Feature(new Point([longitude, latitude]))
    feature.set('rig', rig)
    return feature
  })

  vectorSource.value = new VectorSource({
    features,
  })

  clusterSource.value = new Cluster({
    distance: 20,
    source: vectorSource.value as VectorSource,
  })

  clusters.value = new VectorLayer({
    source: clusterSource.value as Cluster,
    style: (feature) => buildClusterStyle(feature as Feature<any>),
  })

  mapStore.getMap()?.addLayer(clusters.value as VectorLayer)
}

const reloadOverlaysRigs = async (): Promise<void> => {
  await recalculateRigs()
  await showAndClusterizePopups()
}

const setZoomAndPosition = (): void => {
  const map = mapStore.getMap()
  if (!map) {
    return
  }
  map.getView().setCenter([props.longitude, props.latitude])
  map.getView().setZoom(14)
}

const convertOsmCoordinatesToGmCoordinates = (coordinates: [number, number]): [number, number] => {
  const source = proj4.Proj('EPSG:3857')
  const dest = proj4.Proj('EPSG:4326')
  const point = proj4.toPoint([coordinates[0], coordinates[1]])
  const convertedCoords = proj4.transform(source, dest, point, false)
  return [convertedCoords!.y, convertedCoords!.x]
}

const debounce = <F extends (...args: any[]) => void>(fn: F, wait = 300) => {
  let timeout: number | null = null
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      window.clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => {
      fn(...args)
      timeout = null
    }, wait)
  }
}

const debouncedReloadOverlaysRigs = debounce(async () => {
  await reloadOverlaysRigs()
}, 1000)

const dragMap = (): void => {
  const map = mapStore.getMap()
  if (!map) {
    return
  }
  map.on('pointerdrag', () => {})
  map.on('movestart', () => {})
  map.on('moveend', debouncedReloadOverlaysRigs)
}

const recalculateRigs = async (): Promise<void> => {
  const distanceThreshold = rigsStore.getRigs().length <= 0 ? 10 : 3

  let localRigs: RigWrapper[] | null = null
  if (isReviewMode) {
    const importedMock = await import('@/assets/mock-stations.json')
    localRigs = importedMock.default as unknown as RigWrapper[]
    for (let i = 0; i < localRigs.length; i += 1) {
      localRigs[i].rig.latitude = randomGcPoints.value[i].lat
      localRigs[i].rig.longitude = randomGcPoints.value[i].lon
    }
  } else {
    const center = mapStore.getMap()?.getView().getCenter()
    if (!center) {
      return
    }
    localRigs = await getNearbyRigs(center[1], center[0], distanceThreshold, authWs.value?.token ?? '')
  }

  areRigsLoaded.value = true
  if (hasErrors(localRigs)) {
    return
  }

    if (localRigs != null) {
        rigsStore.setRigs(
            rigsStore
                .getRigs()
                .concat(localRigs.filter((rig) => rigsStore.rigs.map((stored) => stored.rig.rigId).indexOf(rig.rig.rigId) < 0))
        )
    }


  rigsToShowStore.setRigs(rigsStore.getRigs())

  for (const rig of rigsToShowStore.getRigs()) {
    for (const rigPrice of rig.rigPrices) {
      if (!allRigsTypeStore.allTypes.includes(rigPrice.rigFuelType.rigFuelTypeDescription)) {
        allRigsTypeStore.addAllRigsType(rigPrice.rigFuelType.rigFuelTypeDescription)
      }
    }
  }

  if (rigsTypeStore.type != null) {
    rigsToShowStore.setRigs(
      rigsToShowStore
        .getRigs()
        .filter((rig) =>
          rig.rigPrices.some(
            (rigPrice) =>
              rigPrice.rigFuelType.rigFuelTypeDescription.toLowerCase() ===
              rigsTypeStore.getType()?.toLowerCase()
          )
        )
    )
  } else {
    rigsToShowStore.setRigs(rigsStore.getRigs())
  }

  if (localRigs && localRigs.length <= 0) {
    const countryObj = await getReverseGeocoding(props.latitude, props.longitude, gmapSession.value?.key ?? '')
    const countryInfo = countryObj.results[0].address_components.find((comp: any) => comp.types.includes('country'))
    if (countryInfo && countryInfo.long_name !== 'Italy' && countryInfo.long_name !== 'Italia') {
      toast.add({
        severity: 'warn',
        summary: 'Info',
        detail:
          'Questa applicazione è disponibile solo in ITALIA. Al momento non sono state trovate stazioni di servizio visualizzabili nella tua area geografica.',
        life: 5000,
      })
      return
    }

    toast.add({
      severity: 'warn',
      summary: 'Info',
      detail: 'Nessuna stazione di rifornimento trovata nelle tue vicinanze.',
      life: 5000,
    })
  }
}

const buildClusterStyle = (feature: Feature<any>): Style => {
  const size = feature.get('features').length
  let prices = feature.get('features').map((innerFeature: any) => innerFeature.values_.rig.rigPrices)
  prices = prices[0]
  prices = rigsTypeStore.getType() != null
    ? prices.filter(
        (price: any) =>
          price.rigFuelType.rigFuelTypeDescription.toLowerCase() === rigsTypeStore.getType()?.toLowerCase()
      )
    : prices

  const text = size > 1 ? size.toString() : `${prices[0].price.toFixed(2)}€`
  return new Style({
    image: new Icon({
      src: size === 1 ? getRigTypeIconColor() : getRigTypeIconColorDouble(),
      scale: 0.4,
    }),
    text: new Text({
      text,
      fill: new Fill({
        color: getTextRigTypeColor(),
      }),
      scale: 1,
      offsetY: 9,
      font: 'bold .7rem sans-serif',
    }),
  })
}

const hasErrors = (api: any): boolean => {
  if (!api) {
    return false
  }

  if (api.response) {
    console.log(api.response)
    toast.add({
      severity: 'error',
      summary: 'Errore',
      detail: 'Errore interno, qualcosa è andato storto, riprova più tardi.',
      life: 5000,
    })
    executeRetryInterval()
    return true
  }

  if (api.request) {
    console.log(api.request)
    toast.add({
      severity: 'error',
      summary: 'Errore',
      detail: 'Connessione al server non disponibile, verifica la connessione internet oppure riprova più tardi.',
      life: 5000,
    })
    executeRetryInterval()
    return true
  }

  if (api.message) {
    console.log(api.message)
    toast.add({
      severity: 'error',
      summary: 'Errore',
      detail: 'Errore generico',
      life: 5000,
    })
    return true
  }

  if (interval.value != null) {
    toast.add({ severity: 'success', summary: 'Info', detail: 'Connessione ripristinata.', life: 3000 })
  }
  clearInterval(interval.value ?? undefined)
  interval.value = null
  return false
}

const getButtons = (): any => (mapContainer.value as any)?.$refs?.buttons
const getGmap = (): { session?: string; key?: string } | null => gmapSession.value

const postRenderMap = (): void => {
  const map = mapStore.getMap()
  if (!map) {
    return
  }
  const layer = map.getLayers().getArray()[0]
  if (layer?.on) {
    layer.once('postrender', setMapLoaded)
  }
}

const setMapLoaded = (): void => {
  isMapLoaded.value = true
  emit('getIsMapLoaded', isMapLoaded.value)
  manageOverlay(null)
}

const removeOverlays = (): void => {
  const map = mapStore.getMap()
  if (!map) {
    return
  }

  for (const currentOverlay of map.getOverlays().getArray().slice(0)) {
    if (currentOverlay.get('isRig') != undefined) {
      map.removeOverlay(currentOverlay)
    }
  }
}

const removeClusterizedPopups = (): void => {
  if (clusters.value) {
    mapStore.getMap()?.removeLayer(clusters.value as VectorLayer)
  }
}

const getIsMapLoaded = (): boolean => isMapLoaded.value

const retry = (): number => {
  const retryApisCall = async (): Promise<void> => {
    toast.add({ severity: 'warn', summary: 'Info', detail: 'Tentativo di connessione in corso.', life: 3000 })
    await mainAuth()
    reloadOverlaysRigs()
  }
  return window.setInterval(retryApisCall, 10000)
}

const executeRetryInterval = async (): Promise<void> => {
  if (interval.value == null) {
    interval.value = retry()
  }
}

const getRigTypeIconColor = (): string => {
  if (rigsTypeStore.getType() == null) {
    return new URL('/icons/local_gas_stationx4-blue.jpg', import.meta.url).href
  }
  const iconName = `/icons/${colors.rigTypesIconColor.get(rigsTypeStore.getType()!.toLowerCase())}.jpg`
  return new URL(iconName, import.meta.url).href
}

const getRigTypeIconColorDouble = (): string => {
  if (rigsTypeStore.getType() == null) {
    return new URL('/icons/local_gas_stationx4-darkblue-double.jpg', import.meta.url).href
  }
  const iconName = `/icons/${colors.rigTypesIconColor.get(rigsTypeStore.getType()!.toLowerCase())}-double.jpg`
  return new URL(iconName, import.meta.url).href
}

const getTextRigTypeColor = (): string => {
  if (rigsTypeStore.getType() == null) {
    return '#3b82f6'
  }
  return colors.rigTypesColor.get(rigsTypeStore.getType()!.toLowerCase()) || '#3b82f6'
}

const generateCloseGCPoints = (lat: number, lon: number, distanceInMeters: number, numberPoints: number) => {
  const raggioTerra = 6371000
  const nuoviPunti: Array<{ lat: number; lon: number }> = []

  for (let i = 0; i < numberPoints; i += 1) {
    const dx = (Math.random() - 0.5) * 2 * distanceInMeters
    const dy = (Math.random() - 0.5) * 2 * distanceInMeters
    const deltaLat = dy / raggioTerra
    const deltaLon = dx / (raggioTerra * Math.cos((lat * Math.PI) / 180))
    const newLat = lat + (deltaLat * 180) / Math.PI
    const newLon = lon + (deltaLon * 180) / Math.PI
    nuoviPunti.push({ lat: newLat, lon: newLon })
  }

  return nuoviPunti
}

watch(networkStatus, (val) => {
  if (val === 'Offline') {
    toast.add({
      severity: 'warn',
      summary: 'Info',
      detail: "Connessione assente. Collegarsi a una rete internet per poter utilizzare l'applicazione.",
    })
  } else if (val === 'Online') {
    toast.add({ severity: 'success', summary: 'Info', detail: 'Connessione ripristinata.' })
  }
})

onMounted(async () => {
  if (isReviewMode) {
    randomGcPoints.value = generateCloseGCPoints(props.latitude, props.longitude, 1000, 13)
    toast.add({ severity: 'warn', summary: 'Info', detail: 'Versione Demo - Dati Simulati!' })
  }
  await mainAuth()
})

defineExpose({
  getButtons,
  getGmap,
  getIsMapLoaded,
  retry,
  executeRetryInterval,
})
</script>

<style scoped></style>
