<template>
  <div id="map" class="map-container border rounded-4" ref="map">
    <div ref="popup" class="popup"></div>
  </div>
  <img src="../../google_logo/google_logo/android/res/drawable-mdpi/google_on_non_white.png" class="google-logo" />
  <YourPosition v-if="mapStore.getMap()!=null && isMapLoaded" :popupContent="'blank'" :latitude="latitude"
    :longitude="longitude" :mapObj="mapStore.getMap()" :key="1" ref="position" />
    
  <!-- <div v-if="mapStore.getMap()!=null && isMapLoaded && rigsToShowStore.getLength() > 0">
    <ButtonRig v-for="rig in rigsToShowStore.getRigs()"
    :rig="rig.rig"
    :rigPrices="rig.rigPrices"
    :popupContent="rig.rig.rigName" 
    :latitude="rig.rig.latitude"
    :longitude="rig.rig.longitude" 
    :mapObj="mapStore.getMap()" 
    :key="rig.rig.rigId"
    :gmapKey="this.gmapSession.key"
    ref="buttons"/>
  </div> -->
</template>
<script setup>
</script>
<script>
import YourPosition from './YourPosition.vue'
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
import ButtonRig from './ButtonRig.vue';

import Feature from 'ol/Feature.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import Point from 'ol/geom/Point.js';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Text,
} from 'ol/style.js';
import {boundingExtent} from 'ol/extent.js';
let buttons = ref([])
let position =ref()
export default {
  name: "mapContainer",
  components:{
    YourPosition,
    ButtonRig
  },
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
      gmapSession: null
    }
  },
  async mounted() {
    await this.auth();
    await this.getGmapSession(this.authWs.token);
    await this.mapStore.initMap(this.$refs.map, this.gmapSession.session, this.gmapSession.key)
    this.setZoomAndPosition();
    this.dragMap();
    this.postRenderMap()
    this.rigsTypeStore.$subscribe(() => {
      this.removeOverlays();
      this.recalculateRigs();
    })
  },
  updated(){
    
  },
  methods: {
    async getGmapSession(token){
      this.gmapSession = await googleMapService.getLastValidSession(token);
      // console.log(this.gmapSession)
    },
    async auth(){
      this.authWs = await authenticate('refuel','refuelistheway')
      // console.log(this.authWs.token)
    },
    async clusterizedOverlays(){

      const features = [];
      for (let i = 0; i < this.rigsToShowStore.getRigs().length; ++i) {
        let rig = this.rigsToShowStore.getRigs()[i];
        const coordinates = [rig.rig.longitude, rig.rig.latitude];
        features[i] = new Feature(new Point(coordinates));
        features[i].set('rig', rig);
        // console.log(features[i].values_.rig.rig)
      }

      const source = new VectorSource({
        features: features,
      });

      const clusterSource = new Cluster({
        distance: 25,
        source: source,
      });

      const styleCache = {};

      const clusters = new VectorLayer({
        source: clusterSource,
        style: function (feature) {
          const size = feature.get('features').length;
          let style = styleCache[size];
          if (!style) {
            style = new Style({
              image: new CircleStyle({
                radius: 15,
                // stroke: new Stroke({
                //   color: '#fff',
                // }),
                fill: new Fill({
                  color: '#3399CC',
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: '#fff',
                }),
              }),
            });
            styleCache[size] = style;
          }
          return style;
        },
      });

      let element = this.$refs.popup;

      const popup = new Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
      });
      this.mapStore.getMap().addOverlay(popup);
      
      let popover;
      function disposePopover() {
        if (popover) {
          popover.dispose();
          popover = undefined;
        }
      }

      this.mapStore.getMap().addLayer(clusters);

      this.mapStore.getMap().on('singleclick', (e) => {
        // console.log(e);
        console.log(clusters.getFeatures(e.pixel))
        // .then((clickedFeatures) => {
        //   console.log(clickedFeatures.length)
        //   if (clickedFeatures.length) {
        //     // Get clustered Coordinates
        //     const features = clickedFeatures[0].get('features');
        //     disposePopover();
        //     if(!features){
        //         return
        //       }
            
        //     popup.setPosition(e.coordinate);
        //     popover = new bootstrap.Popover(element, {
        //       placement: 'top',
        //       html: true,
        //       content: features.map((r) => r.get('rig').rig.rigName).join('<br>'),
        //     });
        //     popover.show();
        //   }
        // });
        this.mapStore.getMap().on('movestart', disposePopover);

      });

    },
    async reloadOverlaysRigs(){
      await this.recalculateRigs();
      await this.clusterizedOverlays();
      // this.loadViewableOverlays(this.mapStore.getMap());
      // this.setupOverlays(this.mapStore.getMap());
    },
    loadViewableOverlays(map){
      let extent = map.getView().calculateExtent(map.getSize());
      console.log(extent)

      console.log('recheck')

      let count = 0;

      map.getOverlays()['array_'].forEach(overlay => {
        count = count + 1;
        this.overlays.add(overlay);
        let coords = overlay['values_']['position']
        if(containsCoordinate(extent, coords)){
          console.log('inserted ' + map.addOverlay(overlay))
          overlay.setPosition(coords)
        }else{
          console.log("removed " + map.removeOverlay(overlay))
        }
      });

      console.log(count)
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
      let distanceThreshold = 1;
      if(this.rigsStore.getRigs().length <= 0){
        distanceThreshold = 10;
      }
      this.localRigs = await getNearbyRigs(this.mapStore.getMap().getView().getCenter()[1], this.mapStore.getMap().getView().getCenter()[0], distanceThreshold, this.authWs.token)
      // console.log(this.localRigs)
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
      console.log("map loaded")
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
    }
  }
}
</script>
<style>

</style>
