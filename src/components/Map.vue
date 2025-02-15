<template>
  <div id="map" class="map-container border rounded-4" ref="map">
    <!-- <div ref="popup" class="popup"></div> -->

    <MapPopup :popupContent="clickedFeaturesProp" :gmapKey="gmapSession.key" :token="authWs.token" ref="mapPopup"
      v-if="mapStore.getMap()!=null" />

  </div>
  <img src="../../google_logo/google_logo/android/res/drawable-mdpi/google_on_non_white.png" class="google-logo" />
  <YourPosition v-if="mapStore.getMap()!=null && isMapLoaded" :popupContent="'blank'" :latitude="latitude"
    :longitude="longitude" :mapObj="mapStore.getMap()" :key="1" ref="position" />

<!-- {{ console.log(showDetails) }} -->
  <!-- <div v-if="mapStore.getMap()!=null && isMapLoaded && rigsToShowStore.getLength() > 0">
    <ButtonRig v-for="rig in rigsToShowStore.getRigs()"
    :rig="rig.rig"
    :rigPrices="rig.rigPrices"
    :popupContent="rig.rig.rigName" 
    :latitude="rig.rig.latitude"
    :longitude="rig.rig.longitude" 
    :mapObj="mapStore.getMap()" 
    :key="rig.rig.rigId"
    :gmapKey="gmapSession.key"
    ref="buttons"/>
  </div> -->
