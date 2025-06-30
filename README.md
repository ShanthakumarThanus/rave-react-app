# 🎙️ RAVE - Application d'enregistrement et transformation audio

RAVE est une application mobile React Native permettant :

- d’enregistrer de l’audio 🎤  
- de sauvegarder des clips localement 💾  
- d’envoyer un enregistrement à un serveur pour transformation 🔄  
- d’écouter et comparer le résultat 🧠🎧

Scanner ce code QR pour accéder à l'application avec Expo Go : 
---
![image](https://github.com/user-attachments/assets/f6cc925a-7c78-4d87-aea0-f530229b2f2c)


## 🚀 Fonctionnalités

- 🎚️ Enregistrement audio haute qualité
- 📂 Gestion des enregistrements avec nom personnalisé
- 🔄 Transformation vocale via serveur (modèles sélectionnables)
- 🎧 Lecture audio intégrée (original / transformé)
- 🗑️ Suppression d’enregistrements
- 🔌 Connexion serveur paramétrable (IP + port)

---

## 🛠️ Technologies utilisées

- **React Native** (via Expo)
- **Redux Toolkit** pour la gestion d’état
- **Expo AV** pour l'enregistrement et la lecture audio
- **Expo FileSystem** pour la gestion des fichiers
- **Axios** pour la communication HTTP
- **React Navigation** (avec bottom tab)

---

## 📦 Installation pour le développement local

1. **Cloner le repo**

```bash
git clone https://github.com/votre-utilisateur/rave-react-app.git
cd rave-react-app
```

2. **Installer les dépendances**

```bash
npm install
```
3. **Lancer le serveur d'Expo Go**
```bash
npx expo start
```

4. 📱 Scanner avec l'application Expo Go pour démarrer l'application RAVE

---

## Configuration du serveur de transformation audio :
---
Puisqu’il est difficile de faire réaliser les calculs du modèle au téléphone directement,
un serveur python est mis en place pour la partie calcul et renverra les clips audio

Voici les étapes pour le configurer : 

```bash
git clone https://github.com/gnvIRCAM/RAVE-ONNX-Server.git
cd RAVE-ONNX-Server
pip install -r requirements.txt
```
Commande pour le lancer : 

```bash
python server.py
```

## 📄 Licence

Ce projet est sous licence MIT.

## Auteur

Développé par Thanus SHANTHAKUMAR
