<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline"></ion-icon>
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="list" href="/tabs/list">
          <ion-icon :icon="listOutline"></ion-icon>
          <ion-label>Liste</ion-label>
        </ion-tab-button>

        <ion-tab-button v-if="isAuthenticated" tab="my-reports" href="/tabs/my-reports">
          <ion-icon :icon="folderOutline"></ion-icon>
          <ion-label>Mes signalements</ion-label>
        </ion-tab-button>

        <ion-tab-button v-if="!isAuthenticated" tab="login" href="/login">
          <ion-icon :icon="logInOutline"></ion-icon>
          <ion-label>Connexion</ion-label>
        </ion-tab-button>

        <ion-tab-button v-else tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/vue';
import {
  mapOutline,
  listOutline,
  folderOutline,
  logInOutline,
  personOutline
} from 'ionicons/icons';
import authService from '../services/authService';

const isAuthenticated = ref(false);

const checkAuth = async () => {
  isAuthenticated.value = await authService.isAuthenticated();
};

onMounted(() => {
  checkAuth();
});

// Écouter les changements d'authentification
setInterval(checkAuth, 5000);
</script>
