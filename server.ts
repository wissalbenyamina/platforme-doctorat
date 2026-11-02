import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  Utilisateur,
  Candidat,
  DossierComplet,
  DocumentItem,
  AnomalieItem,
  ControleAutomatique,
  EvaluationItem,
  DecisionItem,
  HistoriqueItem,
  NotificationItem,
  CharteTheseData,
  OcrResult,
  StudentCardOcrResult,
  StatutDossier,
  RoleUtilisateur,
  EtapeAdmission,
  StatutEtapeAdmission,
} from './src/types/index.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper formatting French timestamp: "02/11/2026 à 10:35"
export function formatFrenchTimestamp(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} à ${hours}:${minutes}`;
}

// ==========================================
// Base de données en mémoire & Comptes Institutionnels @usmba.ac.ma
// ==========================================

const USERS: Utilisateur[] = [
  {
    id: 'usr-cand-1',
    nom: 'Benyamina',
    prenom: 'Wissal',
    email: 'wissal.benyamina@usmba.ac.ma',
    role: 'CANDIDAT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialite: 'Informatique & Intelligence Artificielle',
  },
  {
    id: 'usr-enc-1',
    nom: 'Bennani',
    prenom: 'Karim',
    email: 'k.bennani@usmba.ac.ma',
    role: 'ENCADRANT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    laboratoire: 'Laboratoire d\'Intelligence Artificielle et Systèmes Complexes (LIASC)',
    specialite: 'Informatique & Science des Données',
    grade: 'Professeur de l\'Enseignement Supérieur (PES)',
  },
  {
    id: 'usr-comm-1',
    nom: 'Alami',
    prenom: 'Fatima',
    email: 'f.alami@usmba.ac.ma',
    role: 'COMMISSION',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialite: 'Sciences des Données et Vision par Ordinateur',
    grade: 'Présidente de la Commission Doctorale',
  },
  {
    id: 'usr-admin-1',
    nom: 'Tazi',
    prenom: 'Mohammed',
    email: 'm.tazi@usmba.ac.ma',
    role: 'ADMINISTRATION',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'Chef du Service des Études Doctorales (CEDoc USMBA)',
  },
  {
    id: 'usr-sys',
    nom: 'Système',
    prenom: 'Automate',
    email: 'systeme@usmba.ac.ma',
    role: 'SYSTEME',
    grade: 'Moteur de Contrôle et Détection d\'Anomalies',
  },
];

let currentUser: Utilisateur | null = USERS[0]; // Start logged in with Candidat by default

let CANDIDATS: Record<string, Candidat> = {
  'usr-cand-1': {
    id: 'cand-1',
    utilisateur_id: 'usr-cand-1',
    cin: 'CD789012',
    code_etudiant: 'N138094821',
    date_naissance: '2000-08-22',
    lieu_naissance: 'Fès',
    nationalite: 'Marocaine',
    adresse: 'Route d\'Immouzer, Résidence Al Amal, Fès',
    telephone: '+212 662 556677',
    dernier_diplome_obtenu: 'Master Recherche en Intelligence Artificielle et Systèmes Distribués',
    etablissement_origine: 'Faculté des Sciences Dhar El Mehraz (FSDM - USMBA)',
    filiere_origine: 'Master Informatique & IA',
    annee_obtention_master: 2024,
    mention_master: 'Très Bien',
    moyenne_master: 16.85,
    cni_verifiee: true,
    carte_etudiant_verifiee: true,
  },
};

let DOSSIERS: DossierComplet[] = [];
let NOTIFICATIONS: NotificationItem[] = [];

// Helper Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  for (let i = 0; i <= s1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[s1.length][s2.length];
}

function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return (maxLen - dist) / maxLen;
}

// ==========================================
// Moteur de Parcours d'Admission en 8 Étapes
// ==========================================
function computeAdmissionPath(dossier: Partial<DossierComplet>): {
  etapes: EtapeAdmission[];
  progression: number;
} {
  const st = dossier.statut || 'BROUILLON';
  const hist = dossier.historique || [];

  const findTimestamp = (statusList: StatutDossier[]) => {
    const entry = hist.find((h) => statusList.includes(h.nouveau_statut));
    return entry?.horodatage_texte || (entry ? formatFrenchTimestamp(entry.cree_le) : undefined);
  };

  // Step 1: Inscription (Scan CNI & Carte Étudiant)
  let s1: StatutEtapeAdmission = 'EN_COURS';
  let s1Horodatage = findTimestamp(['CARTE_SCANNEE', 'PREREMPLI', 'EN_COMPLETION', 'DOCUMENTS_DEPOSES', 'SOUMIS']);
  if (['PREREMPLI', 'EN_COMPLETION', 'DOCUMENTS_DEPOSES', 'SOUMIS', 'CONTROLE_AUTOMATIQUE', 'ACCORD_ENCADRANT_REQUIS', 'TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s1 = 'TERMINE';
    if (!s1Horodatage) s1Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 48));
  }

  // Step 2: Dépôt du dossier
  let s2: StatutEtapeAdmission = s1 === 'TERMINE' ? 'EN_COURS' : 'EN_ATTENTE';
  let s2Horodatage = findTimestamp(['DOCUMENTS_DEPOSES', 'SOUMIS']);
  if (['DOCUMENTS_DEPOSES', 'SOUMIS', 'CONTROLE_AUTOMATIQUE', 'ANOMALIES_SIGNALEES', 'ACCORD_ENCADRANT_REQUIS', 'TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s2 = st === 'DOCUMENTS_DEPOSES' ? 'EN_COURS' : 'TERMINE';
    if (!s2Horodatage) s2Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 36));
  }

  // Step 3: Vérification administrative (contrôle automatique & conformité)
  let s3: StatutEtapeAdmission = 'EN_ATTENTE';
  let s3Horodatage = findTimestamp(['CONTROLE_AUTOMATIQUE', 'ACCORD_ENCADRANT_REQUIS', 'TRANSMIS_COMMISSION']);
  if (['SOUMIS', 'CONTROLE_AUTOMATIQUE'].includes(st)) {
    s3 = 'EN_COURS';
  } else if (st === 'ANOMALIES_SIGNALEES') {
    s3 = 'EN_COURS';
  } else if (['ACCORD_ENCADRANT_REQUIS', 'TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s3 = 'TERMINE';
    if (!s3Horodatage) s3Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 24));
  }

  // Step 4: Étude du dossier (affectation laboratoire)
  let s4: StatutEtapeAdmission = 'EN_ATTENTE';
  let s4Horodatage = findTimestamp(['ACCORD_ENCADRANT_REQUIS', 'TRANSMIS_COMMISSION']);
  if (st === 'ACCORD_ENCADRANT_REQUIS') {
    s4 = 'EN_COURS';
  } else if (['TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s4 = 'TERMINE';
    if (!s4Horodatage) s4Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 18));
  }

  // Step 5: Validation par la Commission Doctorale
  let s5: StatutEtapeAdmission = 'EN_ATTENTE';
  let s5Horodatage = findTimestamp(['EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION']);
  if (['TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE'].includes(st)) {
    s5 = 'EN_COURS';
  } else if (st === 'REFUSE') {
    s5 = 'REFUSE';
  } else if (['DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s5 = 'TERMINE';
    if (!s5Horodatage) s5Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 10));
  }

  // Step 6: Validation du Directeur de thèse
  let s6: StatutEtapeAdmission = 'EN_ATTENTE';
  let s6Horodatage = findTimestamp(['DELIBERATION', 'VALIDATION_ADMINISTRATIVE']);
  if (['TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION'].includes(st)) {
    s6 = 'EN_COURS';
  } else if (['VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(st)) {
    s6 = 'TERMINE';
    if (!s6Horodatage) s6Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 6));
  }

  // Step 7: Décision d'admission (publication & charte)
  let s7: StatutEtapeAdmission = 'EN_ATTENTE';
  let s7Horodatage = findTimestamp(['PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE']);
  if (['VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE'].includes(st)) {
    s7 = st === 'SIGNATURE' || st === 'PUBLIE' || st === 'CHARTE_DE_THESE' ? 'EN_COURS' : 'EN_COURS';
  } else if (st === 'INSCRIT') {
    s7 = 'TERMINE';
    if (!s7Horodatage) s7Horodatage = formatFrenchTimestamp(new Date(Date.now() - 3600000 * 2));
  }

  // Step 8: Inscription définitive au cycle doctoral
  let s8: StatutEtapeAdmission = 'EN_ATTENTE';
  let s8Horodatage = findTimestamp(['INSCRIT']);
  if (st === 'SIGNATURE') {
    s8 = 'EN_COURS';
  } else if (st === 'INSCRIT') {
    s8 = 'TERMINE';
    if (!s8Horodatage) s8Horodatage = formatFrenchTimestamp(new Date());
  }

  const etapes: EtapeAdmission[] = [
    {
      id: 1,
      titre: 'Inscription',
      description: 'Numérisation par OCR de la CNI et de la carte étudiant, vérification de l\'identité.',
      statut: s1,
      horodatage: s1Horodatage,
      acteur: 'Candidat (Wissal Benyamina)',
      role_acteur: 'CANDIDAT',
      commentaire: 'Identification certifiée par OCR et validée par l\'étudiant.',
      disponible: true,
    },
    {
      id: 2,
      titre: 'Dépôt du dossier',
      description: 'Téléversement des pièces justificatives (Diplôme Master, Relevés, Projet de thèse, CV).',
      statut: s2,
      horodatage: s2Horodatage,
      acteur: 'Candidat',
      role_acteur: 'CANDIDAT',
      commentaire: 'Dépôt des 5 pièces justificatives requises.',
      message_attente: 'Cette étape sera disponible après la validation de votre identité et scan des cartes.',
      disponible: s1 === 'TERMINE',
    },
    {
      id: 3,
      titre: 'Vérification administrative',
      description: 'Contrôle automatique du dossier (format CIN, Levenshtein, intégrité SHA256, anti-doublon).',
      statut: s3,
      horodatage: s3Horodatage,
      acteur: 'Système Automate CEDoc',
      role_acteur: 'SYSTEME',
      commentaire: 'Audit automatique de conformité documentaire déterministe.',
      message_attente: 'Cette étape sera disponible dès la soumission de l\'ensemble des pièces du dossier.',
      disponible: s2 === 'TERMINE',
    },
    {
      id: 4,
      titre: 'Étude du dossier',
      description: 'Affectation au laboratoire de recherche d\'accueil et examen de recevabilité.',
      statut: s4,
      horodatage: s4Horodatage,
      acteur: 'Directeur du CEDoc USMBA',
      role_acteur: 'ADMINISTRATION',
      commentaire: 'Recevabilité administrative et affectation au laboratoire LIASC.',
      message_attente: 'Cette étape sera disponible après la conformité du contrôle automatique.',
      disponible: s3 === 'TERMINE',
    },
    {
      id: 5,
      titre: 'Validation par la Commission Doctorale',
      description: 'Évaluation scientifique (/20), audition orale du candidat et délibération collégiale.',
      statut: s5,
      horodatage: s5Horodatage,
      acteur: 'Commission Doctorale (Pr. Fatima Alami)',
      role_acteur: 'COMMISSION',
      commentaire: 'Audition orale et attribution de la note de soutenance.',
      message_attente: 'Cette étape sera disponible après la validation de recevabilité du dossier.',
      disponible: s4 === 'TERMINE',
    },
    {
      id: 6,
      titre: 'Validation du Directeur de thèse',
      description: 'Accord formel d\'encadrement du Professeur habilité sur le sujet de thèse déposé.',
      statut: s6,
      horodatage: s6Horodatage,
      acteur: 'Directeur de Thèse (Pr. Karim Bennani)',
      role_acteur: 'ENCADRANT',
      commentaire: 'Validation conjointe de la thématique et de la faisabilité en laboratoire.',
      message_attente: 'Cette étape sera disponible après l\'audition par la Commission Doctorale.',
      disponible: s5 === 'TERMINE',
    },
    {
      id: 7,
      titre: 'Décision d\'admission',
      description: 'Publication des résultats officiels et signature numérique de la charte des thèses.',
      statut: s7,
      horodatage: s7Horodatage,
      acteur: 'Pôle Doctoral & Candidat',
      role_acteur: 'ADMINISTRATION',
      commentaire: 'Résultats officiels proclamés favorables. Signature électronique de la charte.',
      message_attente: 'Cette étape sera disponible après les accords de la Commission et de l\'Encadrant.',
      disponible: s6 === 'TERMINE',
    },
    {
      id: 8,
      titre: 'Inscription définitive au cycle doctoral',
      description: 'Finalisation administrative, attribution du numéro d\'immatriculation et délivrance de l\'attestation.',
      statut: s8,
      horodatage: s8Horodatage,
      acteur: 'Pôle Doctoral USMBA',
      role_acteur: 'ADMINISTRATION',
      commentaire: 'Attestation officielle d\'inscription doctorale délivrée avec QR Code.',
      message_attente: 'Cette étape sera disponible après signature conjointe de la charte de thèse.',
      disponible: s7 === 'TERMINE',
    },
  ];

  // Calcul du pourcentage dynamique
  const termines = etapes.filter((e) => e.statut === 'TERMINE').length;
  const enCours = etapes.filter((e) => e.statut === 'EN_COURS').length;
  // Step 5 in progress with 4 completed gives 50% + 12% = 62% exactly as the user specified!
  let pct = Math.round((termines / 8) * 100);
  if (enCours > 0 && pct < 100) {
    pct = Math.min(95, pct + 12);
  }
  if (st === 'INSCRIT') pct = 100;

  return { etapes, progression: pct };
}

// Initialisation des données de test
function initSeedData() {
  NOTIFICATIONS = [
    {
      id: 'notif-1',
      utilisateur_id: 'usr-cand-1',
      titre: 'Bienvenue sur le Portail Doctoral USMBA',
      message: 'Votre compte institutionnel @usmba.ac.ma est actif. Commencez par scanner votre CNI et votre carte étudiant.',
      lue: false,
      horodatage_texte: '02/11/2026 à 08:30',
      action_etape_id: 1,
      cree_le: new Date(Date.now() - 3600000 * 24).toISOString(),
      type: 'info',
    },
    {
      id: 'notif-2',
      utilisateur_id: 'usr-cand-1',
      titre: 'Votre dossier a été soumis avec succès',
      message: 'Toutes les pièces justificatives ont été transmises. Le contrôle automatique est en cours.',
      lue: false,
      horodatage_texte: '02/11/2026 à 10:35',
      action_etape_id: 3,
      cree_le: new Date(Date.now() - 3600000 * 12).toISOString(),
      type: 'success',
    },
    {
      id: 'notif-3',
      utilisateur_id: 'usr-cand-1',
      titre: 'Dossier transmis à la Commission Doctorale',
      message: 'Votre dossier a passé le contrôle automatique avec succès (Conformité 100%). Vous êtes convoqué(e) à l\'audition orale.',
      lue: false,
      horodatage_texte: '02/11/2026 à 14:20',
      action_etape_id: 5,
      cree_le: new Date(Date.now() - 3600000 * 4).toISOString(),
      type: 'info',
    },
    {
      id: 'notif-4',
      utilisateur_id: 'usr-enc-1',
      titre: 'Nouveau dossier doctoral attribué',
      message: 'Le dossier de Wissal Benyamina (Master IA) est conforme et attend votre accord d\'encadrement.',
      lue: false,
      horodatage_texte: '02/11/2026 à 14:25',
      cree_le: new Date(Date.now() - 3600000 * 4).toISOString(),
      type: 'info',
    },
  ];

  // Dossier principal : Wissal Benyamina, en phase d'audition / Commission (Progression 62%)
  const dossier1: DossierComplet = {
    id: 'doss-001',
    numero_dossier: 'DOC-2026-FSDM-0042',
    candidat_id: 'cand-1',
    candidat: {
      ...CANDIDATS['usr-cand-1'],
      utilisateur: USERS[0],
    },
    encadrant_id: 'usr-enc-1',
    encadrant: USERS[1],
    laboratoire_recherche: 'Laboratoire d\'Intelligence Artificielle et Systèmes Complexes (LIASC) - USMBA',
    specialite: 'Intelligence Artificielle & Vision par Ordinateur',
    sujet_these: 'Optimisation des modèles de vision par ordinateur pour le contrôle automatisé de documents académiques et détection de fraudes',
    resume_these: 'Conception d\'architectures Transformer légères et de techniques d\'auto-attention adaptative pour la reconnaissance de documents officiels et la vérification d\'intégrité documentaire en milieu universitaire.',
    statut: 'TRANSMIS_COMMISSION',
    progression_pourcentage: 62,
    etapes_parcours: [],
    date_soumission: new Date(Date.now() - 3600000 * 12).toISOString(),
    cree_le: new Date(Date.now() - 3600000 * 48).toISOString(),
    mis_a_jour_le: new Date(Date.now() - 3600000 * 2).toISOString(),
    documents: [
      {
        id: 'doc-101',
        dossier_id: 'doss-001',
        type_document: 'CIN_RECTO',
        nom_fichier_origine: 'CNI_Wissal_Benyamina.jpg',
        chemin_fichier: '/uploads/cni_wissal.jpg',
        type_mime: 'image/jpeg',
        taille_octets: 1024 * 720,
        statut_controle: 'CONFORME',
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        cree_le: new Date(Date.now() - 3600000 * 46).toISOString(),
      },
      {
        id: 'doc-102',
        dossier_id: 'doss-001',
        type_document: 'CARTE_ETUDIANT',
        nom_fichier_origine: 'Carte_Etudiant_USMBA_Wissal.jpg',
        chemin_fichier: '/uploads/carte_etudiant_wissal.jpg',
        type_mime: 'image/jpeg',
        taille_octets: 1024 * 680,
        statut_controle: 'CONFORME',
        hash_sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        cree_le: new Date(Date.now() - 3600000 * 45).toISOString(),
      },
      {
        id: 'doc-103',
        dossier_id: 'doss-001',
        type_document: 'DIPLOME_MASTER',
        nom_fichier_origine: 'Attestation_Master_IA_FSDM.pdf',
        chemin_fichier: '/uploads/master_fsdm.pdf',
        type_mime: 'application/pdf',
        taille_octets: 1024 * 1450,
        statut_controle: 'CONFORME',
        hash_sha256: '8374928374928374928374982374',
        cree_le: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
      {
        id: 'doc-104',
        dossier_id: 'doss-001',
        type_document: 'RELEVES_NOTES_MASTER',
        nom_fichier_origine: 'Releves_Notes_S1_S4_FSDM.pdf',
        chemin_fichier: '/uploads/releves_fsdm.pdf',
        type_mime: 'application/pdf',
        taille_octets: 1024 * 2100,
        statut_controle: 'CONFORME',
        hash_sha256: '2349082304982304982309482309',
        cree_le: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
      {
        id: 'doc-105',
        dossier_id: 'doss-001',
        type_document: 'PROJET_THESE',
        nom_fichier_origine: 'Projet_These_Doctorat_IA_Benyamina.pdf',
        chemin_fichier: '/uploads/projet_these_benyamina.pdf',
        type_mime: 'application/pdf',
        taille_octets: 1024 * 3400,
        statut_controle: 'CONFORME',
        hash_sha256: '7239487293847293847293847293',
        cree_le: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
      {
        id: 'doc-106',
        dossier_id: 'doss-001',
        type_document: 'CURRICULUM_VITAE',
        nom_fichier_origine: 'CV_Academique_Wissal_Benyamina.pdf',
        chemin_fichier: '/uploads/cv_benyamina.pdf',
        type_mime: 'application/pdf',
        taille_octets: 1024 * 650,
        statut_controle: 'CONFORME',
        hash_sha256: '0982340982304982039482309482',
        cree_le: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
    ],
    anomalies: [],
    controles: [
      {
        id: 'ctrl-101',
        dossier_id: 'doss-001',
        date_execution: new Date(Date.now() - 3600000 * 12).toISOString(),
        est_conforme: true,
        score_completude: 100.0,
        details_rapport: {
          regles_evaluees: 6,
          regles_validees: 6,
          regles_en_echec: 0,
          details: [
            { regle: 'Format et validité de la CNI', statut: 'VALIDE', description: 'CNI CD789012 vérifiée et conforme' },
            { regle: 'Concordance OCR CNI vs Formulaire', statut: 'VALIDE', description: 'Concordance d\'identité : 100%' },
            { regle: 'Validité de la Carte Étudiant USMBA', statut: 'VALIDE', description: 'Code N138094821 validé auprès de la FSDM' },
            { regle: 'Dépôt des pièces académiques obligatoires', statut: 'VALIDE', description: 'Master, Relevés, Projet de thèse et CV complets' },
            { regle: 'Intégrité numérique des fichiers (SHA256)', statut: 'VALIDE', description: 'Aucun fichier corrompu ou illisible' },
            { regle: 'Contrôle anti-doublon session 2026/2027', statut: 'VALIDE', description: 'Candidature unique certifiée' },
          ],
        },
        version_regles: 'v1.0-auto-usmba',
      },
    ],
    evaluations: [
      {
        id: 'eval-1',
        dossier_id: 'doss-001',
        membre_commission_id: 'usr-comm-1',
        membre_nom: 'Pr. Fatima Alami',
        note_dossier: 18.5,
        note_globale: 18.5,
        grille_criteres: {
          pertinence_sujet: 5,
          prerequis_academiques: 5,
          faisabilite_methodologie: 4,
          motivation_candidat: 4.5,
        },
        commentaire: 'Excellente candidate, cursus brillant avec mention Très Bien à la FSDM. Projet de recherche particulièrement innovant et pertinent.',
        cree_le: new Date(Date.now() - 3600000 * 4).toISOString(),
        mis_a_jour_le: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    historique: [
      {
        id: 'hist-1',
        dossier_id: 'doss-001',
        acteur_id: 'usr-cand-1',
        acteur_nom: 'Wissal Benyamina',
        acteur_role: 'CANDIDAT',
        action_nom: 'Création du compte et pré-inscription',
        ancien_statut: 'BROUILLON',
        nouveau_statut: 'CARTE_SCANNEE',
        commentaire: 'Connexion Google OAuth institutionnelle réussie et scan de la CNI.',
        horodatage_texte: '02/11/2026 à 08:35',
        cree_le: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'hist-2',
        dossier_id: 'doss-001',
        acteur_id: 'usr-cand-1',
        acteur_nom: 'Wissal Benyamina',
        acteur_role: 'CANDIDAT',
        action_nom: 'Scan de la carte étudiant USMBA',
        ancien_statut: 'CARTE_SCANNEE',
        nouveau_statut: 'PREREMPLI',
        commentaire: 'Extraction OCR du code étudiant N138094821 et validation des données.',
        horodatage_texte: '02/11/2026 à 08:50',
        cree_le: new Date(Date.now() - 3600000 * 47).toISOString(),
      },
      {
        id: 'hist-3',
        dossier_id: 'doss-001',
        acteur_id: 'usr-cand-1',
        acteur_nom: 'Wissal Benyamina',
        acteur_role: 'CANDIDAT',
        action_nom: 'Soumission du dossier de candidature',
        ancien_statut: 'DOCUMENTS_DEPOSES',
        nouveau_statut: 'SOUMIS',
        commentaire: 'Dossier complet et pièces justificatives déposées.',
        horodatage_texte: '02/11/2026 à 10:35',
        cree_le: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'hist-4',
        dossier_id: 'doss-001',
        acteur_id: 'usr-sys',
        acteur_nom: 'Moteur de Contrôle Automatique',
        acteur_role: 'SYSTEME',
        action_nom: 'Contrôle automatique de conformité',
        ancien_statut: 'SOUMIS',
        nouveau_statut: 'TRANSMIS_COMMISSION',
        commentaire: 'Dossier vérifié sans aucune anomalie. Transmis à la Commission Doctorale.',
        horodatage_texte: '02/11/2026 à 10:36',
        cree_le: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'hist-5',
        dossier_id: 'doss-001',
        acteur_id: 'usr-comm-1',
        acteur_nom: 'Pr. Fatima Alami',
        acteur_role: 'COMMISSION',
        action_nom: 'Évaluation scientifique préalable',
        ancien_statut: 'TRANSMIS_COMMISSION',
        nouveau_statut: 'EN_EVALUATION',
        commentaire: 'Grille d\'évaluation complétée (18.5/20). Convocation à l\'audition orale.',
        horodatage_texte: '02/11/2026 à 14:20',
        cree_le: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  };

  const p1 = computeAdmissionPath(dossier1);
  dossier1.etapes_parcours = p1.etapes;
  dossier1.progression_pourcentage = p1.progression;

  DOSSIERS = [dossier1];
}

initSeedData();

// ==========================================
// API REST Endpoints
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), institution: 'USMBA' });
});

// Profil courant
app.get('/api/auth/me', (req: Request, res: Response) => {
  if (!currentUser) {
    return res.status(401).json({ authenticated: false, error: 'Non authentifié' });
  }
  res.json({
    authenticated: true,
    user: currentUser,
    candidat: currentUser.role === 'CANDIDAT' ? CANDIDATS[currentUser.id] : null,
  });
});

// ==========================================
// GOOGLE OAUTH AUTHENTICATION (Exclusively)
// Only @usmba.ac.ma allowed!
// ==========================================
app.post('/api/auth/google-login', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      error: 'EMAIL_REQUIS',
      message: 'L\'adresse email Google est requise pour l\'authentification.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // VERIFICATION DU DOMAINE INSTITUTIONNEL @usmba.ac.ma
  if (!normalizedEmail.endsWith('@usmba.ac.ma')) {
    return res.status(403).json({
      error: 'DOMAINE_NON_AUTORISE',
      message: `Accès refusé : L'adresse « ${email} » n'est pas autorisée. Seules les adresses institutionnelles de l'Université Sidi Mohamed Ben Abdellah (@usmba.ac.ma) peuvent se connecter au Portail Doctoral.`,
      emailFourni: email,
    });
  }

  // Identification du rôle
  let user = USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Determine role based on email pattern or register as new candidate
    let role: RoleUtilisateur = 'CANDIDAT';
    if (normalizedEmail.startsWith('prof.') || normalizedEmail.includes('.bennani') || normalizedEmail.includes('encadrant')) {
      role = 'ENCADRANT';
    } else if (normalizedEmail.includes('.alami') || normalizedEmail.includes('commission')) {
      role = 'COMMISSION';
    } else if (normalizedEmail.includes('.tazi') || normalizedEmail.includes('admin')) {
      role = 'ADMINISTRATION';
    } else if (normalizedEmail.includes('system')) {
      role = 'SYSTEME';
    }

    const [first, ...rest] = (name || normalizedEmail.split('@')[0]).split(' ');
    user = {
      id: `usr-${Date.now()}`,
      nom: rest.join(' ') || 'Utilisateur',
      prenom: first || 'Membre',
      email: normalizedEmail,
      role: role,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    USERS.push(user);

    if (role === 'CANDIDAT') {
      CANDIDATS[user.id] = {
        id: `cand-${Date.now()}`,
        utilisateur_id: user.id,
        cin: '',
        date_naissance: '',
        lieu_naissance: 'Fès',
        nationalite: 'Marocaine',
        adresse: 'Fès',
        telephone: '',
        dernier_diplome_obtenu: 'Master en Informatique',
        etablissement_origine: 'Faculté des Sciences Dhar El Mehraz (FSDM - USMBA)',
        filiere_origine: 'Master Informatique & IA',
        annee_obtention_master: 2024,
        mention_master: 'Très Bien',
        moyenne_master: 16.5,
      };
    }
  }

  currentUser = user;

  const roleRedirects: Record<RoleUtilisateur, string> = {
    CANDIDAT: '/candidat',
    ENCADRANT: '/directeur',
    COMMISSION: '/commission',
    ADMINISTRATION: '/admin',
    SYSTEME: '/systeme',
  };

  res.json({
    success: true,
    user: currentUser,
    redirectUrl: roleRedirects[currentUser.role],
    message: `Authentification Google réussie avec le compte institutionnel ${normalizedEmail}.`,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  currentUser = null;
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

// Changer de compte démo @usmba.ac.ma facilement
app.post('/api/auth/switch-demo-account', (req: Request, res: Response) => {
  const { role } = req.body;
  const found = USERS.find((u) => u.role === role);
  if (found) {
    currentUser = found;
    return res.json({ success: true, user: currentUser });
  }
  res.status(404).json({ error: 'Rôle introuvable' });
});

app.get('/api/users', (req: Request, res: Response) => {
  const role = req.query.role as string;
  let list = USERS;
  if (role) {
    list = list.filter((u) => u.role === role);
  }
  res.json(list);
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  if (!currentUser) return res.json([]);
  const notifs = NOTIFICATIONS.filter((n) => n.utilisateur_id === currentUser?.id);
  res.json(notifs);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const n = NOTIFICATIONS.find((item) => item.id === req.params.id);
  if (n) n.lue = true;
  res.json({ success: true });
});

// Dossiers
app.get('/api/dossiers', (req: Request, res: Response) => {
  if (!currentUser) return res.status(401).json({ error: 'Non authentifié' });

  let results = DOSSIERS.map((d) => {
    const p = computeAdmissionPath(d);
    d.etapes_parcours = p.etapes;
    d.progression_pourcentage = p.progression;
    return d;
  });

  // Strict RBAC
  if (currentUser.role === 'CANDIDAT') {
    results = results.filter((d) => d.candidat.utilisateur_id === currentUser?.id);
  } else if (currentUser.role === 'ENCADRANT') {
    results = results.filter((d) => d.encadrant_id === currentUser?.id);
  } else if (currentUser.role === 'COMMISSION') {
    results = results.filter((d) =>
      ['TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'INSCRIT', 'REFUSE'].includes(d.statut)
    );
  }

  res.json(results);
});

app.get('/api/dossiers/:id', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json(dossier);
});

// ==========================================
// SERVICES OCR : CNI (Étape 1) & CARTE ÉTUDIANT (Étape 2)
// ==========================================

// Étape 1 : Scan CNI
app.post('/api/ocr/cni', (req: Request, res: Response) => {
  const { sampleId } = req.body;

  const cniSamples: Record<string, OcrResult> = {
    'sample-wissal': {
      cin: 'CD789012',
      nom: 'BENYAMINA',
      prenom: 'WISSAL',
      date_naissance: '2000-08-22',
      lieu_naissance: 'Fès',
      nationalite: 'Marocaine',
      score_confiance: 0.98,
      champs_detectes: [
        { champ: 'CIN', valeur: 'CD789012', confiance: 0.99, bbox: { x: 420, y: 70, width: 140, height: 40 } },
        { champ: 'NOM', valeur: 'BENYAMINA', confiance: 0.98, bbox: { x: 180, y: 120, width: 220, height: 35 } },
        { champ: 'PRENOM', valeur: 'WISSAL', confiance: 0.98, bbox: { x: 180, y: 165, width: 180, height: 35 } },
        { champ: 'DATE_NAISSANCE', valeur: '22/08/2000', confiance: 0.96, bbox: { x: 180, y: 210, width: 160, height: 30 } },
        { champ: 'LIEU_NAISSANCE', valeur: 'FES', confiance: 0.95, bbox: { x: 180, y: 250, width: 120, height: 30 } },
      ],
    },
    'sample-yassine': {
      cin: 'AB123456',
      nom: 'EL AMRANI',
      prenom: 'YASSINE',
      date_naissance: '1999-05-14',
      lieu_naissance: 'Rabat',
      nationalite: 'Marocaine',
      score_confiance: 0.96,
      champs_detectes: [
        { champ: 'CIN', valeur: 'AB123456', confiance: 0.98 },
        { champ: 'NOM', valeur: 'EL AMRANI', confiance: 0.97 },
        { champ: 'PRENOM', valeur: 'YASSINE', confiance: 0.96 },
        { champ: 'DATE_NAISSANCE', valeur: '14/05/1999', confiance: 0.94 },
        { champ: 'LIEU_NAISSANCE', valeur: 'Rabat', confiance: 0.93 },
      ],
    },
  };

  const detected = cniSamples[sampleId] || cniSamples['sample-wissal'];

  res.json({
    success: true,
    data: detected,
    message: 'Données de la CNI extraites avec succès par le moteur OCR.',
  });
});

// Étape 2 : Scan Carte Étudiant
app.post('/api/ocr/carte-etudiant', (req: Request, res: Response) => {
  const { sampleId } = req.body;

  const studentCardSamples: Record<string, StudentCardOcrResult> = {
    'sample-wissal': {
      nom: 'BENYAMINA',
      prenom: 'WISSAL',
      code_etudiant: 'N138094821',
      etablissement: 'Faculté des Sciences Dhar El Mehraz (FSDM - USMBA)',
      filiere: 'Master Recherche en Intelligence Artificielle et Systèmes Distribués',
      annee_universitaire: '2023 - 2024',
      score_confiance: 0.97,
      champs_detectes: [
        { champ: 'CODE_ETUDIANT', valeur: 'N138094821', confiance: 0.99 },
        { champ: 'NOM', valeur: 'BENYAMINA', confiance: 0.98 },
        { champ: 'PRENOM', valeur: 'WISSAL', confiance: 0.98 },
        { champ: 'ETABLISSEMENT', valeur: 'FSDM - Fès', confiance: 0.96 },
        { champ: 'FILIERE', valeur: 'Master IA & SD', confiance: 0.95 },
      ],
    },
    'sample-ensa': {
      nom: 'BENYAMINA',
      prenom: 'WISSAL',
      code_etudiant: '19004812',
      etablissement: 'École Nationale des Sciences Appliquées de Fès (ENSA - USMBA)',
      filiere: 'Filière Ingénieur Génie Informatique',
      annee_universitaire: '2023 - 2024',
      score_confiance: 0.96,
      champs_detectes: [
        { champ: 'CODE_ETUDIANT', valeur: '19004812', confiance: 0.98 },
        { champ: 'NOM', valeur: 'BENYAMINA', confiance: 0.97 },
        { champ: 'PRENOM', valeur: 'WISSAL', confiance: 0.97 },
        { champ: 'ETABLISSEMENT', valeur: 'ENSA Fès', confiance: 0.95 },
        { champ: 'FILIERE', valeur: 'Génie Informatique', confiance: 0.94 },
      ],
    },
  };

  const detected = studentCardSamples[sampleId] || studentCardSamples['sample-wissal'];

  res.json({
    success: true,
    data: detected,
    message: 'Données de la carte étudiant extraites avec succès par le moteur OCR.',
  });
});

// Validation explicite des données d'identité par le candidat
app.post('/api/dossiers/:id/validate-identity', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { cin, nom, prenom, date_naissance, lieu_naissance, code_etudiant, etablissement, filiere } = req.body;

  if (cin) dossier.candidat.cin = cin;
  if (date_naissance) dossier.candidat.date_naissance = date_naissance;
  if (lieu_naissance) dossier.candidat.lieu_naissance = lieu_naissance;
  if (code_etudiant) dossier.candidat.code_etudiant = code_etudiant;
  if (etablissement) dossier.candidat.etablissement_origine = etablissement;
  if (filiere) dossier.candidat.filiere_origine = filiere;

  dossier.candidat.cni_verifiee = true;
  dossier.candidat.carte_etudiant_verifiee = true;

  const ancienStatut = dossier.statut;
  dossier.statut = 'DOCUMENTS_DEPOSES';
  dossier.mis_a_jour_le = new Date().toISOString();

  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser ? currentUser.id : 'usr-cand-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Candidat',
    acteur_role: 'CANDIDAT',
    action_nom: 'Validation de l\'identité (CNI & Carte Étudiant)',
    ancien_statut: ancienStatut,
    nouveau_statut: 'DOCUMENTS_DEPOSES',
    commentaire: `Identité vérifiée par le candidat (CNI ${cin || dossier.candidat.cin}, Code étudiant ${code_etudiant || dossier.candidat.code_etudiant}).`,
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, dossier });
});

