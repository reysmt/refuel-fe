<template>
  <a href="#" class="list-group-item list-group-item-action rounded-5 p-4 border-0">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">{{rig.rig.flag}}</h5>
    </div>
    <!-- <p class="mb-1">{{rig.rig.manager}}</p> -->
    <small class="text-muted">{{rig.rig.address}}</small>
  </a>
</template>

<script setup>
</script>

<script>
export default {
    props: ['rig'],
}
</script>

<style scoped></style>