import React, { useState, useEffect } from 'react';
import {
  Utilisateur,
  RoleUtilisateur,
  DossierComplet,
  NotificationItem,
  OcrResult,
} from './types/index.ts';
import {
  fetchCurrentUser,
  logoutUser,
  switchDemoAccount,
  fetchAllUsers,
  fetchDossiers,
  fetchNotifications,
  markNotificationRead,
  resetDemoData,
  updateDossier,
  uploadDocument,
  deleteDocument,
  submitDossierForCheck,
  resolveAnomaly,
  encadrantDecision,
  saveEvaluation,
  scheduleInterview,
  commissionDeliberation,
  adminValidateDossier,
  generateCharte,
  signCharte,
  finalizeInscription,
} from './api/client.ts';
import { LoginGoogleView } from './components/LoginGoogleView.tsx';
import { RoleSwitcher } from './components/RoleSwitcher.tsx';
import { CandidateWizard } from './components/CandidateWizard.tsx';
import { SupervisorView } from './components/SupervisorView.tsx';
import { CommissionView } from './components/CommissionView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { SystemView } from './components/SystemView.tsx';
import { WorkflowModal } from './components/WorkflowModal.tsx';
import { AuditLogModal } from './components/AuditLogModal.tsx';
import { CharteTheseModal } from './components/CharteTheseModal.tsx';
import { AttestationModal } from './components/AttestationModal.tsx';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [dossiers, setDossiers] = useState<DossierComplet[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supervisors, setSupervisors] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [auditModalDossier, setAuditModalDossier] = useState<DossierComplet | null>(null);
  const [charteModalDossier, setCharteModalDossier] = useState<DossierComplet | null>(null);
  const [attestationModalDossier, setAttestationModalDossier] = useState<DossierComplet | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const authData = await fetchCurrentUser();
      if (authData.authenticated && authData.user) {
        setCurrentUser(authData.user);
        const [dossiersData, notifsData, profsData] = await Promise.all([
          fetchDossiers(),
          fetchNotifications(),
          fetchAllUsers('ENCADRANT'),
        ]);
        setDossiers(dossiersData);
        setNotifications(notifsData);
        setSupervisors(profsData);
      } else {
        setCurrentUser(null);
      }
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erreur lors de la communication avec le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleRoleSwitch = async (role: RoleUtilisateur) => {
    setLoading(true);
    try {
      const res = await switchDemoAccount(role);
      setCurrentUser(res.user);
      const [dossiersData, notifsData] = await Promise.all([
        fetchDossiers(),
        fetchNotifications(),
      ]);
      setDossiers(dossiersData);
      setNotifications(notifsData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await resetDemoData();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
    );
  };

  // Candidate Actions
  const handleUpdateDossier = async (data: any) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    const updated = await updateDossier(currentDossier.id, data);
    setDossiers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleApplyOcr = async (ocrData: OcrResult) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    const res = await fetch(`/api/dossiers/${currentDossier.id}/apply-ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ocrResult: ocrData }),
    });
    const updated = await res.json();
    setDossiers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleUploadDoc = async (doc: any) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    await uploadDocument(currentDossier.id, doc);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleDeleteDoc = async (docId: string) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    await deleteDocument(currentDossier.id, docId);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleSubmitCheck = async (ocrData?: Partial<OcrResult>) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    const res = await submitDossierForCheck(currentDossier.id, ocrData);
    setDossiers((prev) => prev.map((d) => (d.id === res.dossier.id ? res.dossier : d)));
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    const currentDossier = dossiers[0];
    if (!currentDossier) return;
    await fetch(`/api/dossiers/${currentDossier.id}/resolve-anomaly/${anomalyId}`, { method: 'POST' });
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleRefreshDossier = async () => {
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  // Supervisor Actions
  const handleEncadrantDecision = async (dossierId: string, decision: 'ACCEPTER' | 'REFUSER', commentaire: string) => {
    await encadrantDecision(dossierId, decision, commentaire);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  // Commission Actions
  const handleSaveEvaluation = async (dossierId: string, evalData: any) => {
    await saveEvaluation(dossierId, evalData);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleScheduleInterview = async (dossierId: string, date: string, lieu: string) => {
    await scheduleInterview(dossierId, date, lieu);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  const handleDeliberation = async (dossierId: string, deliberationData: any) => {
    await commissionDeliberation(dossierId, deliberationData);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  // Admin Actions
  const handleAdminValidate = async (dossierId: string) => {
    await adminValidateDossier(dossierId);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  const handleGenerateCharte = async (dossierId: string) => {
    await generateCharte(dossierId);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleSignCharte = async (signerRole: string) => {
    if (!charteModalDossier) return;
    const res = await signCharte(charteModalDossier.id, signerRole);
    setCharteModalDossier(res.dossier);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
  };

  const handleFinalizeInscription = async (dossierId: string) => {
    await finalizeInscription(dossierId);
    const refreshed = await fetchDossiers();
    setDossiers(refreshed);
    const notifs = await fetchNotifications();
    setNotifications(notifs);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-700">
          Chargement du Portail Doctoral USMBA...
        </span>
      </div>
    );
  }

  // If not logged in -> Pure Google OAuth Login View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between">
        <header className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Portail Doctoral • Université Sidi Mohamed Ben Abdellah (USMBA)</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">Connexion Google Obligatoire (@usmba.ac.ma)</span>
        </header>

        <LoginGoogleView
          onLoginSuccess={async (user) => {
            setCurrentUser(user);
            setLoading(true);
            try {
              const [dossiersData, notifsData, profsData] = await Promise.all([
                fetchDossiers(),
                fetchNotifications(),
                fetchAllUsers('ENCADRANT'),
              ]);
              setDossiers(dossiersData);
              setNotifications(notifsData);
              setSupervisors(profsData);
            } finally {
              setLoading(false);
            }
          }}
        />

        <footer className="p-4 text-center text-xs text-slate-400 bg-white border-t border-slate-200">
          Centre des Études Doctorales • Université Sidi Mohamed Ben Abdellah de Fès © 2026
        </footer>
      </div>
    );
  }

  const candidateCurrentDossier = dossiers[0] || null;

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Universal Role Switcher & Header */}
      <RoleSwitcher
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onResetDemo={handleResetDemo}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotifRead}
        onOpenWorkflowModal={() => setWorkflowModalOpen(true)}
      />

      {/* Global Error Banner if any */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main View Area based on current user role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'CANDIDAT' && candidateCurrentDossier && (
          <CandidateWizard
            dossier={candidateCurrentDossier}
            allSupervisors={supervisors}
            notifications={notifications}
            onUpdateDossier={handleUpdateDossier}
            onApplyOcr={handleApplyOcr}
            onUploadDoc={handleUploadDoc}
            onDeleteDoc={handleDeleteDoc}
            onSubmitCheck={handleSubmitCheck}
            onResolveAnomaly={handleResolveAnomaly}
            onOpenAuditModal={() => setAuditModalDossier(candidateCurrentDossier)}
            onOpenCharteModal={() => setCharteModalDossier(candidateCurrentDossier)}
            onOpenAttestationModal={() => setAttestationModalDossier(candidateCurrentDossier)}
            onRefreshDossier={handleRefreshDossier}
          />
        )}

        {currentUser.role === 'ENCADRANT' && (
          <SupervisorView
            dossiers={dossiers}
            currentUser={currentUser}
            onDecision={handleEncadrantDecision}
            onOpenAuditModal={(d) => setAuditModalDossier(d)}
            onOpenCharteModal={(d) => setCharteModalDossier(d)}
          />
        )}

        {currentUser.role === 'COMMISSION' && (
          <CommissionView
            dossiers={dossiers}
            currentUser={currentUser}
            onSaveEvaluation={handleSaveEvaluation}
            onScheduleInterview={handleScheduleInterview}
            onDeliberation={handleDeliberation}
            onOpenAuditModal={(d) => setAuditModalDossier(d)}
          />
        )}

        {currentUser.role === 'ADMINISTRATION' && (
          <AdminView
            dossiers={dossiers}
            currentUser={currentUser}
            onAdminValidate={handleAdminValidate}
            onGenerateCharte={handleGenerateCharte}
            onFinalizeInscription={handleFinalizeInscription}
            onOpenAuditModal={(d) => setAuditModalDossier(d)}
            onOpenCharteModal={(d) => setCharteModalDossier(d)}
            onOpenAttestationModal={(d) => setAttestationModalDossier(d)}
          />
        )}

        {currentUser.role === 'SYSTEME' && (
          <SystemView
            dossiers={dossiers}
            onOpenAuditModal={(d) => setAuditModalDossier(d)}
          />
        )}
      </main>

      {/* Modals */}
      <WorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        currentStatut={candidateCurrentDossier?.statut}
      />

      <AuditLogModal
        isOpen={!!auditModalDossier}
        onClose={() => setAuditModalDossier(null)}
        dossier={auditModalDossier}
      />

      <CharteTheseModal
        isOpen={!!charteModalDossier}
        onClose={() => setCharteModalDossier(null)}
        dossier={charteModalDossier}
        currentUserRole={currentUser.role}
        onSign={handleSignCharte}
      />

      <AttestationModal
        isOpen={!!attestationModalDossier}
        onClose={() => setAttestationModalDossier(null)}
        dossier={attestationModalDossier}
      />

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Portail Doctoral Numérique USMBA</span>
            <span>•</span>
            <span>Centre des Études Doctorales (CEDoc)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Université Sidi Mohamed Ben Abdellah de Fès (FSDM, ENSA, FST, FP, FLSH)
          </div>
        </div>
      </footer>
    </div>
  );
}