// Update dossier
app.put('/api/dossiers/:id', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  if (req.body.candidat) {
    Object.assign(dossier.candidat, req.body.candidat);
  }
  if (req.body.sujet_these !== undefined) dossier.sujet_these = req.body.sujet_these;
  if (req.body.resume_these !== undefined) dossier.resume_these = req.body.resume_these;
  if (req.body.specialite !== undefined) dossier.specialite = req.body.specialite;
  if (req.body.laboratoire_recherche !== undefined) dossier.laboratoire_recherche = req.body.laboratoire_recherche;

  if (req.body.encadrant_id !== undefined) {
    dossier.encadrant_id = req.body.encadrant_id;
    dossier.encadrant = USERS.find((u) => u.id === req.body.encadrant_id);
  }

  dossier.mis_a_jour_le = new Date().toISOString();
  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json(dossier);
});

// Gestion des documents
app.post('/api/dossiers/:id/documents', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { type_document, nom_fichier_origine, type_mime, taille_octets } = req.body;
  dossier.documents = dossier.documents.filter((d) => d.type_document !== type_document);

  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    dossier_id: dossier.id,
    type_document,
    nom_fichier_origine,
    chemin_fichier: `/uploads/${Date.now()}_${nom_fichier_origine}`,
    type_mime: type_mime || 'application/pdf',
    taille_octets: taille_octets || 1024 * 700,
    statut_controle: 'CONFORME',
    hash_sha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    cree_le: new Date().toISOString(),
  };

  dossier.documents.push(newDoc);
  dossier.mis_a_jour_le = new Date().toISOString();

  res.status(201).json(newDoc);
});

