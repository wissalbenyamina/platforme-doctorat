import React, { useState } from 'react';
import {
  DossierComplet,
  Utilisateur,
  OcrResult,
  TypeDocument,
  NotificationItem,
} from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { AdmissionTimeline } from './AdmissionTimeline.tsx';
import { CandidateRegistrationPage } from './CandidateRegistrationPage.tsx';
import {
  Scan,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trash2,
  CheckCircle2,
  History,
  Scroll,
  Send,
  Calendar,
  LayoutDashboard,
  Bell,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  dossier: DossierComplet;
  allSupervisors: Utilisateur[];
  notifications: NotificationItem[];
  onUpdateDossier: (data: any) => Promise<void>;
  onApplyOcr: (ocrData: OcrResult) => Promise<void>;
  onUploadDoc: (doc: { type_document: string; nom_fichier_origine: string; type_mime?: string; taille_octets?: number }) => Promise<void>;
  onDeleteDoc: (docId: string) => Promise<void>;
  onSubmitCheck: (ocrData?: Partial<OcrResult>) => Promise<void>;
  onResolveAnomaly: (anomalyId: string) => Promise<void>;
  onOpenAuditModal: () => void;
  onOpenCharteModal: () => void;
  onOpenAttestationModal: () => void;
  onRefreshDossier: () => Promise<void>;
}

