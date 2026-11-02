import React, { useState } from 'react';
import { DossierComplet, Utilisateur, ResultatDecision } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import {
  Users,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  Search,
  Filter,
  History,
  Scale,
  Video,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  dossiers: DossierComplet[];
  currentUser: Utilisateur;
  onSaveEvaluation: (dossierId: string, evalData: any) => Promise<void>;
  onScheduleInterview: (dossierId: string, date: string, lieu: string) => Promise<void>;
  onDeliberation: (dossierId: string, deliberationData: any) => Promise<void>;
  onOpenAuditModal: (dossier: DossierComplet) => void;
}

export const CommissionView: React.FC<Props> = ({
  dossiers,
  currentUser,
  onSaveEvaluation,
  onScheduleInterview,
  onDeliberation,
  onOpenAuditModal,
}) => {
  const [selectedDossier, setSelectedDossier] = useState<DossierComplet | null>(dossiers[0] || null);
  const [activeTab, setActiveTab] = useState<'GRILLE' | 'ENTRETIEN' | 'DELIBERATION'>('GRILLE');
  const [searchTerm, setSearchTerm] = useState('');

  // Grille Evaluation State
  const [pertinence, setPertinence] = useState(4);
  const [prerequis, setPrerequis] = useState(4);
  const [faisabilite, setFaisabilite] = useState(4);
  const [motivation, setMotivation] = useState(4);
  const [evalComment, setEvalComment] = useState('Dossier solide avec une bonne maîtrise de l\'état de l\'art.');
  const [savingEval, setSavingEval] = useState(false);

  // Interview Planning State
  const [interviewDate, setInterviewDate] = useState('2026-11-15T10:00');
  const [interviewLieu, setInterviewLieu] = useState('Salle de Réunion CEDoc / Visioconférence');
  const [savingInterview, setSavingInterview] = useState(false);

  // Deliberation State
  const [noteEntretien, setNoteEntretien] = useState(17);
  const [decisionResult, setDecisionResult] = useState<ResultatDecision>('FAVORABLE');
  const [pvDeliberation, setPvDeliberation] = useState('Candidat très brillant, excellente maîtrise théorique et soutenance remarquable. Avis unanime pour admission.');
  const [savingDelib, setSavingDelib] = useState(false);

  // Filter only compliant dossiers
  const filtered = dossiers.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.numero_dossier.toLowerCase().includes(q) ||
      d.candidat.utilisateur.nom.toLowerCase().includes(q) ||
      d.candidat.utilisateur.prenom.toLowerCase().includes(q) ||
      d.specialite.toLowerCase().includes(q)
    );
  });

  const noteDossierCalculee = Math.round(((pertinence + prerequis + faisabilite + motivation) * 1) + Number.EPSILON); // /20
  const noteFinalePonderee = Math.round(((noteDossierCalculee * 0.4 + noteEntretien * 0.6) + Number.EPSILON) * 100) / 100;

  const handleSaveGrille = async () => {
    if (!selectedDossier) return;
    setSavingEval(true);
    try {
      await onSaveEvaluation(selectedDossier.id, {
        note_dossier: noteDossierCalculee,
        grille_criteres: {
          pertinence_sujet: pertinence,
          prerequis_academiques: prerequis,
          faisabilite_methodologie: faisabilite,
          motivation_candidat: motivation,
        },
        commentaire: evalComment,
      });
      setActiveTab('ENTRETIEN');
    } finally {
      setSavingEval(false);
    }
  };

  const handleConfirmInterview = async () => {
    if (!selectedDossier) return;
    setSavingInterview(true);
    try {
      await onScheduleInterview(selectedDossier.id, interviewDate, interviewLieu);
      setActiveTab('DELIBERATION');
    } finally {
      setSavingInterview(false);
    }
  };

  const handleConfirmDeliberation = async () => {
    if (!selectedDossier) return;
    setSavingDelib(true);
    try {
      await onDeliberation(selectedDossier.id, {
        resultat: decisionResult,
        moyenne_finale: noteFinalePonderee,
        commentaire_deliberation: pvDeliberation,
      });
      if (decisionResult === 'FAVORABLE') {
        confetti({ particleCount: 90, spread: 70 });
      }
    } finally {
      setSavingDelib(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-purple-600" />
              Commission Doctorale d'Évaluation & Délibération
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Seuls les dossiers 100% conformes (certifiés par le système) et validés par l'encadrant sont soumis à l'évaluation académique de la Commission.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-semibold">
              Présidente : Pr. Fatima Alami
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of Eligible Candidates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dossiers Conformes ({filtered.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher par nom, CIN, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Aucun dossier conforme trouvé.
              </div>
            ) : (
              filtered.map((d) => {
                const isSelected = selectedDossier?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDossier(d)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20'
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

                    <div className="text-[11px] text-slate-500">
                      Master : {d.candidat.mention_master} ({d.candidat.moyenne_master || '16.5'}/20)
                    </div>

                    <p className="text-slate-600 line-clamp-1 italic text-[11px]">
                      « {d.sujet_these} »
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Evaluation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDossier ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              {/* Top Selected Dossier Banner */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedDossier.candidat.utilisateur.prenom} {selectedDossier.candidat.utilisateur.nom}
                    </h2>
                    <StatusBadge statut={selectedDossier.statut} size="md" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Directeur : <strong className="text-slate-700">{selectedDossier.encadrant ? `Pr. ${selectedDossier.encadrant.prenom} ${selectedDossier.encadrant.nom}` : 'Assigné'}</strong> • Sujet : « {selectedDossier.sujet_these} »
                  </p>
                </div>

                <button
                  onClick={() => onOpenAuditModal(selectedDossier)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Traçabilité</span>
                </button>
              </div>

              {/* Action Tabs for Commission */}
              <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('GRILLE')}
                  className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'GRILLE'
                      ? 'border-purple-600 text-purple-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>1. Grille d'évaluation du dossier</span>
                </button>

                <button
                  onClick={() => setActiveTab('ENTRETIEN')}
                  className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ENTRETIEN'
                      ? 'border-purple-600 text-purple-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>2. Planification de l'Entretien</span>
                </button>

                <button
                  onClick={() => setActiveTab('DELIBERATION')}
                  className={`pb-2.5 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'DELIBERATION'
                      ? 'border-purple-600 text-purple-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>3. Délibération & Décision Collégiale</span>
                </button>
              </div>

              {/* TAB 1 : Grille d'évaluation */}
              {activeTab === 'GRILLE' && (
                <div className="space-y-5 text-xs">
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-purple-700 font-bold block">
                        Note calculée du dossier scientifique
                      </span>
                      <p className="text-slate-600 text-xs mt-0.5">
                        Évaluation sommative sur 4 critères académiques
                      </p>
                    </div>
                    <div className="text-2xl font-black text-purple-700 font-mono">
                      {noteDossierCalculee} <span className="text-xs text-purple-400">/ 20</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Criteres */}
                    <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between font-semibold">
                        <span>1. Pertinence et originalité du sujet</span>
                        <span className="font-mono text-purple-700 font-bold">{pertinence} / 5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={pertinence}
                        onChange={(e) => setPertinence(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />

                      <div className="flex items-center justify-between font-semibold pt-2">
                        <span>2. Prérequis académiques & cursus</span>
                        <span className="font-mono text-purple-700 font-bold">{prerequis} / 5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={prerequis}
                        onChange={(e) => setPrerequis(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between font-semibold">
                        <span>3. Faisabilité & méthodologie proposée</span>
                        <span className="font-mono text-purple-700 font-bold">{faisabilite} / 5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={faisabilite}
                        onChange={(e) => setFaisabilite(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />

                      <div className="flex items-center justify-between font-semibold pt-2">
                        <span>4. Motivation et projet de recherche</span>
                        <span className="font-mono text-purple-700 font-bold">{motivation} / 5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={motivation}
                        onChange={(e) => setMotivation(Number(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Commentaire d'évaluation académique de la Commission :
                    </label>
                    <textarea
                      rows={3}
                      value={evalComment}
                      onChange={(e) => setEvalComment(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={savingEval}
                      onClick={handleSaveGrille}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      <span>{savingEval ? 'Enregistrement...' : 'Valider la note et passer à l\'entretien'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2 : Entretien Oral */}
              {activeTab === 'ENTRETIEN' && (
                <div className="space-y-5 text-xs">
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Planification de l'Audition du Candidat devant le Jury
                    </h3>
                    <p className="text-slate-600 text-xs">
                      Une convocation électronique sera automatiquement envoyée sur l'adresse email du candidat.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date et heure de l'audition *</label>
                      <input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Lieu ou Lien Visioconférence *</label>
                      <input
                        type="text"
                        value={interviewLieu}
                        onChange={(e) => setInterviewLieu(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-800 block">Membres du Jury d'audition convoqués :</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                      <li>Pr. Fatima Alami (Présidente de la Commission)</li>
                      <li>Pr. Karim Bennani (Directeur de Thèse)</li>
                      <li>Pr. Mouna Chraibi (Examinatrice externe)</li>
                    </ul>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setActiveTab('GRILLE')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Retour à la grille
                    </button>
                    <button
                      disabled={savingInterview}
                      onClick={handleConfirmInterview}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{savingInterview ? 'Planification...' : 'Enregistrer et convoquer le candidat'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3 : Délibération Collégiale */}
              {activeTab === 'DELIBERATION' && (
                <div className="space-y-5 text-xs">
                  {/* Results preview summary */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Note Dossier (40%)</span>
                      <strong className="text-base text-blue-400 font-mono">{noteDossierCalculee}/20</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Note Entretien (60%)</span>
                      <strong className="text-base text-purple-400 font-mono">{noteEntretien}/20</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Moyenne Finale</span>
                      <strong className="text-base text-emerald-400 font-mono font-black">{noteFinalePonderee}/20</strong>
                    </div>
                  </div>

                  {/* Saisie note entretien */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Note de l'entretien oral (/20) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={noteEntretien}
                      onChange={(e) => setNoteEntretien(Number(e.target.value))}
                      className="w-48 p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Décision collégiale radio */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 block">
                      Décision Collégiale de la Commission *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { val: 'FAVORABLE', label: 'Candidat Admis (Favorable)', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                        { val: 'LISTE_ATTENTE', label: 'Liste d\'attente', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                        { val: 'DEFAVORABLE', label: 'Candidat Non Retenu (Refus)', color: 'border-rose-500 bg-rose-50 text-rose-900' },
                      ].map((item) => (
                        <div
                          key={item.val}
                          onClick={() => setDecisionResult(item.val as ResultatDecision)}
                          className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                            decisionResult === item.val
                              ? `${item.color} font-bold shadow-xs`
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 ${
                              decisionResult === item.val ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PV Délibération */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Procès-Verbal officiel de délibération de la Commission *
                    </label>
                    <textarea
                      rows={3}
                      value={pvDeliberation}
                      onChange={(e) => setPvDeliberation(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setActiveTab('ENTRETIEN')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Retour à l'entretien
                    </button>
                    <button
                      disabled={savingDelib}
                      onClick={handleConfirmDeliberation}
                      className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <Scale className="w-4 h-4" />
                      <span>{savingDelib ? 'Validation en cours...' : 'Signer et Valider la Délibération Collégiale'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Sélectionnez un dossier conforme pour évaluer ou délibérer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
