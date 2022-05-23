<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="row no-wrap">
      <q-toolbar class="col-auto bg-purple">
        <q-btn stretch flat no-caps to="/">
          <q-toolbar-title>ChiUI</q-toolbar-title>
        </q-btn>
      </q-toolbar>
      <q-toolbar>
        <q-toolbar-title>Instance Manager</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup></script>