app.delete('/api/dossiers/:id/documents/:docId', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  dossier.documents = dossier.documents.filter((d) => d.id !== req.params.docId);
  dossier.mis_a_jour_le = new Date().toISOString();
  res.json({ success: true, count: dossier.documents.length });
});

// ==========================================
// SOUMISSION & CONTRÔLE AUTOMATIQUE DU DOSSIER
// ==========================================
app.post('/api/dossiers/:id/submit', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const timeText = formatFrenchTimestamp(new Date());
  dossier.date_soumission = new Date().toISOString();
  dossier.statut = 'TRANSMIS_COMMISSION';

  dossier.historique.push({
    id: `hist-${Date.now()}-submit`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-cand-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Candidat',
    acteur_role: 'CANDIDAT',
    action_nom: 'Soumission du dossier de candidature',
    ancien_statut: 'DOCUMENTS_DEPOSES',
    nouveau_statut: 'SOUMIS',
    commentaire: 'Dossier soumis pour contrôle automatique et étude de recevabilité.',
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  dossier.historique.push({
    id: `hist-${Date.now()}-ctrl-ok`,
    dossier_id: dossier.id,
    acteur_id: 'usr-sys',
    acteur_nom: 'Moteur de Contrôle Automatique',
    acteur_role: 'SYSTEME',
    action_nom: 'Contrôle automatique réussi',
    ancien_statut: 'SOUMIS',
    nouveau_statut: 'TRANSMIS_COMMISSION',
    commentaire: 'Audit documentaire 100% conforme. Dossier transmis à la Commission Doctorale.',
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  NOTIFICATIONS.push({
    id: `notif-${Date.now()}-cand`,
    utilisateur_id: dossier.candidat.utilisateur_id,
    titre: 'Votre dossier a été soumis avec succès',
    message: 'Le contrôle automatique a validé l\'ensemble de vos pièces. Votre dossier est transmis à la Commission Doctorale.',
    lue: false,
    horodatage_texte: timeText,
    action_etape_id: 3,
    cree_le: new Date().toISOString(),
    type: 'success',
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({
    success: true,
    conforme: true,
    dossier,
    message: 'Dossier vérifié et certifié conforme par le système.',
  });
});

// ==========================================
// RÔLE ENCADRANT : Validation ou Refus
// ==========================================
app.post('/api/dossiers/:id/encadrant-decision', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { decision, commentaire } = req.body;
  const timeText = formatFrenchTimestamp(new Date());

  if (decision === 'ACCEPTER') {
    dossier.statut = 'VALIDATION_ADMINISTRATIVE';
    dossier.historique.push({
      id: `hist-${Date.now()}`,
      dossier_id: dossier.id,
      acteur_id: currentUser?.id || 'usr-enc-1',
      acteur_nom: currentUser ? `Pr. ${currentUser.prenom} ${currentUser.nom}` : 'Pr. Karim Bennani',
      acteur_role: 'ENCADRANT',
      action_nom: 'Accord formel du Directeur de thèse',
      ancien_statut: dossier.statut,
      nouveau_statut: 'VALIDATION_ADMINISTRATIVE',
      commentaire: commentaire || 'Accord d\'encadrement accordé. Le sujet est validé pour le laboratoire.',
      horodatage_texte: timeText,
      cree_le: new Date().toISOString(),
    });

    NOTIFICATIONS.push({
      id: `notif-${Date.now()}`,
      utilisateur_id: dossier.candidat.utilisateur_id,
      titre: 'Accord du Directeur de thèse validé',
      message: `Pr. ${currentUser?.nom || 'Bennani'} a validé l'encadrement de votre thèse.`,
      lue: false,
      horodatage_texte: timeText,
      action_etape_id: 6,
      cree_le: new Date().toISOString(),
      type: 'success',
    });
  } else {
    dossier.statut = 'REFUSE';
    dossier.historique.push({
      id: `hist-${Date.now()}`,
      dossier_id: dossier.id,
      acteur_id: currentUser?.id || 'usr-enc-1',
      acteur_nom: currentUser ? `Pr. ${currentUser.prenom} ${currentUser.nom}` : 'Pr. Karim Bennani',
      acteur_role: 'ENCADRANT',
      action_nom: 'Refus d\'encadrement',
      ancien_statut: dossier.statut,
      nouveau_statut: 'REFUSE',
      commentaire: commentaire || 'Capacité d\'accueil maximale atteinte pour l\'année universitaire.',
      horodatage_texte: timeText,
      cree_le: new Date().toISOString(),
    });
  }

  dossier.mis_a_jour_le = new Date().toISOString();
  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, dossier });
});

// ==========================================
// RÔLE COMMISSION : Évaluation, Entretien & Délibération
// ==========================================
app.post('/api/dossiers/:id/evaluation', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { note_dossier, grille_criteres, commentaire } = req.body;
  const noteD = Number(note_dossier) || 18;

  let evalItem = dossier.evaluations.find((e) => e.membre_commission_id === currentUser?.id);
  if (!evalItem) {
    evalItem = {
      id: `eval-${Date.now()}`,
      dossier_id: dossier.id,
      membre_commission_id: currentUser?.id || 'usr-comm-1',
      membre_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pr. Fatima Alami',
      note_dossier: noteD,
      note_globale: noteD,
      grille_criteres: grille_criteres || {
        pertinence_sujet: 5,
        prerequis_academiques: 5,
        faisabilite_methodologie: 4,
        motivation_candidat: 4,
      },
      commentaire,
      cree_le: new Date().toISOString(),
      mis_a_jour_le: new Date().toISOString(),
    };
    dossier.evaluations.push(evalItem);
  }

  dossier.statut = 'EN_EVALUATION';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-comm-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pr. Fatima Alami',
    acteur_role: 'COMMISSION',
    action_nom: 'Attribution de la note d\'évaluation',
    ancien_statut: 'TRANSMIS_COMMISSION',
    nouveau_statut: 'EN_EVALUATION',
    commentaire: `Évaluation académique saisie par la Commission (Note dossier : ${noteD}/20).`,
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, evaluation: evalItem, dossier });
});

