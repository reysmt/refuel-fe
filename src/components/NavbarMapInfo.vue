<template>
<Dialog v-model:visible="isDialogVisible" :modal="false" header="Info" dismissableMask>

</Dialog>
</template>
<script setup>
import Dialog from 'primevue/dialog';
</script>
<script>
export default {
    data() {
        return {
            isDialogVisible: this.visible
        }
    },
    props: ['isVisible'],
    emits: ['updatedVisibility'],
    watch: {
        isVisible(newVal) {
            this.isDialogVisible = newVal;
        },
        isDialogVisible(newVal) {
            this.$emit('updatedVisibility', newVal);
            this.isDialogVisible = newVal;
        }
    }
}
</script>