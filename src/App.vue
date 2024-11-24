<template> 
<!-- <a href="/stations">stations</a> |
<a href="/test-page">test page</a>
{{result}} -->
<router-view></router-view>
</template>
<script setup>
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
// import GasStationsView from "./views/GasStationsView.vue"
</script>

<script>
import { checkReachability } from './services/rigsService';

export default {
    mounted() {
        // console.log(this.rigPrices)
        // this.getTestResult();
    },
    data(){
        return{
            result: null
        }
    },
    methods : {
        async getTestResult(){
            this.result = await checkReachability().then(resp => resp.data).catch(function(error){
                return error.toJSON()
            })
        }
    }
}
</script>

<style scoped>

</style>