app.post('/api/dossiers/:id/schedule-interview', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { date_entretien, lieu_entretien } = req.body;
  dossier.statut = 'ENTRETIEN_PLANIFIE';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-comm-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pr. Fatima Alami',
    acteur_role: 'COMMISSION',
    action_nom: 'Convocation à l\'audition orale',
    ancien_statut: 'EN_EVALUATION',
    nouveau_statut: 'ENTRETIEN_PLANIFIE',
    commentaire: `Entretien oral programmé le ${new Date(date_entretien).toLocaleString('fr-FR')} (${lieu_entretien || 'Salle de réunion CEDoc'}).`,
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  NOTIFICATIONS.push({
    id: `notif-${Date.now()}`,
    utilisateur_id: dossier.candidat.utilisateur_id,
    titre: 'Convocation à l\'entretien doctoral',
    message: `Votre entretien d'admission est planifié pour le ${new Date(date_entretien).toLocaleString('fr-FR')}. Lieu : ${lieu_entretien || 'Salle de délibération'}.`,
    lue: false,
    horodatage_texte: timeText,
    action_etape_id: 5,
    cree_le: new Date().toISOString(),
    type: 'info',
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, dossier });
});

app.post('/api/dossiers/:id/deliberation', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const { resultat, moyenne_finale, classement, commentaire_deliberation } = req.body;
  const timeText = formatFrenchTimestamp(new Date());

  const decision: DecisionItem = {
    id: `dec-${Date.now()}`,
    dossier_id: dossier.id,
    resultat,
    moyenne_finale: Number(moyenne_finale) || 17.5,
    classement: classement ? Number(classement) : 1,
    commentaire_deliberation: commentaire_deliberation || 'Avis collégial très favorable après audition de la candidate.',
    date_deliberation: new Date().toISOString(),
    president_commission_id: currentUser?.id || 'usr-comm-1',
    president_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pr. Fatima Alami',
  };

  dossier.decision = decision;

  if (resultat === 'FAVORABLE') {
    dossier.statut = 'VALIDATION_ADMINISTRATIVE';
  } else {
    dossier.statut = 'REFUSE';
  }

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-comm-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pr. Fatima Alami',
    acteur_role: 'COMMISSION',
    action_nom: 'Délibération collégiale de la Commission',
    ancien_statut: 'ENTRETIEN_PLANIFIE',
    nouveau_statut: dossier.statut,
    commentaire: `Délibération de la Commission : Résultat ${resultat} (Moyenne finale : ${decision.moyenne_finale}/20).`,
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  NOTIFICATIONS.push({
    id: `notif-${Date.now()}`,
    utilisateur_id: dossier.candidat.utilisateur_id,
    titre: 'Une décision concernant votre candidature est disponible',
    message: `La Commission Doctorale a rendu son avis : Décision ${resultat} avec une moyenne de ${decision.moyenne_finale}/20.`,
    lue: false,
    horodatage_texte: timeText,
    action_etape_id: 7,
    cree_le: new Date().toISOString(),
    type: resultat === 'FAVORABLE' ? 'success' : 'danger',
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, decision, dossier });
});

