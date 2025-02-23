<template>
    <!-- <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-closer" @click="closePopup" class="ol-popup-closer" ref="popup-closer"
            v-html="popupCloser"></a>
        <div id="popupContent" ref="popupContent">
            <p>You clicked here:</p><code>{{ popupContent }}</code>
        </div>
    </div> -->
    <!-- <button type="button" class="btn btn-secondary btn-sm rounded" ref="popup"> -->
        <i class="pi pi-map-marker" ref="popup" style="color: white;"></i>
        
    <!-- </button> -->
    
</template>
<script>
// import { toStringHDMS } from 'ol/coordinate.js';
import Overlay from 'ol/Overlay.js';

import "ol/ol.css";
export default {
    data() {
        return {
            popup: null
        }
    },
    mounted() {
        this.setupOverlay();
        this.preparePopup();
    },
    props: ['mapObj', 'popupContent', 'longitude', 'latitude'],
    methods: {
        preparePopup() {
            let coordinates = { coordinate: [this.longitude, this.latitude] };
            this.showPopup(coordinates)
            // this.mapObj.getView().setZoom(this.mapObj.getView().getZoom() - 0.05)
        },
        showPopup(evt) {
            // const coordinate = evt.coordinate;
            // const hdms = toStringHDMS(coordinate);

            // this.convertOsmCoordinatesToGmCoordinates(coordinate)

            // console.log("popupView: ",coordinate[1] + "," + coordinate[0])
            // console.log("popupView: ",this.popupContent)
            // this.popupContent = hdms;
            this.popup.setPosition(evt.coordinate);
        },
        setupOverlay() {
            this.popup = new Overlay({
                element: this.$refs.popup,
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });
            this.popup.set("myPosition","true")
            this.mapObj.addOverlay(this.popup)
        },
    }
}
</script>
<style scoped>
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer:after {
  content: "✖";
}

.position{
    font-size: 20px;
}
</style>