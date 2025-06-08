<template>
  <div id="map" class="map-container border rounded-4" ref="map">

    <MapPopup :popupContent="clickedFeaturesProp" :gmapKey="gmapSession.key" :token="authWs.token" ref="mapPopup"
      v-if="mapStore.getMap() != null" />

  </div>
  <img src="../../google_logo/google_logo/android/res/drawable-xxxhdpi/google_on_non_white.png" class="google-logo" />
  <YourPosition v-if="mapStore.getMap() != null && isMapLoaded" :popupContent="'blank'" :latitude="latitude"
    :longitude="longitude" :mapObj="mapStore.getMap()" :key="1" ref="position" />
    <div class="loading-spinner" v-if="!areRigsLoaded">
    <ProgressSpinner style="width: 50px; height: 50px; z-index:999;" strokeWidth="100" fill="var(--surface-ground)"
      animationDuration=".9s" aria-label="Custom ProgressSpinner" />
  </div>
</template>
<script>
import { Network } from '@capacitor/network';
import YourPosition from './YourPosition.vue'
import proj4 from 'proj4';
import { getNearbyRigs } from "../services/rigsService";
import { authenticate } from '@/services/authService';
import { useRigsStore, useRigsToShowStore, useAllRigsTypeStore, useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap.js';
import Overlay from 'ol/Overlay.js';
import { containsCoordinate } from 'ol/extent';
import googleMapService from '@/services/googleMapService';
import Feature from 'ol/Feature.js';
import { Cluster, Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import Point from 'ol/geom/Point.js';
import colors from '@/assets/rigTypesColor';
import {
  Fill,
  Style,
  Text,
  Icon,
} from 'ol/style.js';
import MapPopup from './MapPopup.vue';
import { useToast } from "primevue/usetoast";
import ProgressSpinner from 'primevue/progressspinner';
export default {
  name: "mapContainer",
  props: ['rigs', 'longitude', 'latitude'],
  components: {
    YourPosition,
    MapPopup,
    ProgressSpinner
  },
  data() {
    return {
      rigsStore: useRigsStore(),
      rigsToShowStore: useRigsToShowStore(),
      allRigsTypeStore: useAllRigsTypeStore(),
      rigsTypeStore: useRigsTypeStore(),
      mapStore: useMapStore(),
      isMapLoaded: false,
      authWs: null,
      gmapSession: null,
      vectorSource: null,
      clusterSource: null,
      clusters: null,
      clickedFeature: null,
      overlay: null,
      clickedFeaturesProp: null,
      showDetails: false,
      toast: useToast(),
      networkStatus: null,
      networkType: null,
      interval: null,
      areRigsLoaded: false,
      isReviewMode: import.meta.env.VITE_REVIEW_MODE,
      randomGcPoints: [],
    }
  },
  emits: ['getIsMapLoaded'],
  async mounted() {
    if(this.isReviewMode){
      this.randomGcPoints = this.generateCloseGCPoints(this.latitude, this.longitude, 1000, 13) // 5 punti entro 100 metri
      this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Versione Demo - Dati Simulati!' });
    }
    
    await this.mainAuth();
  },
  watch: {
    networkStatus(val) {
      if (val == 'Offline') {
        this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Connessione assente. Collegarsi a una rete internet per poter utilizzare l\'applicazione.' });
      } else if (val == 'Online') {
        this.toast.add({ severity: 'success', summary: 'Info', detail: 'Connessione ripristinata.' });
        // this.isMapLoaded = false;
        // this.$emit('getIsMapLoaded', this.isMapLoaded);
        this.$forceUpdate();
      }
    },
  },
  updated() {
  },
  methods: {
    async mainAuth(){
      await this.auth();
      await this.getGmapSession(this.authWs.token);
      if(this.gmapSession.session == undefined || this.gmapSession.key == undefined) {
        return;
      }
      await this.mapStore.initMap(this.$refs.map, this.gmapSession.session, this.gmapSession.key)
      this.setZoomAndPosition();
      this.dragMap();
      this.postRenderMap()
      this.singleClickEvent();
      this.checkNetworkStatus();
      this.rigsTypeStore.$subscribe(() => {
        // this.removeOverlays();
        // console.log(this.rigsTypeStore.getType())
        // console.log(this.mapStore.getMap().getLayers().getArray())
        this.mapStore.getMap().removeOverlay(this.overlay);
        this.clickedFeaturesProp = null;
        this.reloadOverlaysRigs();
      });
    },
    checkNetworkStatus() {
      Network.addListener('networkStatusChange', networkStatus => {
        const { connected, connectionType } = networkStatus;
        this.networkStatus = connected ? 'Online' : 'Offline';

        //'wifi' | 'cellular' | 'none' | 'unknown'
        this.networkType = connectionType;
      });
    },
    updatedVisibility(newVal) {
      this.showDetails = newVal
    },
    singleClickEvent() {
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
    async getGmapSession(token) {
      this.gmapSession = await googleMapService.getLastValidSession(token);
      if(this.hasErrors(this.gmapSession)) {
        return;
      }
      // console.log(this.gmapSession)
    },
    async auth() {
      this.authWs = await authenticate('refuel', 'refuelistheway')
      if(this.hasErrors(this.authWs)) {
        return;
      }
    },
    async showAndClusterizePopups() {
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
        distance: 20,
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
    async reloadOverlaysRigs() {
      await this.recalculateRigs();
      // this.setupOverlays(this.mapStore.getMap());
      await this.showAndClusterizePopups();
    },
    setZoomAndPosition() {
      this.mapStore.getMap().getView().setCenter([this.longitude, this.latitude]);
      this.mapStore.getMap().getView().setZoom(14);
    },
    //useless if useGeographic() is used
    convertOsmCoordinatesToGmCoordinates(coordinates) {
      var source = proj4.Proj('EPSG:3857'); // OpenLayers projection
      var dest = proj4.Proj('EPSG:4326'); // Google Maps projection

      let point = proj4.toPoint([coordinates[0], coordinates[1]])

      let convertedCoords = proj4.transform(source, dest, point)

      console.log("open layer: " + coordinates[0] + " " + coordinates[1])
      console.log("google: " + convertedCoords.y + " " + convertedCoords.x)
      return [convertedCoords.y, convertedCoords.x]
    },
    dragMap() {
      this.mapStore.getMap().on('pointerdrag', function () { });
      this.mapStore.getMap().on('movestart', function () { });
      this.mapStore.getMap().on('moveend', this.reloadOverlaysRigs);
    },
    async recalculateRigs() {
      let distanceThreshold = 3;
      if (this.rigsStore.getRigs().length <= 0) {
        distanceThreshold = 10;
      }

      if(this.isReviewMode){
        this.localRigs = await import('@/assets/mock-stations.json')
        this.localRigs = this.localRigs.default
        for(let i = 0; i < this.localRigs.length; i++){
          this.localRigs[i].rig.latitude = this.randomGcPoints[i].lat
          this.localRigs[i].rig.longitude = this.randomGcPoints[i].lon
        }
      }else{
        this.localRigs = await getNearbyRigs(this.mapStore.getMap().getView().getCenter()[1], this.mapStore.getMap().getView().getCenter()[0], distanceThreshold, this.authWs.token)
      }
      
      this.areRigsLoaded = true;

      if (this.hasErrors(this.localRigs)) {
        return;
      }

      this.rigsStore.setRigs(this.rigsStore.getRigs().concat(this.localRigs.filter((rig) => this.rigsStore.rigs.map(rig => rig.rig.rigId).indexOf(rig.rig.rigId) < 0)));  //filter duplicates
      this.rigsToShowStore.setRigs(this.rigsStore.getRigs());
      for (let rig of this.rigsToShowStore.getRigs()) {
        for (let rigPrice of rig.rigPrices) {
          if (this.allRigsTypeStore.allTypes.indexOf(rigPrice.rigFuelType.rigFuelTypeDescription) < 0) {
            this.allRigsTypeStore.addAllRigsType(rigPrice.rigFuelType.rigFuelTypeDescription)
          }
        }
      }
      // console.log(this.rigsTypeStore.getType())
      if (this.rigsTypeStore.type != null) {
        this.rigsToShowStore.setRigs(this.rigsToShowStore.getRigs().filter((rig) => rig.rigPrices.some((rigPrice) => rigPrice.rigFuelType.rigFuelTypeDescription.toLowerCase() == this.rigsTypeStore.getType().toLowerCase())))
      } else {
        this.rigsToShowStore.setRigs(this.rigsStore.getRigs())
      }
      // console.log(this.rigsToShowStore.getRigs())
      if(this.localRigs.length <= 0) {
        let countryObj = await googleMapService.getReverseGeocoding(this.latitude, this.longitude, this.gmapSession.key);
        countryObj = countryObj.results[0].address_components.find(comp =>
          comp.types.includes('country'));
        if(countryObj){
          if(countryObj.long_name != "Italy" && countryObj.long_name != "Italia") {
            this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Questa applicazione è disponibile solo in ITALIA. Al momento non sono state trovate stazioni di servizio visualizzabili nella tua area geografica.', life: 5000 });
            return;
          }
        }
        this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Nessuna stazione di rifornimento trovata nelle tue vicinanze.', life: 5000 });
      }
    },
    setupOverlays(map) {
      let extent = map.getView().calculateExtent(map.getSize().map(i => i + 50));
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
          overlay.set("isRig", "true")
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
    buildClusterStyle(feature) {
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
          src: size == 1 ? this.getRigTypeIconColor() : new URL('@/assets/icons/local_gas_stationx4-darkblue.jpg', import.meta.url).href,
          scale: 0.4,
        }),
        text: new Text({
          text: text,
          fill: new Fill({
            color: size == 1 ? this.getTextRigTypeColor() : '#3b82f6',
          }),
          scale: 1,
          offsetY: 9,
          font: 'bold .7rem sans-serif',
        }),
      });
      return style;
    },
    hasErrors(api) {
      if (api.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
        console.log(api.response);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Errore interno, qualcosa è andato storto, riprova più tardi.', life: 5000 });
        this.executeRetryInterval();
        return true;
      } else if (api.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
        console.log(api.request);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Connessione al server non disponibile, verifica la connessione internet oppure riprova più tardi.', life: 5000 });
        this.executeRetryInterval();
        return true;
      } else if (api.message) {
      // Something happened in setting up the request that triggered an Error
        console.log(api.message);
        this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Errore generico', life: 5000 });
        return true;
      }

      if(this.interval != null) {
        this.toast.add({ severity: 'success', summary: 'Info', detail: 'Connessione ripristinata.', life: 3000 });
      }
      clearInterval(this.interval);
      this.interval = null;

      return false;
    },
    getButtons() {
      return this.$refs.buttons;
    },
    getGmap() {
      return this.gmapSession;
    },
    postRenderMap() {
      this.mapStore.getMap().getLayers().getArray()[0].on('postrender', this.setMapLoaded())
    },
    setMapLoaded() {
      this.isMapLoaded = true;
      this.$emit('getIsMapLoaded', this.isMapLoaded);
      this.manageOverlay(null)
      // console.log("map loaded")
    },
    removeOverlays() {
      for (let overlay of this.mapStore.getMap().getOverlays().getArray().slice(0)) {
        if (overlay.get('isRig') != undefined) {
          this.mapStore.getMap().removeOverlay(overlay)
        }
      }
    },
    removeClusterizedPopups() {
      this.mapStore.getMap().removeLayer(this.clusters);
    },
    getIsMapLoaded() {
      return this.isMapLoaded;
    },
    async retry(){
        let retryApisCall = async () => {
         this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Tentativo di connessione in corso.', life: 3000 });
         await this.mainAuth();
         this.reloadOverlaysRigs();
        }
        return setInterval(retryApisCall, 10000);
    },
    async executeRetryInterval(){
        if(this.interval  == null){
            this.interval = await this.retry();
        }
    },
    getRigTypeIconColor(){
      if(this.rigsTypeStore.getType() == null) {
        return new URL('/src/assets/icons/local_gas_stationx4-blue.jpg', import.meta.url).href;
      }
      let iconName = '/src/assets/icons/'+ colors.rigTypesIconColor.get(this.rigsTypeStore.getType().toLowerCase()) +'.jpg';
      return new URL(iconName, import.meta.url).href;
    },
    getTextRigTypeColor() {
      if(this.rigsTypeStore.getType() == null) {
        return '#3b82f6'; // blue
      }
      return colors.rigTypesColor.get(this.rigsTypeStore.getType().toLowerCase()) || '#3b82f6'; // default blue
    },
    generateCloseGCPoints(lat, lon, distanceInMeters, numberPoints) {
      const raggioTerra = 6371000; // in metri
      const nuoviPunti = [];

      for (let i = 0; i < numberPoints; i++) {
        // Offset casuale in metri
        const dx = (Math.random() - 0.5) * 2 * distanceInMeters;
        const dy = (Math.random() - 0.5) * 2 * distanceInMeters;

        // Offset in radianti
        const deltaLat = dy / raggioTerra;
        const deltaLon = dx / (raggioTerra * Math.cos((lat * Math.PI) / 180));

        // Nuove coordinate
        const newLat = lat + (deltaLat * 180) / Math.PI;
        const newLon = lon + (deltaLon * 180) / Math.PI;

        nuoviPunti.push({ lat: newLat, lon: newLon });
      }

      return nuoviPunti;
    }
  }
}
</script>
<style></style>
