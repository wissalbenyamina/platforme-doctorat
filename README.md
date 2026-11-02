# Portail Doctoral - Université Sidi Mohamed Ben Abdellah (USMBA)

Application web complète de digitalisation du processus de **Pré-inscription et Inscription au Cycle Doctoral**, dotée d'une authentification **exclusivement Google OAuth institutionnelle (@usmba.ac.ma)**, d'un assistant d'inscription avec **scan OCR de la CNI et de la carte étudiant**, et d'un **parcours d'admission en 8 étapes avec barre de progression et horodatage certifié**.

---

## 1. Nouveautés Majeures

### 1.1 Authentification Exclusivement Google OAuth (@usmba.ac.ma)
- **Aucun formulaire classique** : Connexion via le bouton unique **« Se connecter avec Google »**.
- **Contrôle de domaine strict** : Seules les adresses se terminant par `@usmba.ac.ma` sont acceptées.
- **Refus automatique explicite** : Tout compte externe (ex: `@gmail.com`, `@yahoo.fr`) est bloqué avec un message d'alerte explicite.
- **Routage automatique par rôle** :
  * Candidat (`wissal.benyamina@usmba.ac.ma`) → Espace Candidat
  * Directeur de thèse (`k.bennani@usmba.ac.ma`) → Espace Directeur
  * Commission Doctorale (`f.alami@usmba.ac.ma`) → Espace Commission
  * Pôle Doctoral / Admin (`m.tazi@usmba.ac.ma`) → Espace Administration
  * Système & Logs (`systeme@usmba.ac.ma`) → Espace Système

### 1.2 Inscription au Cycle Doctoral (Double Scan OCR)
- **Étape 1 — Scan de la Carte Nationale (CNI)** :
  * Extraction OCR : Nom, Prénom, CNI, Date de naissance, Lieu de naissance.
  * Formulaire de vérification et de validation par le candidat (aucune donnée OCR n'est définitive sans accord).
- **Étape 2 — Scan de la Carte Étudiant** :
  * Extraction OCR : Nom, Prénom, Code étudiant (CNE / Code Massar), Établissement USMBA (ex: FSDM, ENSA, FST), Filière.
  * Préremplissage automatique et validation formelle par le candidat.

### 1.3 Parcours d'Admission en 8 Étapes avec Horodatage
La progression dynamique affiche le pourcentage d'avancement (ex: **Progression de votre admission : 62 %**) et le statut de chaque étape :
1. **Inscription** (✅ Terminé)
2. **Dépôt du dossier** (✅ Terminé)
3. **Vérification administrative** (✅ Terminé)
4. **Étude du dossier** (✅ Terminé)
5. **Validation par la Commission Doctorale** (🔵 En cours — Audition et soutenance)
6. **Validation du Directeur de thèse** (🟡 En attente — Accord formel)
7. **Décision d'admission** (🟡 En attente — Publication & signature charte)
8. **Inscription définitive au cycle doctoral** (⚪ À venir — Attestation officielle)

Chaque étape consigne l'horodatage exact (ex: `02/11/2026 à 10:35`) et l'acteur responsable.

---

## 2. Guide de Démonstration Pas à Pas

### Tester le Rejet d'un Compte Non Institutionnel
1. Sur la page de connexion, cliquez sur *« Tester le rejet d'une autre adresse Gmail... »*.
2. Saisissez par exemple `candidat.libre@gmail.com` et cliquez sur *Tester*.
3. Observez le message d'erreur rouge immédiat refusant l'accès :
   > *« Accès refusé : L'adresse « candidat.libre@gmail.com » n'est pas autorisée. Seules les adresses institutionnelles de l'Université Sidi Mohamed Ben Abdellah (@usmba.ac.ma) peuvent se connecter. »*

### Connexion Institutionnelle Google Réussie
1. Cliquez sur le bouton principal **« Se connecter avec Google »** ou choisissez le compte institutionnel de **Wissal Benyamina** (`wissal.benyamina@usmba.ac.ma`).
2. Vous êtes redirigé(e) instantanément vers le **Tableau de bord du candidat**.
3. Observez :
   - Le statut de candidature et la barre de progression : **Progression de votre admission : 62 %**.
   - La timeline des 8 étapes avec leurs horodatages précis (`02/11/2026 à ...`).
   - L'explication des étapes en attente (ex: *« Cette étape sera disponible après l'audition par la Commission Doctorale »*).
4. Naviguez dans l'onglet **« Inscription (Scan CNI & Carte Étudiant) »** pour tester le double scan OCR et la validation d'identité.
5. Utilisez la barre supérieure pour basculer vers les autres rôles (Directeur, Commission, Admin) ou cliquez sur **« Déconnexion »** pour tester la page de connexion Google.
