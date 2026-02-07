<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mes Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- En attente d'authentification -->
      <div v-if="!isAuthenticated" class="auth-required">
        <ion-icon :icon="lockClosedOutline" class="lock-icon"></ion-icon>
        <h2>Connexion requise</h2>
        <p>Veuillez vous connecter pour voir vos signalements</p>
        <ion-button @click="goToLogin">Se connecter</ion-button>
      </div>

      <!-- Liste des signalements de l'utilisateur -->
      <template v-else>
        <ion-list v-if="mySignalements.length > 0">
          <ion-item-sliding v-for="signalement in mySignalements" :key="signalement.id_signalement">
            <ion-item>
              <ion-avatar slot="start" :class="['status-avatar', signalement.statut.toLowerCase()]">
                <ion-icon :icon="constructOutline"></ion-icon>
              </ion-avatar>
              <ion-label>
                <h2>{{ signalement.adresse }}</h2>
                <p>{{ signalement.description }}</p>
                <p class="details">
                  <ion-badge :color="getStatusColor(signalement.statut)">
                    {{ getStatusLabel(signalement.statut) }}
                  </ion-badge>
                  <span class="date">{{ formatDate(signalement.date_signalement) }}</span>
                </p>
              </ion-label>
            </ion-item>
          </ion-item-sliding>
        </ion-list>

        <div v-else class="empty-state">
          <ion-icon :icon="documentOutline" class="empty-icon"></ion-icon>
          <p>Vous n'avez pas encore créé de signalement</p>
          <ion-button @click="goToMap">Créer un signalement</ion-button>
        </div>
      </template>
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
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonItemSliding,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue';
import {
  refreshOutline,
  lockClosedOutline,
  constructOutline,
  documentOutline
} from 'ionicons/icons';
import { STATUTS, StatutType } from '../config';
import signalementService, { Signalement } from '../services/signalementService';
import authService from '../services/authService';

const router = useRouter();
const isAuthenticated = ref(false);
const mySignalements = ref<Signalement[]>([]);
const currentUserId = ref<number | null>(null);

const getStatusColor = (statut: StatutType) => {
  const colors: Record<string, string> = {
    NOUVEAU: 'primary',
    EN_COURS: 'warning',
    TERMINE: 'success'
  };
  return colors[statut] || 'medium';
};

const getStatusLabel = (statut: StatutType) => {
  return STATUTS[statut]?.label || statut;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const loadData = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      currentUserId.value = user.id_utilisateur;
      const allSignalements = await signalementService.getAllSignalements();
      // Filtrer pour ne garder que les signalements de l'utilisateur
      mySignalements.value = allSignalements.filter(
        s => s.id_utilisateur === currentUserId.value
      );
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des données',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const refreshData = async () => {
  await loadData();
  const toast = await toastController.create({
    message: 'Liste actualisée',
    duration: 1500,
    color: 'success',
    position: 'top'
  });
  await toast.present();
};

const handleRefresh = async (event: CustomEvent) => {
  await loadData();
  (event.target as HTMLIonRefresherElement).complete();
};

const goToLogin = () => {
  router.push('/login');
};

const goToMap = () => {
  router.push('/map');
};

const checkAuth = async () => {
  isAuthenticated.value = await authService.isAuthenticated();
};

onMounted(async () => {
  await checkAuth();
  if (isAuthenticated.value) {
    await loadData();
  }
});
</script>

<style scoped>
.auth-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70%;
  text-align: center;
  padding: 20px;
}

.lock-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.auth-required h2 {
  margin: 0 0 8px 0;
  color: var(--ion-color-dark);
}

.auth-required p {
  margin: 0 0 24px 0;
  color: var(--ion-color-medium);
}

.status-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.status-avatar.nouveau {
  background-color: #e3f2fd;
  color: #2196F3;
}

.status-avatar.en_cours {
  background-color: #fff3e0;
  color: #FF9800;
}

.status-avatar.termine {
  background-color: #e8f5e9;
  color: #4CAF50;
}

ion-item h2 {
  font-weight: 500;
  margin-bottom: 4px;
}

ion-item p {
  color: var(--ion-color-medium);
  font-size: 14px;
}

.details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.date {
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50%;
  color: var(--ion-color-medium);
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>
