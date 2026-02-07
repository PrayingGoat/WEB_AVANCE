<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="dismiss">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Nouveau Signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleSubmit" :disabled="loading">
            <ion-icon :icon="checkmarkOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <!-- Mini carte pour sélectionner la position -->
        <div class="map-section">
          <ion-label>Position du signalement</ion-label>
          <div id="modal-map" ref="modalMapContainer"></div>
          <ion-button fill="outline" size="small" @click="useCurrentLocation" class="location-btn">
            <ion-icon :icon="locationOutline" slot="start"></ion-icon>
            Utiliser ma position
          </ion-button>
        </div>

        <ion-item>
          <ion-label position="floating">Adresse</ion-label>
          <ion-input v-model="form.adresse" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea
            v-model="form.description"
            required
            :rows="3"
            placeholder="Décrivez le problème..."
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Surface estimée (m²)</ion-label>
          <ion-input v-model.number="form.surface_estimee" type="number" min="0"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Budget estimé (Ar)</ion-label>
          <ion-input v-model.number="form.budget_estime" type="number" min="0"></ion-input>
        </ion-item>

        <div class="coordinates-display">
          <ion-text color="medium">
            <small>Lat: {{ form.latitude.toFixed(6) }}, Lng: {{ form.longitude.toFixed(6) }}</small>
          </ion-text>
        </div>

        <ion-button
          expand="block"
          type="submit"
          class="submit-button"
          :disabled="loading || !isFormValid"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Envoyer le signalement</span>
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonText,
  IonSpinner,
  modalController,
  toastController
} from '@ionic/vue';
import { closeOutline, checkmarkOutline, locationOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_COORDS, TILE_SERVER_URL, TILE_ATTRIBUTION } from '../config';
import signalementService from '../services/signalementService';

const props = defineProps<{
  currentPosition?: { lat: number; lng: number };
}>();

const modalMapContainer = ref<HTMLElement | null>(null);
let modalMap: L.Map | null = null;
let positionMarker: L.Marker | null = null;

const loading = ref(false);
const form = ref({
  latitude: props.currentPosition?.lat || DEFAULT_COORDS.lat,
  longitude: props.currentPosition?.lng || DEFAULT_COORDS.lng,
  adresse: '',
  description: '',
  surface_estimee: null as number | null,
  budget_estime: null as number | null
});

const isFormValid = computed(() => {
  return form.value.adresse.trim() !== '' && form.value.description.trim() !== '';
});

// Initialiser la mini carte
const initModalMap = () => {
  if (modalMapContainer.value && !modalMap) {
    modalMap = L.map(modalMapContainer.value).setView(
      [form.value.latitude, form.value.longitude],
      15
    );

    L.tileLayer(TILE_SERVER_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19
    }).addTo(modalMap);

    // Marqueur déplaçable
    positionMarker = L.marker([form.value.latitude, form.value.longitude], {
      draggable: true
    }).addTo(modalMap);

    // Mettre à jour les coordonnées quand le marqueur est déplacé
    positionMarker.on('dragend', () => {
      const position = positionMarker!.getLatLng();
      form.value.latitude = position.lat;
      form.value.longitude = position.lng;
    });

    // Mettre à jour le marqueur quand on clique sur la carte
    modalMap.on('click', (e: L.LeafletMouseEvent) => {
      form.value.latitude = e.latlng.lat;
      form.value.longitude = e.latlng.lng;
      positionMarker!.setLatLng(e.latlng);
    });

    // Fix pour l'affichage de la carte dans un modal
    setTimeout(() => {
      modalMap?.invalidateSize();
    }, 100);
  }
};

// Utiliser la position actuelle
const useCurrentLocation = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    });

    form.value.latitude = position.coords.latitude;
    form.value.longitude = position.coords.longitude;

    if (modalMap && positionMarker) {
      const newPos = new L.LatLng(position.coords.latitude, position.coords.longitude);
      positionMarker.setLatLng(newPos);
      modalMap.setView(newPos, 16);
    }

    const toast = await toastController.create({
      message: 'Position mise à jour',
      duration: 1500,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur de géolocalisation:', error);
    const toast = await toastController.create({
      message: 'Impossible d\'obtenir votre position',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
  }
};

// Soumettre le formulaire
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;

  try {
    await signalementService.createSignalement({
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      adresse: form.value.adresse,
      description: form.value.description,
      surface_estimee: form.value.surface_estimee || undefined,
      budget_estime: form.value.budget_estime || undefined
    });

    const toast = await toastController.create({
      message: 'Signalement créé avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    await modalController.dismiss({ created: true });
  } catch (error: any) {
    console.error('Erreur lors de la création:', error);
    const message = error.response?.data?.message || 'Erreur lors de la création du signalement';
    const toast = await toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

// Fermer le modal
const dismiss = () => {
  modalController.dismiss();
};

onMounted(() => {
  setTimeout(initModalMap, 200);
});

onUnmounted(() => {
  if (modalMap) {
    modalMap.remove();
    modalMap = null;
  }
});
</script>

<style scoped>
.map-section {
  margin-bottom: 16px;
}

.map-section ion-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

#modal-map {
  height: 200px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--ion-color-light-shade);
}

.location-btn {
  margin-top: 8px;
  width: 100%;
}

ion-item {
  margin-bottom: 8px;
  --background: transparent;
}

.coordinates-display {
  text-align: center;
  margin: 16px 0;
}

.submit-button {
  margin-top: 24px;
}
</style>
