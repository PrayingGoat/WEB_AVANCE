<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Carte des Travaux</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Carte Leaflet -->
      <div id="map" ref="mapContainer"></div>

      <!-- FAB pour ajouter un signalement -->
      <ion-fab v-if="isAuthenticated" vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openSignalementModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item nouveau">
          <span class="stat-value">{{ stats.nouveau }}</span>
          <span class="stat-label">Nouveaux</span>
        </div>
        <div class="stat-item en-cours">
          <span class="stat-value">{{ stats.en_cours }}</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat-item termine">
          <span class="stat-value">{{ stats.termine }}</span>
          <span class="stat-label">Terminés</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  modalController,
  toastController
} from '@ionic/vue';
import {
  refreshOutline,
  addOutline
} from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_COORDS, TILE_SERVER_URL, TILE_ATTRIBUTION, STATUTS } from '../config';
import signalementService, { Signalement } from '../services/signalementService';
import authService from '../services/authService';
import SignalementModal from '../components/SignalementModal.vue';

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;

const isAuthenticated = ref(false);
const signalements = ref<Signalement[]>([]);
const stats = ref({
  total: 0,
  nouveau: 0,
  en_cours: 0,
  termine: 0
});

// Créer une icône personnalisée selon le statut
const createMarkerIcon = (statut: string) => {
  const color = STATUTS[statut as keyof typeof STATUTS]?.color || '#2196F3';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Initialiser la carte
const initMap = () => {
  if (mapContainer.value && !map) {
    map = L.map(mapContainer.value).setView(
      [DEFAULT_COORDS.lat, DEFAULT_COORDS.lng],
      DEFAULT_COORDS.zoom
    );

    L.tileLayer(TILE_SERVER_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }
};

// Ajouter les marqueurs des signalements
const addMarkers = () => {
  if (!map || !markersLayer) return;

  markersLayer.clearLayers();

  signalements.value.forEach((s) => {
    const marker = L.marker([s.latitude, s.longitude], {
      icon: createMarkerIcon(s.statut)
    });

    const popupContent = `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">${s.adresse}</h4>
        <p style="margin: 0 0 4px 0; color: #666;">${s.description}</p>
        <p style="margin: 0 0 4px 0;">
          <strong>Statut:</strong>
          <span style="color: ${STATUTS[s.statut]?.color}">${STATUTS[s.statut]?.label}</span>
        </p>
        ${s.surface_estimee ? `<p style="margin: 0 0 4px 0;"><strong>Surface:</strong> ${s.surface_estimee} m²</p>` : ''}
        ${s.budget_estime ? `<p style="margin: 0 0 4px 0;"><strong>Budget:</strong> ${s.budget_estime.toLocaleString()} Ar</p>` : ''}
        ${s.nom_entreprise ? `<p style="margin: 0;"><strong>Entreprise:</strong> ${s.nom_entreprise}</p>` : ''}
      </div>
    `;

    marker.bindPopup(popupContent);
    markersLayer!.addLayer(marker);
  });
};

// Charger les données
const loadData = async () => {
  try {
    const [signalementsList, statsData] = await Promise.all([
      signalementService.getAllSignalements(),
      signalementService.getStats()
    ]);

    signalements.value = signalementsList;
    stats.value = statsData;
    addMarkers();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des données',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

// Rafraîchir les données
const refreshData = async () => {
  await loadData();
  const toast = await toastController.create({
    message: 'Données actualisées',
    duration: 1500,
    color: 'success',
    position: 'top'
  });
  await toast.present();
};

// Ouvrir le modal de création de signalement
const openSignalementModal = async () => {
  const modal = await modalController.create({
    component: SignalementModal,
    componentProps: {
      currentPosition: map ? map.getCenter() : { lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng }
    }
  });

  modal.onDidDismiss().then(({ data }) => {
    if (data?.created) {
      loadData();
    }
  });

  await modal.present();
};

// Vérifier l'authentification
const checkAuth = async () => {
  isAuthenticated.value = await authService.isAuthenticated();
};

onMounted(async () => {
  await checkAuth();
  initMap();
  await loadData();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
#map {
  height: calc(100% - 70px);
  width: 100%;
}

.stats-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 11px;
  color: #666;
}

.stat-item.nouveau .stat-value {
  color: #2196F3;
}

.stat-item.en-cours .stat-value {
  color: #FF9800;
}

.stat-item.termine .stat-value {
  color: #4CAF50;
}

ion-fab {
  bottom: 90px;
}
</style>

<style>
/* Fix pour les icônes Leaflet */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
}

.custom-marker {
  background: transparent;
  border: none;
}
</style>