export const CandidateWizard: React.FC<Props> = ({
  dossier,
  allSupervisors,
  notifications,
  onUpdateDossier,
  onApplyOcr,
  onUploadDoc,
  onDeleteDoc,
  onSubmitCheck,
  onResolveAnomaly,
  onOpenAuditModal,
  onOpenCharteModal,
  onOpenAttestationModal,
  onRefreshDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INSCRIPTION_SCAN' | 'PROJET' | 'DOCUMENTS' | 'CONTROLE'>('DASHBOARD');
  const [submitting, setSubmitting] = useState(false);

  // Thesis details state
  const [sujetThese, setSujetThese] = useState(dossier.sujet_these || '');
  const [resumeThese, setResumeThese] = useState(dossier.resume_these || '');
  const [specialite, setSpecialite] = useState(dossier.specialite || 'Intelligence Artificielle & Vision');
  const [encadrantId, setEncadrantId] = useState(dossier.encadrant_id || (allSupervisors[0]?.id || ''));
  const [savingForm, setSavingForm] = useState(false);

  const handleSaveAcademicInfo = async () => {
    setSavingForm(true);
    try {
      await onUpdateDossier({
        sujet_these: sujetThese,
        resume_these: resumeThese,
        specialite,
        encadrant_id: encadrantId,
      });
      setActiveTab('DOCUMENTS');
    } finally {
      setSavingForm(false);
    }
  };

  const handleFileUploadSim = async (typeDoc: TypeDocument, defaultName: string) => {
    await onUploadDoc({
      type_document: typeDoc,
      nom_fichier_origine: defaultName,
      type_mime: typeDoc.includes('CIN') || typeDoc.includes('CARTE') ? 'image/jpeg' : 'application/pdf',
      taille_octets: 1024 * 850,
    });
  };

  const handleSubmitDossier = async () => {
    setSubmitting(true);
    try {
      await onSubmitCheck({ cin: dossier.candidat.cin, date_naissance: dossier.candidat.date_naissance });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      await onRefreshDossier();
    } finally {
      setSubmitting(false);
    }
  };

  const mandatoryDocList: { type: TypeDocument; title: string; desc: string; sample: string }[] = [
    {
      type: 'CIN_RECTO',
      title: 'Carte Nationale d\'Identité (CNI) - Recto',
      desc: 'Copie couleur vérifiée par OCR (JPEG/PNG/PDF, max 5 Mo)',
      sample: `CNI_${dossier.candidat.cin || 'Recto'}.jpg`,
    },
    {
      type: 'CARTE_ETUDIANT',
      title: 'Carte Étudiant USMBA ou Attestation d\'inscription',
      desc: 'Pièce justificative de l\'étudiant avec CNE / Code Massar',
      sample: `Carte_Etudiant_USMBA_${dossier.candidat.code_etudiant || '2024'}.jpg`,
    },
    {
      type: 'DIPLOME_MASTER',
      title: 'Diplôme de Master ou Attestation de réussite',
      desc: 'Diplôme national de Master ou équivalence reconnue (PDF, max 10 Mo)',
      sample: 'Attestation_Diplome_Master_FSDM.pdf',
    },
    {
      type: 'RELEVES_NOTES_MASTER',
      title: 'Relevés de notes officiels du Master (S1 à S4)',
      desc: 'Relevés authentifiés avec cachet de l\'établissement d\'origine (PDF, max 10 Mo)',
      sample: 'Releves_Notes_Master_S1_S4.pdf',
    },
    {
      type: 'PROJET_THESE',
      title: 'Projet de thèse détaillé',
      desc: 'Descriptif de la problématique, état de l\'art et méthodologie (PDF)',
      sample: 'Projet_Recherche_Doctorale_IA.pdf',
    },
    {
      type: 'CURRICULUM_VITAE',
      title: 'Curriculum Vitae académique (CV)',
      desc: 'Parcours académique et compétences (PDF, max 5 Mo)',
      sample: 'CV_Academique_Doctorat.pdf',
    },
  ];

  const handleNavigateFromTimeline = (etapeId: number) => {
    if (etapeId === 1) setActiveTab('INSCRIPTION_SCAN');
    else if (etapeId === 2) setActiveTab('DOCUMENTS');
    else if (etapeId === 3) setActiveTab('CONTROLE');
    else if (etapeId === 4 || etapeId === 5 || etapeId === 6) setActiveTab('DASHBOARD');
    else if (etapeId === 7) onOpenCharteModal();
    else if (etapeId === 8) onOpenAttestationModal();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Profile Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-blue-50">
              {dossier.candidat.utilisateur.prenom[0]}
              {dossier.candidat.utilisateur.nom[0]}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {dossier.candidat.utilisateur.prenom} {dossier.candidat.utilisateur.nom}
                </h1>
                <StatusBadge statut={dossier.statut} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono mt-1">
                <span>Dossier : <strong className="text-blue-600">{dossier.numero_dossier}</strong></span>
                <span>•</span>
                <span>CNI : <strong className="text-slate-800">{dossier.candidat.cin}</strong></span>
                {dossier.candidat.code_etudiant && (
                  <>
                    <span>•</span>
                    <span>Code Étudiant : <strong className="text-slate-800">{dossier.candidat.code_etudiant}</strong></span>
                  </>
                )}
                <span>•</span>
                <span>USMBA - CEDoc</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAuditModal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Historique & Horodatage</span>
            </button>

            {['CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(dossier.statut) && (
              <button
                onClick={onOpenCharteModal}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Scroll className="w-4 h-4" />
                <span>Charte de Thèse</span>
              </button>
            )}

            {dossier.statut === 'INSCRIT' && (
              <button
                onClick={onOpenAttestationModal}
                className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition shadow-md cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Attestation Officielle</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar Bar in Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Progression de votre admission : <span className="font-mono text-blue-600 text-sm font-black">{dossier.progression_pourcentage} %</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Inscription → Dépôt → Vérification → Commission → Directeur → Admission
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${dossier.progression_pourcentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold pb-1">
        {[
          { key: 'DASHBOARD', label: 'Tableau de bord & Parcours (8 Étapes)', icon: LayoutDashboard },
          { key: 'INSCRIPTION_SCAN', label: 'Inscription (Scan CNI & Carte Étudiant)', icon: Scan },
          { key: 'PROJET', label: 'Projet de thèse & Encadrant', icon: GraduationCap },
          { key: 'DOCUMENTS', label: 'Dépôt des Pièces', icon: UploadCloud },
          { key: 'CONTROLE', label: 'Contrôle Automatique', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1 : DASHBOARD DU CANDIDAT (Timeline 8 étapes + Horodatage + Activités) */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Timeline d'admission en 8 étapes */}
          <AdmissionTimeline
            etapes={dossier.etapes_parcours}
            progression={dossier.progression_pourcentage}
            onNavigateToStep={handleNavigateFromTimeline}
          />

          {/* Grid: Notifications Récentes & Prochaines Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications récentes avec horodatage */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Notifications & Messages Récent(s) ({notifications.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Aucune notification.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-semibold">{notif.titre}</strong>
                        {notif.horodatage_texte && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notif.horodatage_texte}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                      {notif.action_etape_id && (
                        <button
                          onClick={() => handleNavigateFromTimeline(notif.action_etape_id!)}
                          className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1 pt-0.5 cursor-pointer"
                        >
                          <span>Voir l'étape concernée</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prochaines Actions & Résumé du Sujet */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Sujet de Thèse & Encadrement
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-2">
                <div>
                  <span className="text-slate-400 text-[11px] block">Intitulé du Sujet :</span>
                  <strong className="text-slate-900 text-xs leading-snug">« {dossier.sujet_these} »</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Directeur de Thèse :</span>
                  <span className="text-slate-800 font-bold">
                    {dossier.encadrant ? `Pr. ${dossier.encadrant.prenom} ${dossier.encadrant.nom}` : 'Pr. Karim Bennani'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Laboratoire d'accueil :</span>
                  <span className="text-slate-700">{dossier.laboratoire_recherche}</span>
                </div>
              </div>

              {/* Action card depending on state */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Prochaine action recommandée :</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Votre dossier est actuellement soumis à la Commission Doctorale. Vous serez notifié(e) de la date exacte de l'audition orale.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('INSCRIPTION_SCAN')}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Vérifier mes documents scannés
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 : INSCRIPTION AU CYCLE DOCTORAL (Scan CNI & Carte Étudiant) */}
      {activeTab === 'INSCRIPTION_SCAN' && (
        <CandidateRegistrationPage
          dossierId={dossier.id}
          initialCandidat={dossier.candidat}
          onIdentityValidated={async () => {
            await onRefreshDossier();
            setActiveTab('DOCUMENTS');
          }}
        />
      )}

      {/* TAB 3 : PROJET DE THÈSE & ENCADRANT */}
      {activeTab === 'PROJET' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Projet de Thèse & Choix du Directeur de Recherche
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Précisez le sujet proposé ainsi que le laboratoire d'accueil et le Professeur habilité de l'USMBA.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Intitulé officiel du sujet de thèse *
              </label>
              <input
                type="text"
                value={sujetThese}
                onChange={(e) => setSujetThese(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Résumé de la problématique scientifique (5 à 10 lignes) *
              </label>
              <textarea
                rows={4}
                value={resumeThese}
                onChange={(e) => setResumeThese(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Spécialité doctorale *</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Directeur de Thèse habilité (Professeur) *
                </label>
                <select
                  value={encadrantId}
                  onChange={(e) => setEncadrantId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {allSupervisors.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      Pr. {prof.prenom} {prof.nom} ({prof.laboratoire || 'Laboratoire LIASC'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              disabled={savingForm}
              onClick={handleSaveAcademicInfo}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <span>{savingForm ? 'Enregistrement...' : 'Enregistrer le projet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4 : DÉPÔT DES PIÈCES JUSTIFICATIVES */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                Dépôt des pièces justificatives obligatoires
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vérification automatique de conformité documentaire (format PDF/JPG, taille et intégrité).
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold">
              {dossier.documents.length} / 6 pièces déposées
            </span>
          </div>

          <div className="space-y-3">
            {mandatoryDocList.map((docItem) => {
              const uploaded = dossier.documents.find((d) => d.type_document === docItem.type);
              return (
                <div
                  key={docItem.type}
                  className={`p-4 rounded-2xl border transition flex flex-wrap items-center justify-between gap-4 ${
                    uploaded
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        uploaded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-semibold">{docItem.title}</strong>
                        {uploaded && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                            ✓ Conforme
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{docItem.desc}</p>
                      {uploaded && (
                        <div className="mt-1 font-mono text-[10px] text-slate-600 flex items-center gap-2">
                          <span>Fichier : <strong className="text-slate-800">{uploaded.nom_fichier_origine}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {uploaded ? (
                      <button
                        onClick={() => onDeleteDoc(uploaded.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Supprimer la pièce"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFileUploadSim(docItem.type, docItem.sample)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Téléverser</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('CONTROLE')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <span>Vérifier & Soumettre au Contrôle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 5 : CONTRÔLE AUTOMATIQUE */}
      {activeTab === 'CONTROLE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Contrôle Automatique du Dossier (Audit Déterministe)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Contrôle de complétude, format CNI, Levenshtein et intégrité sans intervention manuelle du GCD.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-blue-950">Lancer ou relancer l'audit automatique</div>
              <p className="text-xs text-blue-800 mt-0.5">
                Vérification instantanée de la recevabilité pour transmission immédiate à la Commission Doctorale.
              </p>
            </div>

            <button
              disabled={submitting}
              onClick={handleSubmitDossier}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              <span>{submitting ? 'Audit en cours...' : 'Exécuter le contrôle automatique'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
