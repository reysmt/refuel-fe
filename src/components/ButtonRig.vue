<template>
    <!-- <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-closer" @click="closePopup" class="ol-popup-closer" ref="popup-closer"
            v-html="popupCloser"></a>
        <div id="popupContent" ref="popupContent">
            <p>You clicked here:</p><code>{{ popupContent }}</code>
        </div>
    </div> -->
    <!-- <button type="button" class="btn btn-secondary btn-sm rounded" ref="popup">
        <i class="bi bi-fuel-pump"></i>
    </button> -->
    <div ref="popup" class="popup">
        <div v-if="rigsTypeStore.getType() == null || rigsTypeStore.getType().toLowerCase() != 'Gasolio'.toLowerCase()">
            <ButtonPv icon="bi bi-fuel-pump-fill" label=" " :badge="setAndGetPriceToShow() + '€'" @click="openDetails()" class="custom-btn-rig-map"></ButtonPv>
        </div>
        <div v-else>
            <ButtonPv icon="bi bi-fuel-pump-diesel-fill" label=" " :badge="setAndGetPriceToShow() + '€'" @click="openDetails()" class="custom-btn-rig-map"></ButtonPv>
        </div>
        <!-- {{ console.log(this.rigPrices) }} -->
    </div>
        
    <RigDetail :isVisible="visible" :rig="rig" :rigPrices="rigPrices" @updatedVisibility="updatedVisibility" :gmapKey="gmapKey"></RigDetail>
    
</template>

<script>
// import { toStringHDMS } from 'ol/coordinate.js';
import Overlay from 'ol/Overlay.js';
import ButtonPv from 'primevue/button';
import { useRigsTypeStore } from '@/stores/rigs';
import "ol/ol.css";
import { defineAsyncComponent } from 'vue';
export default {
    data() {
        return {
            popup: null,
            visible: false,
            // priceToShow: null,
            rigsTypeStore: useRigsTypeStore()
        }
    },
    components:{
        ButtonPv,
        RigDetail : defineAsyncComponent(() => import('./RigDetail.vue'))
        // RigDetail : defineAsyncComponent(() => new Promise((resolve) => {setTimeout(() => {resolve(import('./RigDetail.vue'))},2000)}))
    },
    mounted() {
        // console.log(this.rigPrices)
        // console.log(this.$refs.popup)
        // this.setupOverlay();
        // this.preparePopup();
    },
    updated(){
        
    },
    props: ['mapObj', 'popupContent', 'longitude', 'latitude','rig','rigPrices','gmapKey'],
    methods: {
        setAndGetPriceToShow(){
            // console.log(this.rig.manager)
            // console.log(this.rigsTypeStore.getType() != null ? this.rigsTypeStore.getType().toLowerCase() : '')
            // console.log(this.rigPrices)
            let priceToShow;
            let filteredPrices = [];
            if(this.rigsTypeStore.getType() != null){
                let prices = this.rigPrices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == this.rigsTypeStore.getType().toLowerCase());
                if(Array.isArray(prices) && prices.length > 0){
                    for(let price of prices){
                        filteredPrices.push(price.price.toFixed(2))
                    }
                    priceToShow = Math.min(...filteredPrices)
                    return priceToShow;
                }
            }
            // console.log(priceToShow)
            return this.rigPrices[0].price.toFixed(2);
        },
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
                // autoPan: {
                //     animation: {
                //         duration: 250,
                //     },
                // },
            });
            this.mapObj.addOverlay(this.popup)
        },
        openDetails(){
            this.visible = true;
        },
        updatedVisibility(newVal){
            this.visible = newVal
        }
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
</style>