</template>
<script setup>
import YourPosition from './YourPosition.vue'
import RigDetail from './RigDetail.vue';
// import MapPopup from './MapPopup.vue';
</script>
<script>
import proj4 from 'proj4';
import { getNearbyRigs } from "../services/rigsService";
import { authenticate} from '@/services/authService';
import { useRigsStore, useRigsToShowStore, useAllRigsTypeStore, useRigsTypeStore} from '@/stores/rigs';
// import { useMapStore } from '@/stores/customMap';
import { useMapStore } from '@/stores/googleMap.js';
import Overlay from 'ol/Overlay.js';
import {ref } from 'vue';
import {containsCoordinate} from 'ol/extent';
import googleMapService from '@/services/googleMapService';
// import ButtonRig from './ButtonRig.vue';
import { SplashScreen } from '@capacitor/splash-screen';
import Feature from 'ol/Feature.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import Point from 'ol/geom/Point.js';
import {
  Fill,
  Style,
  Text,
  Icon,
} from 'ol/style.js';
import MapPopup from './MapPopup.vue';
import { useToast } from "primevue/usetoast";
// let buttons = ref([])
let position =ref()
export default {
  name: "mapContainer",
  props: ['rigs','longitude','latitude'],
  data() {
    return {
      rigsStore : useRigsStore(),
      rigsToShowStore : useRigsToShowStore(),
      allRigsTypeStore: useAllRigsTypeStore(),
      rigsTypeStore : useRigsTypeStore(),
      mapStore: useMapStore(),
      isMapLoaded: false,
      authWs: null,
      gmapSession: null,
      // features: [],
      vectorSource: null,
      clusterSource: null,
      clusters: null,
      clickedFeature: null,
      overlay: null,
      clickedFeaturesProp: null,
      showDetails: false,
      toast : useToast()
    }
  },
  async mounted() {
    await this.auth();
    await this.getGmapSession(this.authWs.token);
    await this.mapStore.initMap(this.$refs.map, this.gmapSession.session, this.gmapSession.key)
    this.setZoomAndPosition();
    this.dragMap();
    this.postRenderMap()
    this.singleClickEvent();
    this.rigsTypeStore.$subscribe(() => {
      // this.removeOverlays();
      // console.log(this.rigsTypeStore.getType())
      // console.log(this.mapStore.getMap().getLayers().getArray())
      this.mapStore.getMap().removeOverlay(this.overlay);
      this.clickedFeaturesProp = null;
      this.reloadOverlaysRigs();
    });
  },
  updated(){
  },
  methods: {
    updatedVisibility(newVal) {
      this.showDetails = newVal
    },
    singleClickEvent(){
      this.mapStore.getMap().on('click', this.manageOverlay);
      
    },
    manageOverlay(e) {
      this.overlay = new Overlay({
        element: this.$refs.mapPopup.$refs.popup,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
      this.clickedFeature = e == null ? null : this.mapStore.getMap().forEachFeatureAtPixel(e.pixel, function (feature) {
        return feature;
      });
      if (this.clickedFeature) {
        // console.log(this.clickedFeature.getGeometry().getCoordinates())
        let arrayOfFeatures = this.clickedFeature.values_.features
        let arrayOfRigs = arrayOfFeatures.map((feature) => feature.values_.rig)
        this.clickedFeaturesProp = arrayOfRigs
        this.overlay.set("isPopup", "true");
        this.mapStore.getMap().addOverlay(this.overlay)
        this.overlay.setPosition(this.clickedFeature.getGeometry().getCoordinates())
      } else {
        this.mapStore.getMap().removeOverlay(this.overlay)
      }
    },
    async getGmapSession(token){
      this.gmapSession = await googleMapService.getLastValidSession(token);
      // console.log(this.gmapSession)
    },
    async auth(){
      this.authWs = await authenticate('refuel','refuelistheway')
      // console.log(this.authWs.token)
    },
    async showAndClusterizePopups(){
      this.removeClusterizedPopups();
      let features = [];
      // console.log(this.rigsToShowStore.getRigs().length)
      for (let i = 0; i < this.rigsToShowStore.getRigs().length; ++i) {
        let rig = this.rigsToShowStore.getRigs()[i];
        const coordinates = [rig.rig.longitude, rig.rig.latitude];
        features[i] = new Feature(new Point(coordinates));
        features[i].set('rig', rig);
        // console.log(features[i].values_.rig.rig)
      }

      this.vectorSource = new VectorSource({
        features: features,
      });

      this.clusterSource = new Cluster({
        distance: 25,
        source: this.vectorSource,
      });

      // console.log(features)
      this.clusters = new VectorLayer({
        source: this.clusterSource,
        name: 'clusters',
        style: (feature) => {
          return this.buildClusterStyle(feature)
        },
      });
      this.mapStore.getMap().addLayer(this.clusters);
      // console.log(this.mapStore.getMap().getLayers().getArray())
    },
    async reloadOverlaysRigs(){
      await this.recalculateRigs();
      // this.setupOverlays(this.mapStore.getMap());
      await this.showAndClusterizePopups();
    },
    setZoomAndPosition(){
      this.mapStore.getMap().getView().setCenter([this.longitude, this.latitude]);
      this.mapStore.getMap().getView().setZoom(this.mapStore.getMap().getView().getZoom() + 13);
    },
    //useless if useGeographic() is used
    convertOsmCoordinatesToGmCoordinates(coordinates){
      var source = proj4.Proj('EPSG:3857'); // OpenLayers projection
      var dest = proj4.Proj('EPSG:4326'); // Google Maps projection

      let point = proj4.toPoint([coordinates[0], coordinates[1]])

      let convertedCoords = proj4.transform(source, dest, point)

      console.log("open layer: " + coordinates[0] + " " + coordinates[1])
      console.log("google: " + convertedCoords.y + " " + convertedCoords.x)
      return [convertedCoords.y, convertedCoords.x]
    },
    dragMap(){
      this.mapStore.getMap().on('pointerdrag', function () { });
      this.mapStore.getMap().on('movestart', function () { });
      this.mapStore.getMap().on('moveend', this.reloadOverlaysRigs);
    },
    async recalculateRigs(){
      let distanceThreshold = 3;
      if(this.rigsStore.getRigs().length <= 0){
        distanceThreshold = 10;
      }
      this.localRigs = await getNearbyRigs(this.mapStore.getMap().getView().getCenter()[1], this.mapStore.getMap().getView().getCenter()[0], distanceThreshold, this.authWs.token)
      
      if (this.hasErrors(this.localRigs)){
        return;
      }

      this.rigsStore.setRigs(this.rigsStore.getRigs().concat(this.localRigs.filter((rig) => this.rigsStore.rigs.map(rig => rig.rig.rigId).indexOf(rig.rig.rigId) < 0)));  //filter duplicates
      this.rigsToShowStore.setRigs(this.rigsStore.getRigs());
      for(let rig of this.rigsToShowStore.getRigs()){
        for(let rigPrice of rig.rigPrices){
          if(this.allRigsTypeStore.allTypes.indexOf(rigPrice.rigFuelType.rigFuelTypeDescription) < 0){
            this.allRigsTypeStore.addAllRigsType(rigPrice.rigFuelType.rigFuelTypeDescription)
          }
        }
      }
      // console.log(this.rigsTypeStore.getType())
      if(this.rigsTypeStore.type != null){
        this.rigsToShowStore.setRigs(this.rigsToShowStore.getRigs().filter((rig) => rig.rigPrices.some((rigPrice) => rigPrice.rigFuelType.rigFuelTypeDescription.toLowerCase() == this.rigsTypeStore.getType().toLowerCase())))
      }else{
        this.rigsToShowStore.setRigs(this.rigsStore.getRigs())
      }
      // console.log(this.rigsToShowStore.getRigs())
    },
    setupOverlays(map) {
      let extent = map.getView().calculateExtent(map.getSize().map( i => i+50));
      // console.log(map.getSize())
      if (this.$refs.buttons != null) {
        for (let button of this.$refs.buttons) {
          let position = { coordinate: [button.longitude, button.latitude] };
          let overlay = new Overlay({
            element: button.$refs.popup,
            // autoPan: {
            //     animation: {
            //         duration: 250,
            //     },
            // },
          });
          overlay.set("isRig","true")
          if (containsCoordinate(extent, position.coordinate)) {
            // console.log('inserted ' + map.addOverlay(overlay))
            map.addOverlay(overlay)
            overlay.setPosition(position.coordinate)
          } else {
            // console.log("removed " + map.removeOverlay(overlay))
            map.removeOverlay(overlay)
          }
          
        }
      }
    },
    buildClusterStyle(feature){
      const size = feature.get('features').length;
      let prices = feature.get('features').map((feature) => feature.values_.rig.rigPrices) //all prices in a cluster
      let text;
      prices = prices[0]
      // console.log(prices)
      prices = this.rigsTypeStore.getType() != null 
                ? 
                prices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == this.rigsTypeStore.getType().toLowerCase()) 
                : prices
      // console.log(prices)
      text = size > 1 ? size.toString() : prices[0].price.toFixed(2).toString() + "€".toString();
      let style = null;
      style = new Style({
        image: new Icon({
          src: size == 1 ? new URL('@/assets/local_gas_stationx4-blue.jpg', import.meta.url).href : new URL('@/assets/local_gas_stationx4-darkblue.jpg', import.meta.url).href,
          scale: 0.4,
        }),
        text: new Text({
          text: text,
          fill: new Fill({
            color: size == 1 ? '#3b82f6' : '#0055DF',
          }),
          scale: 1,
          offsetY: 9,
          font: 'bold .7rem sans-serif',
        }),
      });
      return style;
    },
    hasErrors(error){
      if(error.response){
        console.log(error.response);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Errore di connessione, controlla la connessione internet e riprova.'});
        return true;
      } else if (error.request){
        console.log(error.request);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Connessione al server non disponibile, riprova più tardi.'});
        return true;
      } else if (error.message) {
        console.log(error.message);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Errore generico'});
        return true;
      }
      return false;
    },
    getButtons(){
      return this.$refs.buttons;
    },
    getGmap(){
      return this.gmapSession;
    },
    postRenderMap(){
      this.mapStore.getMap().getLayers().getArray()[0].on('postrender',this.setMapLoaded())
    },
    setMapLoaded(){
      this.isMapLoaded=true;
      this.manageOverlay(null)
      SplashScreen.hide();
      // console.log("map loaded")
    },
    getIsMapLoaded(){
      return this.isMapLoaded;
    },
    removeOverlays(){
      for(let overlay of this.mapStore.getMap().getOverlays().getArray().slice(0)){
          if(overlay.get('isRig') != undefined){
            this.mapStore.getMap().removeOverlay(overlay)
          }
        }
    },
    removeClusterizedPopups(){
      this.mapStore.getMap().removeLayer(this.clusters);
    }
  }
}
</script>
<style>

</style>
