import React, { useState } from 'react';
import { DossierComplet, Utilisateur } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import {
  Building2,
  FileCheck,
  Megaphone,
  Scroll,
  GraduationCap,
  Download,
  Search,
  Filter,
  History,
  CheckCircle,
  Eye,
  TrendingUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  dossiers: DossierComplet[];
  currentUser: Utilisateur;
  onAdminValidate: (dossierId: string) => Promise<void>;
  onGenerateCharte: (dossierId: string) => Promise<void>;
  onFinalizeInscription: (dossierId: string) => Promise<void>;
  onOpenAuditModal: (dossier: DossierComplet) => void;
  onOpenCharteModal: (dossier: DossierComplet) => void;
  onOpenAttestationModal: (dossier: DossierComplet) => void;
}

export const AdminView: React.FC<Props> = ({
  dossiers,
  currentUser,
  onAdminValidate,
  onGenerateCharte,
  onFinalizeInscription,
  onOpenAuditModal,
  onOpenCharteModal,
  onOpenAttestationModal,
}) => {
  const [filterStatut, setFilterStatut] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<DossierComplet | null>(dossiers[0] || null);
  const [actionLoading, setActionLoading] = useState(false);

  // KPIs
  const totalDossiers = dossiers.length;
  const inAutoCheck = dossiers.filter((d) => d.statut === 'CONTROLE_AUTOMATIQUE').length;
  const withAnomalies = dossiers.filter((d) => d.statut === 'ANOMALIES_SIGNALEES').length;
  const inCommission = dossiers.filter((d) => ['TRANSMIS_COMMISSION', 'EN_EVALUATION', 'ENTRETIEN_PLANIFIE', 'DELIBERATION'].includes(d.statut)).length;
  const admis = dossiers.filter((d) => ['VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'CHARTE_DE_THESE', 'SIGNATURE', 'INSCRIT'].includes(d.statut)).length;
  const finalises = dossiers.filter((d) => d.statut === 'INSCRIT').length;

  // Filter
  const filteredDossiers = dossiers.filter((d) => {
    const matchesStatut = filterStatut === 'ALL' || d.statut === filterStatut;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.numero_dossier.toLowerCase().includes(q) ||
      d.candidat.utilisateur.nom.toLowerCase().includes(q) ||
      d.candidat.utilisateur.prenom.toLowerCase().includes(q) ||
      d.candidat.cin.toLowerCase().includes(q) ||
      d.sujet_these.toLowerCase().includes(q);
    return matchesStatut && matchesSearch;
  });

  const handleAdminValidateClick = async (dossierId: string) => {
    setActionLoading(true);
    try {
      await onAdminValidate(dossierId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCharteClick = async (dossierId: string) => {
    setActionLoading(true);
    try {
      await onGenerateCharte(dossierId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeClick = async (dossierId: string) => {
    setActionLoading(true);
    try {
      await onFinalizeInscription(dossierId);
      confetti({ particleCount: 100, spread: 80 });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Pôle Doctoral & Administration Centrale
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Supervision des pré-inscriptions, validation administrative des diplômes originaux, publication des listes et délivrance des attestations doctorales.
            </p>
          </div>

          <a
            href="/api/admin/export"
            download="candidatures_doctorat_2026.csv"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exporter la base (CSV / Excel)</span>
          </a>
        </div>

        {/* Global Statistics Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Total Dossiers</span>
            <span className="text-xl font-black text-slate-800 font-mono">{totalDossiers}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-mono text-purple-600 font-semibold block">En Commission</span>
            <span className="text-xl font-black text-purple-700 font-mono">{inCommission}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[10px] uppercase font-mono text-rose-600 font-semibold block">Anomalies Actives</span>
            <span className="text-xl font-black text-rose-700 font-mono">{withAnomalies}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-[10px] uppercase font-mono text-blue-600 font-semibold block">Admis Délibérés</span>
            <span className="text-xl font-black text-blue-700 font-mono">{admis}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-mono text-emerald-600 font-semibold block">Inscrits Définitivement</span>
            <span className="text-xl font-black text-emerald-700 font-mono">{finalises}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-center">
            <span className="text-[10px] uppercase font-mono text-slate-300 font-semibold block flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" /> Auto-GCD
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono">100%</span>
          </div>
        </div>
      </div>

      {/* Main Table & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Inscriptions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Registres des Candidatures Doctorales ({filteredDossiers.length})
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {['ALL', 'ANOMALIES_SIGNALEES', 'TRANSMIS_COMMISSION', 'VALIDATION_ADMINISTRATIVE', 'PUBLIE', 'INSCRIT'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatut(st)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-medium ${
                    filterStatut === st
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Tous' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher par numéro, nom, CIN, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">N° Dossier</th>
                  <th className="py-2.5 px-3">Candidat</th>
                  <th className="py-2.5 px-3">Statut Workflow</th>
                  <th className="py-2.5 px-3">Encadrant</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucun dossier ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  filteredDossiers.map((d) => {
                    const isSelected = selectedDossier?.id === d.id;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDossier(d)}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-700">
                          {d.numero_dossier}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {d.candidat.utilisateur.prenom} {d.candidat.utilisateur.nom}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{d.candidat.cin}</div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge statut={d.statut} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {d.encadrant ? `Pr. ${d.encadrant.nom}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDossier(d);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 rounded transition cursor-pointer"
                          >
                            Consulter
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Dossier Administrative Control Card */}
        <div className="space-y-4">
          {selectedDossier ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm text-xs">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-blue-600 font-bold">{selectedDossier.numero_dossier}</span>
                  <StatusBadge statut={selectedDossier.statut} size="sm" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  {selectedDossier.candidat.utilisateur.prenom} {selectedDossier.candidat.utilisateur.nom}
                </h3>
                <p className="text-slate-500 text-[11px] font-mono">CIN : {selectedDossier.candidat.cin}</p>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Sujet de thèse :</span>
                <p className="text-slate-800 italic line-clamp-3 leading-snug">
                  « {selectedDossier.sujet_these} »
                </p>
              </div>

              {/* Commission Decision if deliberate */}
              {selectedDossier.decision && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">Décision Commission :</span>
                    <span className="font-mono font-black text-purple-700">
                      {selectedDossier.decision.moyenne_finale}/20 ({selectedDossier.decision.resultat})
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] italic">
                    « {selectedDossier.decision.commentaire_deliberation} »
                  </p>
                </div>
              )}

              {/* Traçabilité Button */}
              <button
                onClick={() => onOpenAuditModal(selectedDossier)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Voir le Journal d'Audit</span>
              </button>

              {/* Admin Workflow Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Actions Administratives Disponibles :
                </span>

                {/* 1. Validation administrative */}
                {selectedDossier.statut === 'VALIDATION_ADMINISTRATIVE' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAdminValidateClick(selectedDossier.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Valider les originaux & Publier résultat</span>
                  </button>
                )}

                {/* 2. Générer la charte */}
                {selectedDossier.statut === 'PUBLIE' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleGenerateCharteClick(selectedDossier.id)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Scroll className="w-4 h-4" />
                    <span>Générer la Charte de Thèse Numérique</span>
                  </button>
                )}

                {/* 3. Signer la charte */}
                {['CHARTE_DE_THESE', 'SIGNATURE'].includes(selectedDossier.statut) && (
                  <button
                    onClick={() => onOpenCharteModal(selectedDossier)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Scroll className="w-4 h-4" />
                    <span>Consulter & Signer la Charte (Pôle)</span>
                  </button>
                )}

                {/* 4. Finaliser l'inscription */}
                {selectedDossier.statut === 'SIGNATURE' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleFinalizeClick(selectedDossier.id)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Finaliser l'Inscription Doctorale</span>
                  </button>
                )}

                {/* 5. Imprimer attestation */}
                {selectedDossier.statut === 'INSCRIT' && (
                  <button
                    onClick={() => onOpenAttestationModal(selectedDossier)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Délivrer l'Attestation Officielle</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Sélectionnez une candidature pour agir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
