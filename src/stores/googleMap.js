import { defineStore } from 'pinia'
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
// import OSM from 'ol/source/OSM.js';
import { useGeographic } from 'ol/proj.js';
import { XYZ } from 'ol/source';
import googleMapService from '@/services/googleMapService';

export const useMapStore = defineStore('map', {
    state: () => {
      return {
        map : null
      }
    },
    actions: {
      getMap(){
        return this.map;
      },
      async initMap(ref, session, key){
        this.map = new Map({
          target: ref,
          layers: [
            new TileLayer({
              preload: Infinity,
              source: new XYZ({url: 'https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=' + session + '&key=' + key})
            })
          ],
          view: new View({
            center: [0, 0],
            zoom: 1
            // extent: [306639.36, 610955.18, 4005074.92, 16.23393462821139]
          })
        })
        useGeographic() //make the map view uses geographic coordinates even if the view projection is not geographic
      }
    }
  })
  