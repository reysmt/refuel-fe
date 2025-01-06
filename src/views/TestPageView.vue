<script setup>
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import { Swiper, SwiperSlide} from 'swiper/vue';
import ProgressSpinner from 'primevue/progressspinner';
import Skeleton from 'primevue/skeleton';
import StreetView from '@/components/StreetView.vue';
import OverlayPanel from 'primevue/overlaypanel';
import { ref } from 'vue';
</script>

<script>
import { useSwiper } from 'swiper/vue';
let tmp = ['crazy', 'mf']
const op = ref();
let toggle = (event) => {
    
    console.log(op.value.toggle(event));
}
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
    
    <Button label="Submit"></Button>
    {{ this.toggle }}
    <ProgressSpinner />

    <Skeleton class="loading mb-2" @click="toggle"></Skeleton>
    <OverlayPanel ref="op">
    </OverlayPanel>
    <!-- <StreetView></StreetView> -->
</template>
