/**
 * Types & Schémas pour l'application Portail Doctoral - USMBA
 */

export type RoleUtilisateur =
  | 'CANDIDAT'
  | 'ENCADRANT'
  | 'COMMISSION'
  | 'ADMINISTRATION'
  | 'SYSTEME';

export type StatutDossier =
  | 'BROUILLON'
  | 'CARTE_SCANNEE'
  | 'PREREMPLI'
  | 'EN_COMPLETION'
  | 'DOCUMENTS_DEPOSES'
  | 'SOUMIS'
  | 'CONTROLE_AUTOMATIQUE'
  | 'ANOMALIES_SIGNALEES'
  | 'ACCORD_ENCADRANT_REQUIS'
  | 'TRANSMIS_COMMISSION'
  | 'EN_EVALUATION'
  | 'ENTRETIEN_PLANIFIE'
  | 'DELIBERATION'
  | 'REFUSE'
  | 'VALIDATION_ADMINISTRATIVE'
  | 'PUBLIE'
  | 'CHARTE_DE_THESE'
  | 'SIGNATURE'
  | 'INSCRIT';

export type StatutEtapeAdmission =
  | 'TERMINE'
  | 'EN_COURS'
  | 'EN_ATTENTE'
  | 'A_VENIR'
  | 'REFUSE';

export interface EtapeAdmission {
  id: number;
  titre: string;
  description: string;
  statut: StatutEtapeAdmission;
  horodatage?: string;
  date_iso?: string;
  acteur?: string;
  role_acteur?: RoleUtilisateur;
  commentaire?: string;
  message_attente?: string;
  disponible: boolean;
}

export type TypeDocument =
  | 'CIN_RECTO'
  | 'CIN_VERSO'
  | 'CARTE_ETUDIANT'
  | 'DIPLOME_MASTER'
  | 'RELEVES_NOTES_MASTER'
  | 'DIPLOME_LICENCE'
  | 'CURRICULUM_VITAE'
  | 'PROJET_THESE'
  | 'CHARTE_SIGNEE'
  | 'ATTESTATION_INSCRIPTION';

export type StatutControleDoc =
  | 'EN_ATTENTE'
  | 'CONFORME'
  | 'NON_CONFORME'
  | 'CORROMPU_OU_ILLISIBLE';

export type TypeAnomalie =
  | 'CHAMP_MANQUANT'
  | 'INCOHERENCE_DONNEES'
  | 'DOCUMENT_MANQUANT'
  | 'DOCUMENT_INVALIDE'
  | 'DOUBLON_DETECTE'
  | 'DELAI_DEPASSE';

export type ResultatDecision =
  | 'FAVORABLE'
  | 'DEFAVORABLE'
  | 'LISTE_ATTENTE';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  avatar?: string;
  laboratoire?: string;
  specialite?: string;
  grade?: string;
}

export interface Candidat {
  id: string;
  utilisateur_id: string;
  cin: string;
  code_etudiant?: string; // CNE / Code Massar
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  adresse: string;
  telephone: string;
  dernier_diplome_obtenu: string;
  etablissement_origine: string;
  filiere_origine?: string;
  annee_obtention_master: number;
  mention_master: string;
  moyenne_master?: number;
  cni_verifiee?: boolean;
  carte_etudiant_verifiee?: boolean;
}

export interface DocumentItem {
  id: string;
  dossier_id: string;
  type_document: TypeDocument;
  nom_fichier_origine: string;
  chemin_fichier: string;
  type_mime: string;
  taille_octets: number;
  statut_controle: StatutControleDoc;
  hash_sha256: string;
  cree_le: string;
}

export interface AnomalieItem {
  id: string;
  dossier_id: string;
  document_id?: string;
  type: TypeAnomalie;
  champ_ou_document: string;
  message: string;
  valeur_extraite?: string;
  valeur_attendue?: string;
  resolue: boolean;
  resolue_le?: string;
  cree_le: string;
}

