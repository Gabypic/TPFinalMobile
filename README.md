# TPFinalMobile - Dashboard IoT 📱

Une application mobile (React Native / Expo) permettant de suivre en temps réel les données provenant d'un capteur IoT (Température, Humidité, Gaz, Vapeur) et de recevoir des notifications d'alerte en cas de dépassement de seuils critiques.

## 🌟 Fonctionnalités

- **Authentification** : Système de connexion et de création de compte via [Supabase](https://supabase.com/).
- **Dashboard en temps réel** : Affichage des valeurs instantanées des capteurs récupérées via une API.
- **Graphiques d'historique** : Visualisation des 20 dernières mesures et des moyennes hebdomadaires sous forme de graphiques (via `react-native-chart-kit`).
- **Système d'Alerte** : Notifications locales et Pop-ups au sein de l'application si les valeurs atteignent des seuils critiques (ex: Température > 20°C, Humidité > 80%).
- **Gestion des capteurs** : Configuration et liaison avec le capteur IoT via l'écran des paramètres.

## 🛠 Technologies utilisées

- **Framework** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/) (SDK 56).
- **Navigation** : React Navigation v7 (Stack & Bottom Tabs).
- **Backend / Auth** : Supabase.
- **Notifications** : `expo-notifications`.
- **Graphiques** : `react-native-chart-kit`.

## 🚀 Installation & Lancement

Ce projet utilise un **Client de développement personnalisé** (Bare Workflow / prebuild) pour supporter correctement certains modules natifs.

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- Java Development Kit (JDK 17 ou supérieur, souvent inclus avec Android Studio)
- [Android Studio](https://developer.android.com/studio) (pour tester sur l'émulateur Android)

### 2. Cloner et installer les dépendances
```bash
git clone https://github.com/Gabypic/TPFinalMobile.git
cd TPFinalMobile
npm install
```

### 3. Lancer l'application
Puisque le projet possède un dossier `android` généré, il **ne faut pas** utiliser l'application "Expo Go" classique. Vous devez recompiler l'application native :

Pour lancer sur Android (Émulateur ou appareil branché) :
```bash
npx expo run:android
```
*(Cette commande va télécharger les dépendances Gradle, compiler l'application `.apk` et l'installer directement sur votre émulateur).*

Pour lancer sur iOS (Nécessite un Mac) :
```bash
npx expo run:ios
```

## ⚙️ Configuration du projet (Variables d'environnement)

Assurez-vous que votre fichier `src/services/supabase.js` contient bien vos identifiants Supabase (URL et clé anonyme).

L'URL du serveur API est actuellement configurée dans les composants (ex: `http://185.132.47.110:5000`).

