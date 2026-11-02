import {
  Utilisateur,
  DossierComplet,
  NotificationItem,
  OcrResult,
  StudentCardOcrResult,
  DocumentItem,
  AnomalieItem,
  StatutDossier,
  ResultatDecision,
  RoleUtilisateur,
} from '../types/index.ts';

export async function fetchCurrentUser(): Promise<{ authenticated: boolean; user: Utilisateur | null; candidat: any }> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    return { authenticated: false, user: null, candidat: null };
  }
  return res.json();
}

export async function loginWithGoogle(
  email: string,
  name?: string,
  avatar?: string
): Promise<{ success: boolean; user: Utilisateur; redirectUrl: string; message: string }> {
  const res = await fetch('/api/auth/google-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, avatar }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Erreur lors de la connexion Google');
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function switchDemoAccount(role: RoleUtilisateur): Promise<{ success: boolean; user: Utilisateur }> {
  const res = await fetch('/api/auth/switch-demo-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Impossible de changer de compte institutionnel');
  return res.json();
}

export async function fetchAllUsers(role?: string): Promise<Utilisateur[]> {
  const url = role ? `/api/users?role=${role}` : '/api/users';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur chargement utilisateurs');
  return res.json();
}

export async function fetchDossiers(params?: { statut?: string; search?: string }): Promise<DossierComplet[]> {
  const query = new URLSearchParams();
  if (params?.statut) query.append('statut', params.statut);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`/api/dossiers?${query.toString()}`);
  if (!res.ok) throw new Error('Erreur chargement des dossiers');
  return res.json();
}

export async function fetchDossierById(id: string): Promise<DossierComplet> {
  const res = await fetch(`/api/dossiers/${id}`);
  if (!res.ok) throw new Error('Dossier introuvable');
  return res.json();
}

export async function updateDossier(id: string, data: any): Promise<DossierComplet> {
  const res = await fetch(`/api/dossiers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur mise à jour dossier');
  return res.json();
}

// OCR CNI
export async function scanCni(sampleId?: string): Promise<{ success: boolean; data: OcrResult }> {
  const res = await fetch('/api/ocr/cni', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sampleId }),
  });
  if (!res.ok) throw new Error('Erreur scan CNI');
  return res.json();
}

// OCR Carte Étudiant
export async function scanStudentCard(sampleId?: string): Promise<{ success: boolean; data: StudentCardOcrResult }> {
  const res = await fetch('/api/ocr/carte-etudiant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sampleId }),
  });
  if (!res.ok) throw new Error('Erreur scan carte étudiant');
  return res.json();
}

// Validation d'identité explicite
export async function validateIdentity(dossierId: string, data: any): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/validate-identity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erreur validation identité');
  return res.json();
}

export async function uploadDocument(
  dossierId: string,
  doc: { type_document: string; nom_fichier_origine: string; type_mime?: string; taille_octets?: number }
): Promise<DocumentItem> {
  const res = await fetch(`/api/dossiers/${dossierId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error('Erreur téléversement document');
  return res.json();
}

export async function deleteDocument(dossierId: string, docId: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/documents/${docId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur suppression document');
  return res.json();
}

export async function submitDossierForCheck(dossierId: string, ocrData?: Partial<OcrResult>): Promise<{
  success: boolean;
  conforme: boolean;
  dossier: DossierComplet;
  message: string;
}> {
  const res = await fetch(`/api/dossiers/${dossierId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ocrData }),
  });
  if (!res.ok) throw new Error('Erreur soumission dossier');
  return res.json();
}

export async function resolveAnomaly(dossierId: string, anomalyId: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/resolve-anomaly/${anomalyId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur résolution anomalie');
  return res.json();
}

export async function encadrantDecision(dossierId: string, decision: 'ACCEPTER' | 'REFUSER', commentaire: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/encadrant-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, commentaire }),
  });
  if (!res.ok) throw new Error('Erreur décision directeur');
  return res.json();
}

export async function saveEvaluation(dossierId: string, evalData: any): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/evaluation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evalData),
  });
  if (!res.ok) throw new Error('Erreur enregistrement évaluation');
  return res.json();
}

export async function scheduleInterview(dossierId: string, date: string, lieu: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/schedule-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date_entretien: date, lieu_entretien: lieu }),
  });
  if (!res.ok) throw new Error('Erreur planification audition');
  return res.json();
}

export async function commissionDeliberation(dossierId: string, deliberationData: {
  resultat: ResultatDecision;
  moyenne_finale: number;
  classement?: number;
  commentaire_deliberation: string;
}): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/deliberation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deliberationData),
  });
  if (!res.ok) throw new Error('Erreur enregistrement délibération');
  return res.json();
}

export async function adminValidateDossier(dossierId: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/admin-validate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur validation administrative');
  return res.json();
}

export async function generateCharte(dossierId: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/generate-charte`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur génération charte');
  return res.json();
}

export async function signCharte(dossierId: string, signerRole?: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/sign-charte`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signerRole }),
  });
  if (!res.ok) throw new Error('Erreur signature charte');
  return res.json();
}

export async function finalizeInscription(dossierId: string): Promise<any> {
  const res = await fetch(`/api/dossiers/${dossierId}/finalize-inscription`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Erreur finalisation inscription');
  return res.json();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch('/api/notifications');
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
}

export async function resetDemoData(): Promise<void> {
  await fetch('/api/demo/reset', { method: 'POST' });
}
