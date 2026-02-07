<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="user" class="profile-container">
        <div class="avatar-section">
          <ion-avatar class="large-avatar">
            <ion-icon :icon="personCircleOutline"></ion-icon>
          </ion-avatar>
          <h2>{{ user.prenom }} {{ user.nom }}</h2>
          <p class="role-badge">{{ user.role }}</p>
        </div>

        <ion-list>
          <ion-item>
            <ion-icon :icon="mailOutline" slot="start"></ion-icon>
            <ion-label>
              <p>Email</p>
              <h3>{{ user.email }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon :icon="personOutline" slot="start"></ion-icon>
            <ion-label>
              <p>Nom complet</p>
              <h3>{{ user.prenom }} {{ user.nom }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
            <ion-label>
              <p>Rôle</p>
              <h3>{{ user.role === 'MANAGER' ? 'Manager' : 'Utilisateur' }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-button expand="block" color="danger" @click="handleLogout" class="logout-button">
          <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
          Se déconnecter
        </ion-button>
      </div>

      <div v-else class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonButton,
  IonSpinner,
  toastController
} from '@ionic/vue';
import {
  personCircleOutline,
  mailOutline,
  personOutline,
  shieldCheckmarkOutline,
  logOutOutline
} from 'ionicons/icons';
import authService, { User } from '../services/authService';

const router = useRouter();
const user = ref<User | null>(null);

const loadUser = async () => {
  user.value = await authService.getCurrentUser();
};

const handleLogout = async () => {
  await authService.logout();

  const toast = await toastController.create({
    message: 'Déconnexion réussie',
    duration: 2000,
    color: 'success',
    position: 'top'
  });
  await toast.present();

  router.push('/login');
};

onMounted(() => {
  loadUser();
});
</script>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.large-avatar {
  width: 100px;
  height: 100px;
  font-size: 100px;
  color: var(--ion-color-primary);
}

.avatar-section h2 {
  margin: 16px 0 4px 0;
  font-size: 24px;
  font-weight: bold;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--ion-color-primary);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  text-transform: uppercase;
}

ion-list {
  margin-top: 16px;
}

ion-item h3 {
  font-weight: 500;
}

ion-item p {
  color: var(--ion-color-medium);
}

.logout-button {
  margin-top: 32px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50%;
}

.loading-container p {
  margin-top: 16px;
  color: var(--ion-color-medium);
}
</style>
