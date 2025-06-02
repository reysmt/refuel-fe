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
    <NavbarMap v-if="isMapLoaded" :gmapKey="gmapKey" :longitude="longitude" :latitude="latitude"></NavbarMap>
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
import NavbarMap from '@/components/NavbarMap.vue';
import { useToast } from "primevue/usetoast";
// import getReverseGeocoding from '@/services/googleMapService';


export default {
  components: {
    RigMap,
    Skeleton,
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
      isMapLoaded: false,
      geoIp: null,
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
    await this.getGeoFromCapacitor();
    this.toast.add({ severity: 'success', summary: 'Benvenuto', detail: 'Benvenuto su Refuel!, scopri le stazioni di rifornimento più vicini a te!', life: 3000 });
  },
  methods: {
    checkIfMapIsLoaded(val) {
      this.isMapLoaded = val;
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
      console.log("Geolocation is not supported by your browser")
      this.geoIp = await getGeoIp();
      if (this.geoIp.message) {
        //45.468157212316896, 9.182358106761049
        console.log(this.geoIp.message)
        this.latitude = 45.468157212316896;
        this.longitude = 9.182358106761049;
      } else {
        this.latitude = this.geoIp.latitude;
        this.longitude = this.geoIp.longitude;
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
