import { defineStore } from 'pinia'
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
// import OSM from 'ol/source/OSM.js';
import OSMHostedByMapTiler from '@/map/OSMHostedByMapTiler'
import { useGeographic } from 'ol/proj.js';

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
      initMap(ref){
        this.map = new Map({
          target: ref,
          layers: [
            new TileLayer({
              preload: Infinity,
              source: new OSMHostedByMapTiler(),
            })
          ],
          view: new View({
            center: [0, 0],
            zoom: 1
          })
        })
        useGeographic() //make the map view uses geographic coordinates even if the view projection is not geographic
      }
    }
  })
  