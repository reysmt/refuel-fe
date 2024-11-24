<script setup>
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import { Swiper, SwiperSlide} from 'swiper/vue';
import ProgressSpinner from 'primevue/progressspinner';
import Skeleton from 'primevue/skeleton';
import StreetView from '@/components/StreetView.vue';
</script>

<script>
import { useSwiper } from 'swiper/vue';
let tmp = ['crazy', 'mf']
export default {
    setup(){
        const swiper = useSwiper()
        return{
            swiper
        }
    },
    methods : {
        add(){
            // this.swiper.appendSlide('<div class="swiper-slide">Slide 10"</div>')
            console.log(this.swiper)
        }
    }
};
</script>

<template>
    <div>
        <SelectButton v-model="value" :options="tmp" aria-labelledby="basic" />
    </div>
    
    <Button label="Submit" @click="add()"></Button>
    
    <ProgressSpinner />

    <Skeleton class="loading mb-2"></Skeleton>
    <StreetView></StreetView>
</template>