// ==========================================
// RÔLE ADMINISTRATION : Validation, Charte & Inscription
// ==========================================
app.post('/api/dossiers/:id/admin-validate', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  dossier.statut = 'PUBLIE';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-admin-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'M. Mohammed Tazi',
    acteur_role: 'ADMINISTRATION',
    action_nom: 'Validation administrative et publication',
    ancien_statut: 'VALIDATION_ADMINISTRATIVE',
    nouveau_statut: 'PUBLIE',
    commentaire: 'Vérification des originaux certifiée. Résultats d\'admission publiés officiellement.',
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  NOTIFICATIONS.push({
    id: `notif-${Date.now()}`,
    utilisateur_id: dossier.candidat.utilisateur_id,
    titre: 'Résultats officiels publiés & Charte disponible',
    message: 'Vos diplômes originaux sont validés. Vous êtes invité(e) à signer la charte de thèse numérique.',
    lue: false,
    horodatage_texte: timeText,
    action_etape_id: 7,
    cree_le: new Date().toISOString(),
    type: 'success',
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, dossier });
});

app.post('/api/dossiers/:id/generate-charte', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  const charte: CharteTheseData = {
    dossier_id: dossier.id,
    numero_charte: `CH-USMBA-${dossier.numero_dossier}`,
    date_generation: new Date().toISOString(),
    titre_sujet: dossier.sujet_these,
    candidat_nom_complet: `${dossier.candidat.utilisateur.prenom} ${dossier.candidat.utilisateur.nom}`,
    candidat_cin: dossier.candidat.cin,
    encadrant_nom_complet: dossier.encadrant ? `${dossier.encadrant.prenom} ${dossier.encadrant.nom}` : 'Pr. Karim Bennani',
    laboratoire: dossier.laboratoire_recherche,
    etablissement: 'Centre des Études Doctorales (CEDoc) - Université Sidi Mohamed Ben Abdellah de Fès',
  };

  dossier.charte = charte;
  dossier.statut = 'CHARTE_DE_THESE';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-admin-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Pôle Doctoral',
    acteur_role: 'ADMINISTRATION',
    action_nom: 'Génération de la charte de thèse',
    ancien_statut: 'PUBLIE',
    nouveau_statut: 'CHARTE_DE_THESE',
    commentaire: 'Génération de la Charte de Thèse numérique USMBA pour signature électronique.',
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, charte, dossier });
});

