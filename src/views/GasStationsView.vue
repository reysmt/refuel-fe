<template>
  <!-- on desktop -->
  <Toast position="top-center" style="width: 20rem; font-size: .8rem; top: 13px; background: 255, 255, 255 / 70%;" />
  <div class="main">
    <div class="loading-div" v-if="isMapLoaded == false">
      <Skeleton class="loading-skeleton"></Skeleton>
    </div>
    <div v-if="longitude != null && latitude != null" class="mapSection" ref="mapSection">
      <RigMap :longitude="longitude" :latitude="latitude" ref="mapContainer" @getIsMapLoaded="checkIfMapIsLoaded">
      </RigMap>
    </div>
    <NavbarMap :gmapKey="gmapKey" :longitude="longitude" :latitude="latitude"></NavbarMap>
  </div>
  <div class="loading-spinner" v-if="rigsToShowStore.getLength() == 0">
    <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="100" fill="var(--surface-ground)"
      animationDuration=".9s" aria-label="Custom ProgressSpinner" />
  </div>
</template>

<script setup>
</script>

<script>
import 'swiper/css';
import 'swiper/css/pagination';
import { ref } from 'vue';
import { getGeoIp } from '@/services/geoIpService';
import { Geolocation } from '@capacitor/geolocation';
import { SplashScreen } from '@capacitor/splash-screen';
import Toast from 'primevue/toast';
import { useRigsStore, useRigsToShowStore, useAllRigsTypeStore, useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
import RigMap from '@/components/Map.vue'
import Skeleton from 'primevue/skeleton';
import ProgressSpinner from 'primevue/progressspinner';
import NavbarMap from '@/components/NavbarMap.vue';
import { useToast } from "primevue/usetoast";


export default {
  components: {
    RigMap,
    Skeleton,
    ProgressSpinner,
    NavbarMap,
    Toast
  },
  data() {
    return {
      rigsStore: useRigsStore(),
      rigsToShowStore: useRigsToShowStore(),
      allRigsTypeStore: useAllRigsTypeStore(),
      rigsTypeStore: useRigsTypeStore(),
      mapStore: useMapStore(),
      selectedRigType: null,
      longitude: null,
      latitude: null,
      value: null,
      swiperKey: null,
      isRigDetailVisible: false,
      gmapKey: null,
      toast: null,
      mapContainer: ref(),
      isMapLoaded: false
    }
  },
  created() {
    if (this.isMobile()) {
      // this.$router.push('/mobile-stations');
    }
  },
  updated() {
  },
  async mounted() {
    this.toast = useToast()
    // this.getGeoFromBrowser();
    await this.getGeoFromCapacitor();
  },
  methods: {
    checkIfMapIsLoaded(val) {
      this.isMapLoaded = val;
      // console.log(val)
    },
    getGeoFromBrowser() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
      }
    },
    async getGeoFromCapacitor() {
      await Geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {
        this.geoSuccess(position);
        return position;
      }).catch((error) => {
        console.log(error)
        this.geoError();
        return null;
      }).finally(() => {
        SplashScreen.hide();
      });
    },
    geoSuccess(position) {
      this.longitude = position.coords.longitude;
      this.latitude = position.coords.latitude;

      console.log("GeoLocated: ", this.latitude + " " + this.longitude)
    },
    async geoError() {
      // status.textContent = "Geolocation is not supported by your browser";
      console.log("Geolocation is not supported by your browser")
      let geoIp = await getGeoIp();
      if (geoIp.message) {
        //45.468157212316896, 9.182358106761049
        console.log(geoIp.message)
        this.latitude = 45.468157212316896;
        this.longitude = 9.182358106761049;
      } else {
        this.latitude = geoIp.latitude;
        this.longitude = geoIp.longitude;
      }
      this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Per una esperienza migliore, ti consigliamo di attivare il servizio di localizzazione.' });
    },
    isMobile() {
      if (screen.width <= 768) {
        return true;
      }
      else {
        return false;
      }
    }
  }
}
</script>

<style scoped></style>
