# SuperMarché Mobile App

Application mobile React Native pour le supermarché, permettant aux utilisateurs de scanner des produits, gérer leur panier et effectuer des paiements.

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Application Expo Go sur votre appareil mobile

## Installation

1. Cloner le projet :
```bash
git clone [URL_DU_REPO]
cd mobile-app
```

2. Installer les dépendances :
```bash
npm install --legacy-peer-deps
```

## Principales Dépendances

### Production
- `expo`: ~49.0.15 - Framework pour le développement React Native
- `react`: 18.2.0 - Bibliothèque UI
- `react-native`: 0.72.6 - Framework mobile
- `@react-navigation/native`: ^6.1.9 - Navigation
- `@react-navigation/bottom-tabs`: ^6.5.11 - Navigation par onglets
- `@react-navigation/native-stack`: ^6.9.17 - Navigation stack
- `@react-native-async-storage/async-storage`: ^1.21.0 - Stockage local
- `axios`: ^1.6.2 - Client HTTP
- `expo-barcode-scanner`: ~12.5.3 - Scanner de codes-barres
- `expo-camera`: ~13.4.4 - Accès à la caméra
- `react-native-paypal-wrapper`: ^1.3.2 - Intégration PayPal
- `date-fns`: Pour la gestion des dates

### Développement
- `@babel/core`: ^7.20.0
- `@babel/preset-react`: ^7.22.15
- `@babel/plugin-syntax-jsx`: ^7.22.5
- `jest`: ^29.2.1
- `jest-expo`: ^49.0.0
- `@testing-library/react-native`: 11.5.0
- `@testing-library/jest-native`: ^5.4.2

## Scripts Disponibles

- `npm start` ou `expo start` : Démarre l'application en mode développement
- `npm run android` : Lance l'application sur un émulateur Android
- `npm run ios` : Lance l'application sur un simulateur iOS
- `npm test` : Exécute les tests
- `npm run web` : Lance l'application en mode web

## Commandes Utiles

### Développement
```bash
# Démarrer l'application (mode standard)
expo start

# Démarrer avec tunnel (recommandé pour WSL)
expo start --tunnel --no-web

# Démarrer avec nettoyage du cache
expo start --clear

# Lancer les tests
npm test
```

### Gestion des Dépendances
```bash
# Nettoyer l'installation
rm -rf node_modules package-lock.json

# Réinstaller les dépendances
npm install --legacy-peer-deps

# Nettoyer le cache
npm cache clean --force
```

## Structure du Projet

```
mobile-app/
├── src/
│   ├── screens/         # Écrans de l'application
│   ├── components/      # Composants réutilisables
│   ├── navigation/      # Configuration de la navigation
│   ├── services/        # Services (API, auth, etc.)
│   ├── contexts/        # Contextes React
│   └── hooks/          # Hooks personnalisés
├── assets/             # Ressources statiques
├── __tests__/         # Tests
├── app.json           # Configuration Expo
└── babel.config.js    # Configuration Babel
```

## Dépannage

### Problèmes Courants

1. **Erreur de dépendances :**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

2. **Problèmes de cache :**
```bash
expo start --clear
```

3. **Problèmes de connexion WSL :**
```bash
# Utiliser le mode tunnel
expo start --tunnel --no-web
```

4. **Erreurs de build :**
```bash
# Nettoyer le cache
npm cache clean --force
# Réinstaller les dépendances
npm install --legacy-peer-deps
```

## Tests

Les tests sont configurés avec Jest et React Native Testing Library. Pour exécuter les tests :

```bash
npm test
```

Pour voir la couverture des tests :
```bash
npm test -- --coverage
```