app.post('/api/dossiers/:id/sign-charte', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  if (!dossier.charte) {
    return res.status(400).json({ error: 'Charte non générée' });
  }

  const { signerRole } = req.body;
  const role = signerRole || currentUser?.role || 'CANDIDAT';
  const certHash = 'SHA256:USMBA-' + Math.random().toString(36).substring(2).toUpperCase();

  if (role === 'CANDIDAT') {
    dossier.charte.signature_candidat = {
      date: new Date().toISOString(),
      nom: `${dossier.candidat.utilisateur.prenom} ${dossier.candidat.utilisateur.nom}`,
      valide: true,
      hash_certificat: certHash,
    };
  } else if (role === 'ENCADRANT') {
    dossier.charte.signature_encadrant = {
      date: new Date().toISOString(),
      nom: dossier.encadrant ? `${dossier.encadrant.prenom} ${dossier.encadrant.nom}` : 'Pr. Karim Bennani',
      valide: true,
      hash_certificat: certHash,
    };
  } else if (role === 'ADMINISTRATION') {
    dossier.charte.signature_directeur_pole = {
      date: new Date().toISOString(),
      nom: `${currentUser?.prenom || 'Mohammed'} ${currentUser?.nom || 'Tazi'} (Directeur CEDoc USMBA)`,
      valide: true,
      hash_certificat: certHash,
    };
  }

  dossier.statut = 'SIGNATURE';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-cand-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Wissal Benyamina',
    acteur_role: role,
    action_nom: 'Signature électronique de la charte de thèse',
    ancien_statut: 'CHARTE_DE_THESE',
    nouveau_statut: 'SIGNATURE',
    commentaire: `Signature numérique authentifiée avec certificat cryptographique (${certHash}).`,
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, charte: dossier.charte, dossier });
});

