<template>
<Dialog v-model:visible="isFilterVisible" header="Filtri" :style="{ width: '25rem' }" position="right" :modal="true" :draggable="false">
    <InputSwitch v-model="checked" />
    <InputSwitch v-model="checked" />
    <InputSwitch v-model="checked" />
    <InputSwitch v-model="checked" />
    <InputSwitch v-model="checked" />
</Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import InputSwitch from 'primevue/inputswitch';
</script>

<script>
export default {
    data(){
        return {
            isFilterVisible : this.isVisible,
            checked: false
        }
    },
    props: ["isVisible"],
    mounted(){
    },
    watch: {
        isVisible(newVal){
            this.isFilterVisible = newVal;
        }
    }

}
</script>