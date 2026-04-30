<template>
<DialogPv v-model:visible="isDialogVisible" :modal="false" header="Info" dismissableMask style="width: 22.5rem;">
    <p class="m-0">
        Ver. {{ version }} <br><br>
        Dataset da <a href="https://www.dati.gov.it/" target="_blank">Dati Gov</a> e 
        pubblicato da Ministero delle Imprese e del Made in Italy <br><br>
        I dati sono aggiornati con frequenza giornaliera.<br><br>
        Licenza <a href="https://www.dati.gov.it/content/italian-open-data-license-v20" target="_blank">IODL 2.0</a><br>
    </p>
    <img src="/src/assets/kit-logo-iodl/logo_iodl_esteso.png" alt="IODL 2.0" style="width: 30%; height: 30%;">
</DialogPv>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DialogPv from 'primevue/dialog';

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits<{
  (event: 'updatedVisibility', value: boolean): void;
}>();

const isDialogVisible = ref(props.isVisible);
const version = import.meta.env.VITE_APP_VERSION as string;

watch(
  () => props.isVisible,
  (newValue) => {
    isDialogVisible.value = newValue;
  }
);

watch(isDialogVisible, (newValue) => {
  emit('updatedVisibility', newValue);
});
</script>