export interface ControleAutomatique {
  id: string;
  dossier_id: string;
  date_execution: string;
  est_conforme: boolean;
  score_completude: number;
  details_rapport: {
    regles_evaluees: number;
    regles_validees: number;
    regles_en_echec: number;
    details: {
      regle: string;
      statut: 'VALIDE' | 'ECHEC' | 'AVERTISSEMENT';
      description: string;
    }[];
  };
  version_regles: string;
}

export interface EvaluationItem {
  id: string;
  dossier_id: string;
  membre_commission_id: string;
  membre_nom?: string;
  note_dossier: number; // 0-20
  note_entretien?: number; // 0-20
  note_globale: number; // 0-20
  date_entretien?: string;
  lieu_entretien?: string;
  commentaire?: string;
  grille_criteres: {
    pertinence_sujet: number; // /5
    prerequis_academiques: number; // /5
    faisabilite_methodologie: number; // /5
    motivation_candidat: number; // /5
  };
  cree_le: string;
  mis_a_jour_le: string;
}

export interface DecisionItem {
  id: string;
  dossier_id: string;
  resultat: ResultatDecision;
  moyenne_finale: number;
  classement?: number;
  commentaire_deliberation: string;
  date_deliberation: string;
  president_commission_id: string;
  president_nom?: string;
}

export interface HistoriqueItem {
  id: string;
  dossier_id: string;
  acteur_id: string;
  acteur_nom: string;
  acteur_role: RoleUtilisateur;
  action_nom?: string;
  ancien_statut: StatutDossier;
  nouveau_statut: StatutDossier;
  commentaire?: string;
  horodatage_texte?: string; // e.g. "02/11/2026 à 10:35"
  cree_le: string;
}

export interface NotificationItem {
  id: string;
  utilisateur_id: string;
  titre: string;
  message: string;
  lue: boolean;
  lien_action?: string;
  action_etape_id?: number;
  horodatage_texte?: string;
  cree_le: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

export interface CharteTheseData {
  dossier_id: string;
  numero_charte: string;
  date_generation: string;
  titre_sujet: string;
  candidat_nom_complet: string;
  candidat_cin: string;
  encadrant_nom_complet: string;
  laboratoire: string;
  etablissement: string;
  signature_candidat?: {
    date: string;
    nom: string;
    valide: boolean;
    hash_certificat: string;
  };
  signature_encadrant?: {
    date: string;
    nom: string;
    valide: boolean;
    hash_certificat: string;
  };
  signature_directeur_pole?: {
    date: string;
    nom: string;
    valide: boolean;
    hash_certificat: string;
  };
}

export interface DossierComplet {
  id: string;
  numero_dossier: string;
  candidat_id: string;
  candidat: Candidat & { utilisateur: Utilisateur };
  encadrant_id?: string;
  encadrant?: Utilisateur;
  laboratoire_recherche: string;
  specialite: string;
  sujet_these: string;
  resume_these: string;
  statut: StatutDossier;
  progression_pourcentage: number; // e.g. 62%
  etapes_parcours: EtapeAdmission[];
  date_soumission?: string;
  cree_le: string;
  mis_a_jour_le: string;
  documents: DocumentItem[];
  anomalies: AnomalieItem[];
  controles: ControleAutomatique[];
  evaluations: EvaluationItem[];
  decision?: DecisionItem;
  charte?: CharteTheseData;
  historique: HistoriqueItem[];
}

export interface OcrResult {
  cin: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  score_confiance: number;
  champs_detectes: {
    champ: string;
    valeur: string;
    confiance: number;
    bbox?: { x: number; y: number; width: number; height: number };
  }[];
}

export interface StudentCardOcrResult {
  nom: string;
  prenom: string;
  code_etudiant: string; // CNE / Massar
  etablissement: string;
  filiere: string;
  annee_universitaire: string;
  score_confiance: number;
  champs_detectes: {
    champ: string;
    valeur: string;
    confiance: number;
  }[];
}
