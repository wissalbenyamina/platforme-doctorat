import React, { useState } from 'react';
import { DossierComplet, Utilisateur } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  FileText,
  User,
  GraduationCap,
  Calendar,
  MessageSquare,
  History,
  Download,
  AlertCircle,
} from 'lucide-react';

interface Props {
  dossiers: DossierComplet[];
  currentUser: Utilisateur;
  onDecision: (dossierId: string, decision: 'ACCEPTER' | 'REFUSER', commentaire: string) => Promise<void>;
  onOpenAuditModal: (dossier: DossierComplet) => void;
  onOpenCharteModal: (dossier: DossierComplet) => void;
}

export const SupervisorView: React.FC<Props> = ({
  dossiers,
  currentUser,
  onDecision,
  onOpenAuditModal,
  onOpenCharteModal,
}) => {
  const [selectedDossier, setSelectedDossier] = useState<DossierComplet | null>(dossiers[0] || null);
  const [commentaire, setCommentaire] = useState('');
  const [processing, setProcessing] = useState(false);
  const [modalType, setModalType] = useState<'ACCEPTER' | 'REFUSER' | null>(null);

  const handleConfirmDecision = async () => {
    if (!selectedDossier || !modalType) return;
    setProcessing(true);
    try {
      await onDecision(selectedDossier.id, modalType, commentaire);
      setModalType(null);
      setCommentaire('');
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = dossiers.filter((d) => d.statut === 'ACCORD_ENCADRANT_REQUIS');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              Espace Direction de Thèse • {currentUser.grade || 'Professeur de l\'Enseignement Supérieur'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Laboratoire : <strong className="text-slate-700">{currentUser.laboratoire || 'LIASC'}</strong> •{' '}
              <span className="font-semibold text-emerald-700">{pendingRequests.length} demande(s) d'encadrement en attente de votre accord</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: List of Requests & Detailed Dossier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of Assigned Candidates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center justify-between">
            <span>Dossiers sous ma direction ({dossiers.length})</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              2026/2027
            </span>
          </h2>

          <div className="space-y-2">
            {dossiers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Aucune demande d'encadrement assignée pour l'instant.
              </div>
            ) : (
              dossiers.map((d) => {
                const isSelected = selectedDossier?.id === d.id;
                const isPending = d.statut === 'ACCORD_ENCADRANT_REQUIS';
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDossier(d)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500 text-[11px] font-semibold">{d.numero_dossier}</span>
                      <StatusBadge statut={d.statut} size="sm" />
                    </div>

                    <div className="font-bold text-slate-900">
                      {d.candidat.utilisateur.prenom} {d.candidat.utilisateur.nom}
                    </div>

                    <p className="text-slate-600 line-clamp-1 italic text-[11px]">
                      « {d.sujet_these} »
                    </p>

                    {isPending && (
                      <div className="pt-1 flex items-center gap-1.5 text-amber-700 font-semibold text-[10px]">
                        <AlertCircle className="w-3 h-3" />
                        <span>Action requise : Accord d'encadrement</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Dossier Review & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDossier ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedDossier.candidat.utilisateur.prenom} {selectedDossier.candidat.utilisateur.nom}
                    </h2>
                    <StatusBadge statut={selectedDossier.statut} size="md" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    CIN : <strong className="text-slate-800">{selectedDossier.candidat.cin}</strong> • Téléphone : {selectedDossier.candidat.telephone}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuditModal(selectedDossier)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Historique</span>
                  </button>

                  {['CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(selectedDossier.statut) && (
                    <button
                      onClick={() => onOpenCharteModal(selectedDossier)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Signer la Charte</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Thesis Subject & Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Projet de Thèse Déposé
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Intitulé du Sujet :</span>
                    <strong className="text-slate-900 text-sm leading-snug">« {selectedDossier.sujet_these} »</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Résumé / Problématique :</span>
                    <p className="text-slate-700 leading-relaxed text-xs mt-1">
                      {selectedDossier.resume_these || 'Aucun résumé détaillé renseigné.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Background */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cursus & Mérite Académique
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-400 text-[11px] block">Diplôme d'origine :</span>
                    <strong className="text-slate-800">{selectedDossier.candidat.dernier_diplome_obtenu}</strong>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-400 text-[11px] block">Établissement & Année :</span>
                    <strong className="text-slate-800">{selectedDossier.candidat.etablissement_origine} ({selectedDossier.candidat.annee_obtention_master})</strong>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-400 text-[11px] block">Mention & Moyenne :</span>
                    <strong className="text-emerald-700">{selectedDossier.candidat.mention_master} ({selectedDossier.candidat.moyenne_master || '16.5'}/20)</strong>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pièces Justificatives Vérifiées ({selectedDossier.documents.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedDossier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between bg-slate-50/50"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate text-slate-800 font-medium">{doc.nom_fichier_origine}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        Vérifié
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Encadrant */}
              {selectedDossier.statut === 'ACCORD_ENCADRANT_REQUIS' && (
                <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950">
                      <strong className="font-semibold block">Décision de direction de thèse</strong>
                      Ce dossier a passé le contrôle automatique avec succès. En tant que directeur pressenti, confirmez votre accord pour encadrer ces travaux de recherche ou motivez votre refus.
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        setModalType('ACCEPTER');
                        setCommentaire('Accord favorable. Le sujet s\'inscrit pleinement dans les axes prioritaires du laboratoire.');
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Donner l'accord d'encadrement</span>
                    </button>

                    <button
                      onClick={() => {
                        setModalType('REFUSER');
                        setCommentaire('Capacité d\'accueil maximale atteinte pour l\'année universitaire 2026/2027.');
                      }}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Refuser la demande</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Sélectionnez un dossier à gauche pour consulter les détails.
            </div>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {modalType && selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className={`p-4 text-white flex items-center justify-between ${modalType === 'ACCEPTER' ? 'bg-emerald-700' : 'bg-rose-700'}`}>
              <div className="font-bold text-sm flex items-center gap-2">
                {modalType === 'ACCEPTER' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Confirmation : {modalType === 'ACCEPTER' ? 'Accord d\'encadrement' : 'Refus d\'encadrement'}</span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700">
                Vous êtes sur le point de rendre votre décision pour le candidat <strong>{selectedDossier.candidat.utilisateur.prenom} {selectedDossier.candidat.utilisateur.nom}</strong>.
              </p>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Commentaire / Motif officiel *
                </label>
                <textarea
                  rows={3}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="Saisissez vos observations ou motifs..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                disabled={processing || !commentaire}
                onClick={handleConfirmDecision}
                className={`px-5 py-2 text-white text-xs font-bold rounded-lg transition cursor-pointer ${
                  modalType === 'ACCEPTER' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processing ? 'Enregistrement...' : 'Confirmer la décision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