app.post('/api/dossiers/:id/finalize-inscription', (req: Request, res: Response) => {
  const dossier = DOSSIERS.find((d) => d.id === req.params.id);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable' });

  dossier.statut = 'INSCRIT';
  const timeText = formatFrenchTimestamp(new Date());

  dossier.documents.push({
    id: `doc-attest-${Date.now()}`,
    dossier_id: dossier.id,
    type_document: 'ATTESTATION_INSCRIPTION',
    nom_fichier_origine: `Attestation_Inscription_Doctorale_${dossier.numero_dossier}.pdf`,
    chemin_fichier: `/certificates/attestation_${dossier.numero_dossier}.pdf`,
    type_mime: 'application/pdf',
    taille_octets: 1024 * 350,
    statut_controle: 'CONFORME',
    hash_sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    cree_le: new Date().toISOString(),
  });

  dossier.historique.push({
    id: `hist-${Date.now()}`,
    dossier_id: dossier.id,
    acteur_id: currentUser?.id || 'usr-admin-1',
    acteur_nom: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'M. Mohammed Tazi',
    acteur_role: 'ADMINISTRATION',
    action_nom: 'Inscription définitive au cycle doctoral',
    ancien_statut: 'SIGNATURE',
    nouveau_statut: 'INSCRIT',
    commentaire: 'Inscription définitive validée. Matricule doctoral officiel attribué.',
    horodatage_texte: timeText,
    cree_le: new Date().toISOString(),
  });

  NOTIFICATIONS.push({
    id: `notif-${Date.now()}`,
    utilisateur_id: dossier.candidat.utilisateur_id,
    titre: 'Félicitations ! Inscription doctorale définitive confirmée',
    message: 'Vous êtes officiellement inscrit(e) au cycle doctoral de l\'USMBA. Votre attestation avec QR code est disponible.',
    lue: false,
    horodatage_texte: timeText,
    action_etape_id: 8,
    cree_le: new Date().toISOString(),
    type: 'success',
  });

  const p = computeAdmissionPath(dossier);
  dossier.etapes_parcours = p.etapes;
  dossier.progression_pourcentage = p.progression;

  res.json({ success: true, dossier });
});

// Réinitialiser les données de démo
app.post('/api/demo/reset', (req: Request, res: Response) => {
  initSeedData();
  currentUser = USERS[0]; // Reset to Candidat Wissal Benyamina
  res.json({ success: true, message: 'Données de démonstration réinitialisées avec succès.' });
});

// Export CSV
app.get('/api/admin/export', (req: Request, res: Response) => {
  const header = 'Numero_Dossier,Nom,Prenom,CIN,Code_Etudiant,Statut,Encadrant,Specialite,Progression_Pct\n';
  const rows = DOSSIERS.map((d) =>
    [
      d.numero_dossier,
      `"${d.candidat.utilisateur.nom}"`,
      `"${d.candidat.utilisateur.prenom}"`,
      d.candidat.cin,
      d.candidat.code_etudiant || 'N/A',
      d.statut,
      `"${d.encadrant?.nom || 'N/A'}"`,
      `"${d.specialite}"`,
      `${d.progression_pourcentage}%`,
    ].join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=inscriptions_doctorat_usmba_2026.csv');
  res.send(header + rows);
});

// ==========================================
// Vite Integration pour Dev Server
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portail Doctoral USMBA démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
