# Configuration du Serveur de Cartes Offline

## Vue d'ensemble

Ce dossier contient la configuration pour le serveur de tuiles (TileServer GL) qui permet d'afficher la carte d'Antananarivo en mode offline.

## Prérequis

- Docker et Docker Compose installés
- Connexion Internet pour télécharger les données OSM

## Étapes de configuration

### 1. Créer le dossier de données

```bash
mkdir -p data
```

### 2. Télécharger les données OSM d'Antananarivo

Il existe plusieurs options pour obtenir les données :

#### Option A : Utiliser Geofabrik (Recommandé)

```bash
# Télécharger l'extrait de Madagascar
wget https://download.geofabrik.de/africa/madagascar-latest.osm.pbf -O data/madagascar.osm.pbf
```

#### Option B : Utiliser BBBike (Plus précis pour Antananarivo)

1. Aller sur https://extract.bbbike.org/
2. Sélectionner la région d'Antananarivo sur la carte
3. Choisir le format "OSM XML Protocolbuffer (.osm.pbf)"
4. Télécharger et placer dans `data/antananarivo.osm.pbf`

#### Option C : Utiliser Overpass API (Pour une zone personnalisée)

```bash
# Télécharger uniquement Antananarivo (environ -18.77 à -18.96, 47.41 à 47.57)
wget -O data/antananarivo.osm.pbf "http://overpass-api.de/api/map?bbox=47.41,-18.96,47.57,-18.77"
```

### 3. Convertir en MBTiles

Pour que TileServer GL puisse utiliser les données, il faut les convertir en format MBTiles.

#### Installation de tilemaker (outil de conversion)

```bash
# Sur Ubuntu/Debian
sudo apt-get install tilemaker

# Sur macOS
brew install tilemaker

# Ou utiliser Docker
docker pull systemed/tilemaker
```

#### Conversion des données

```bash
# Avec tilemaker installé localement
tilemaker --input data/antananarivo.osm.pbf \
          --output data/antananarivo.mbtiles \
          --config resources/config-openmaptiles.json \
          --process resources/process-openmaptiles.lua

# Avec Docker
docker run -v $(pwd)/data:/data systemed/tilemaker \
    --input /data/antananarivo.osm.pbf \
    --output /data/antananarivo.mbtiles
```

### 4. (Alternative) Télécharger des tuiles pré-générées

Si vous ne voulez pas générer les tuiles vous-même :

```bash
# Utiliser OpenMapTiles (nécessite un compte gratuit)
# https://openmaptiles.com/downloads/africa/madagascar/

# Ou utiliser un service de téléchargement de tuiles
# https://download.maptiler.com/
```

### 5. Vérifier la structure des fichiers

Après configuration, votre structure devrait ressembler à :

```
docker/tile-server/
├── config.json           # Configuration du serveur
├── README.md            # Ce fichier
└── data/
    └── antananarivo.mbtiles  # Fichier de tuiles (peut être volumineux)
```

## Utilisation

### Démarrer le serveur de tuiles

```bash
# Depuis la racine du projet
docker-compose up tile-server
```

### Accéder au serveur

- Interface web : http://localhost:8080
- Aperçu de la carte : http://localhost:8080/styles/basic/
- Tuiles : http://localhost:8080/styles/basic/{z}/{x}/{y}.png

### Tester dans Leaflet

```javascript
const map = L.map('map').setView([-18.8792, 47.5079], 13);

L.tileLayer('http://localhost:8080/styles/basic/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);
```

## Configuration avancée

### Personnaliser le style de la carte

Modifiez `config.json` pour ajouter différents styles :

```json
{
  "styles": {
    "basic": {
      "style": "basic/style.json"
    },
    "streets": {
      "style": "streets/style.json"
    }
  }
}
```

### Limiter la zone géographique

Dans `config.json`, les bounds sont définis pour Antananarivo :

```json
{
  "bounds": [47.3, -19.1, 47.7, -18.7]
}
```

## Dépannage

### Le serveur ne démarre pas

1. Vérifier que le fichier `antananarivo.mbtiles` existe dans `data/`
2. Vérifier les logs : `docker-compose logs tile-server`

### Les tuiles ne s'affichent pas

1. Vérifier que le port 8080 n'est pas utilisé par un autre service
2. Tester l'URL directement : http://localhost:8080/data/v3.json

### Fichier trop volumineux

Si le fichier MBTiles est trop gros :
1. Réduire la zone géographique lors de l'extraction
2. Limiter les niveaux de zoom (ex: maxzoom=14)
3. Utiliser une résolution plus basse

## Ressources

- TileServer GL : https://github.com/maptiler/tileserver-gl
- Tilemaker : https://github.com/systemed/tilemaker
- OpenMapTiles : https://openmaptiles.org/
- Geofabrik Downloads : https://download.geofabrik.de/
- BBBike Extract : https://extract.bbbike.org/

## Notes

- Les données OSM sont sous licence ODbL (Open Database License)
- Pensez à mettre à jour régulièrement les données pour avoir les dernières modifications
- La taille typique d'un fichier MBTiles pour Antananarivo : 50-200 MB selon le niveau de détail