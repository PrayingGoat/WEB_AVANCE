<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Liste des Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="filter" @ionChange="onFilterChange">
          <ion-segment-button value="all">
            <ion-label>Tous</ion-label>
          </ion-segment-button>
          <ion-segment-button value="NOUVEAU">
            <ion-label>Nouveaux</ion-label>
          </ion-segment-button>
          <ion-segment-button value="EN_COURS">
            <ion-label>En cours</ion-label>
          </ion-segment-button>
          <ion-segment-button value="TERMINE">
            <ion-label>Terminés</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list v-if="filteredSignalements.length > 0">
        <ion-item-sliding v-for="signalement in filteredSignalements" :key="signalement.id_signalement">
          <ion-item @click="showDetails(signalement)">
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
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </ion-item-sliding>
      </ion-list>

      <div v-else class="empty-state">
        <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
        <p>Aucun signalement trouvé</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonItemSliding,
  IonAvatar,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  alertController,
  toastController
} from '@ionic/vue';
import {
  refreshOutline,
  constructOutline,
  chevronForwardOutline,
  searchOutline
} from 'ionicons/icons';
import { STATUTS, StatutType } from '../config';
import signalementService, { Signalement } from '../services/signalementService';

const signalements = ref<Signalement[]>([]);
const filter = ref('all');
const loading = ref(false);

const filteredSignalements = computed(() => {
  if (filter.value === 'all') {
    return signalements.value;
  }
  return signalements.value.filter(s => s.statut === filter.value);
});

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

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Non définie';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Non définie';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    signalements.value = await signalementService.getAllSignalements();
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des données',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
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

const onFilterChange = () => {
  // Le filtrage est fait automatiquement via computed
};

const showDetails = async (signalement: Signalement) => {
  let message = `Description: ${signalement.description}\n\nDate: ${formatDate(signalement.date_signalement)}`;

  if (signalement.surface_estimee) {
    message += `\n\nSurface: ${signalement.surface_estimee} m²`;
  }
  if (signalement.budget_estime) {
    message += `\n\nBudget: ${signalement.budget_estime.toLocaleString()} Ar`;
  }
  if (signalement.nom_entreprise) {
    message += `\n\nEntreprise: ${signalement.nom_entreprise}`;
  }
  if (signalement.date_debut_travaux) {
    message += `\n\nDébut travaux: ${formatDate(signalement.date_debut_travaux)}`;
  }
  if (signalement.date_fin_travaux) {
    message += `\n\nFin travaux: ${formatDate(signalement.date_fin_travaux)}`;
  }

  const alert = await alertController.create({
    header: signalement.adresse,
    subHeader: getStatusLabel(signalement.statut),
    message,
    buttons: ['Fermer']
  });

  await alert.present();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
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
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>
