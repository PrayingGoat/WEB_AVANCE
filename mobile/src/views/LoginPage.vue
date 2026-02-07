<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="constructOutline" class="logo-icon"></ion-icon>
          <h1>Travaux Routiers</h1>
          <p class="subtitle">Antananarivo</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              required
              autocomplete="email"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Mot de passe</ion-label>
            <ion-input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            ></ion-input>
          </ion-item>

          <ion-button
            expand="block"
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Se connecter</span>
          </ion-button>
        </form>

        <ion-text v-if="error" color="danger" class="error-message">
          <p>{{ error }}</p>
        </ion-text>

        <div class="visitor-section">
          <ion-button fill="clear" @click="continueAsVisitor">
            Continuer en tant que visiteur
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { constructOutline } from 'ionicons/icons';
import authService from '../services/authService';

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await authService.login(email.value, password.value);

    if (response.success) {
      const toast = await toastController.create({
        message: 'Connexion réussie!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      router.push('/map');
    } else {
      error.value = response.message || 'Erreur de connexion';
    }
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Erreur de connexion au serveur';
    }
  } finally {
    loading.value = false;
  }
};

const continueAsVisitor = () => {
  router.push('/map');
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
}

.logo-section h1 {
  margin: 16px 0 4px 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.subtitle {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 16px;
}

ion-item {
  margin-bottom: 16px;
  --background: transparent;
}

.login-button {
  margin-top: 24px;
}

.error-message {
  text-align: center;
  margin-top: 16px;
}

.visitor-section {
  text-align: center;
  margin-top: 24px;
}
</style>
