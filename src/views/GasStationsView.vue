<template>
  <!-- on desktop -->
  <div class="main">
    <div class="loading-div" v-if="mapContainer == null">
      <Skeleton class="loading-skeleton"></Skeleton>
    </div>
    <div v-if="longitude != null && latitude != null" class="mapSection">
      <Map :longitude="longitude" :latitude="latitude" ref="mapContainer">
      </Map>
    </div>
    <NavbarMap :gmapKey="gmapKey"></NavbarMap>
  </div>
  <div class="loading-spinner" v-if="rigsToShowStore.getLength() == 0">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="100" fill="var(--surface-ground)"
        animationDuration=".9s" aria-label="Custom ProgressSpinner" />
    </div>
</template>

<script setup>
import { useRigsStore, useRigsToShowStore, useAllRigsTypeStore, useRigsTypeStore} from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
import Map from '@/components/Map.vue'
import Skeleton from 'primevue/skeleton';
import ProgressSpinner from 'primevue/progressspinner';
import NavbarMap from '@/components/NavbarMap.vue';
</script>

<script>
// import { Swiper, SwiperSlide } from 'swiper/vue';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { ref } from 'vue';
// import required modules
// import { Pagination } from 'swiper/modules';
import { getNearbyRigs } from "../services/rigsService";
// const mapStore = useMapStore();
let mapContainer = ref()
// let cardRig = ref([])
export default {
  components:{
    // CardRig : defineAsyncComponent(() => import('../components/CardRig.vue'))
  },
    data(){
    return{
      rigsStore: useRigsStore(),
      rigsToShowStore : useRigsToShowStore(),
      allRigsTypeStore : useAllRigsTypeStore(),
      rigsTypeStore: useRigsTypeStore(),
      mapStore : useMapStore(),
      selectedRigType: null,
      longitude: null,
      latitude: null,
      value:null,
      swiperKey:null,
      isRigDetailVisible: false,
      gmapKey: null
    }
  },
  // setup() {
  //     return {
  //       modules: [Pagination],
  //     };
  //   },
  created(){
    if (this.isMobile()) {
      // this.$router.push('/mobile-stations');
    }
  },
  updated(){
    if(this.rigsToShowStore != null && this.rigsToShowStore.getLength() > 0){
      if(mapContainer.value!=null && mapContainer.value.getIsMapLoaded && mapContainer.value.getButtons()){
        // mapContainer.value.setupOverlays(this.mapStore.getMap());
        this.gmapKey = mapContainer.value.getGmap().key;
      }
    }
  },
  mounted() {
    // console.log(rigsToShowStore.getRigs().rig)
    this.getGeoFromBrowser();
  },
  watch:{
    // selectedRigType: function(val){
    //   if(val){
    //     for(let overlay of this.mapStore.getMap().getOverlays().getArray().slice(0)){
    //       if(overlay.get('isRig') != undefined){
    //         this.mapStore.getMap().removeOverlay(overlay)
    //       }
    //     }
    //     console.log(this.mapStore.getMap().getOverlays())
    //     // this.mapStore.getMap().getOverlays().clear();
    //     this.rigsTypeStore.setType(val);
    //     // console.log(this.rigsTypeStore.getType())
    //     this.rigsToShowStore.setRigs(this.rigsStore.getRigs().filter((rig) => rig.rigPrices.some((rigPrices) => rigPrices.rigFuelType.rigFuelTypeDescription == this.rigsTypeStore.getType())))
    //     // console.log(this.rigsToShowStore.getRigs())
    //     this.swiperKey += 1
    //   }
    // }
  },
  methods: {
    getGeoFromBrowser(){
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
      }
    },
    geoSuccess(position) {
      this.longitude = position.coords.longitude;
      this.latitude = position.coords.latitude;
      
      console.log("GeoLocated: ",this.latitude + " " + this.longitude)

      // this.showNearbyRigs(this.latitude, this.longitude)
      // console.log(JSON.parse(JSON.stringify(mapView.value)))
      
    },
    geoError(){
      // status.textContent = "Geolocation is not supported by your browser";
      console.log("Geolocation is not supported by your browser")
    },
    async showNearbyRigs(latitude, longitude){
      let rigs = await getNearbyRigs(latitude, longitude, 0.04)
      this.rigsStore.setRigs(rigs)
      this.rigsToShowStore.setRigs(this.rigsStore.getRigs())
    },
    isMobile() {
      if (screen.width <= 768) {
        console.log(screen.width)
        return true;
      }
      else {
        console.log(screen.width)
        return false;
      }
    }
  }
}
</script>

<style scoped>
</style>
