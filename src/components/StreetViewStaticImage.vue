<template>
<div class="street-view-image-static">
    <Image :src=url alt="Image"/>
</div>    
</template>
<script setup>
import Image from 'primevue/image';
</script>
<script>
export default {
    data(){
        return {
            url: null
        }
    },
    mounted(){
        // console.log(this.gKey)
        this.loadUrl(this.gKey, this.latitude, this.longitude)
    },
    methods: {
        loadUrl(apiKey, latitude, longitude){
            this.url = "https://maps.googleapis.com/maps/api/streetview?size=400x100&location="+ latitude +","+longitude+"&fov=80&heading=70&pitch=0&key="+ apiKey
        }
    },
    props : ['latitude','longitude','gKey']
}
</script>