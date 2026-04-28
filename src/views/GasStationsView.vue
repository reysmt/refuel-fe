<template>
  <Toast position="top-center" style="width: 20rem; font-size: .8rem; top: 13px; background: 255, 255, 255 / 70%;" />

  <div class="main">
    <div class="loading-div" v-if="!isMapLoaded">
      <Skeleton class="loading-skeleton" />
    </div>

    <div v-if="longitude != null && latitude != null" class="mapSection" ref="mapSection">
      <RigMap
        :longitude="longitude"
        :latitude="latitude"
        ref="mapContainer"
        @getIsMapLoaded="checkIfMapIsLoaded"
      />
    </div>

    <NavbarMap
      v-if="isMapLoaded"
      :gmapKey="gmapKey"
      :longitude="longitude"
      :latitude="latitude"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getGeoIp } from '@/services/geoIpService'
import { Geolocation } from '@capacitor/geolocation'
import { SplashScreen } from '@capacitor/splash-screen'
import Toast from 'primevue/toast'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import RigMap from '@/components/Map.vue'
import NavbarMap from '@/components/NavbarMap.vue'

interface GeoIpResult {
  message?: string
  latitude?: number
  longitude?: number
}

const longitude = ref<number | null>(null)
const latitude = ref<number | null>(null)
const gmapKey = ref<string | null>(null)
const isMapLoaded = ref<boolean>(false)
const geoIp = ref<GeoIpResult | null>(null)
const toast = useToast()

const checkIfMapIsLoaded = (val: boolean): void => {
  isMapLoaded.value = val
}

const geoSuccess = (position: { coords: { longitude: number; latitude: number } }): void => {
  longitude.value = position.coords.longitude
  latitude.value = position.coords.latitude
  console.log('GeoLocated: ', `${latitude.value} ${longitude.value}`)
}

const geoError = async (): Promise<void> => {
  console.log('Geolocation is not supported by your browser')
  geoIp.value = await getGeoIp()

  if (geoIp.value?.message) {
    console.log(geoIp.value.message)
    latitude.value = 45.468157212316896
    longitude.value = 9.182358106761049
  } else {
    latitude.value = geoIp.value?.latitude ?? 45.468157212316896
    longitude.value = geoIp.value?.longitude ?? 9.182358106761049
  }

  toast.add({
    severity: 'warn',
    summary: 'Info',
    detail: 'Per una esperienza migliore, ti consigliamo di attivare il servizio di localizzazione.',
  })
}

const getGeoFromCapacitor = async (): Promise<void> => {
  try {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
    geoSuccess(position as { coords: { longitude: number; latitude: number } })
  } catch (error) {
    console.log(error)
    await geoError()
  } finally {
    SplashScreen.hide()
  }
}

onMounted(async () => {
  await getGeoFromCapacitor()
  toast.add({
    severity: 'success',
    summary: 'Benvenuto',
    detail: 'Benvenuto su Refuel!, scopri le stazioni di rifornimento più vicini a te!',
    life: 3000,
  })
})
</script>

<style scoped></style>
