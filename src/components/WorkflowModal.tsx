import React from 'react';
import { X, CheckCircle, ArrowRight, ShieldAlert, Cpu, Award, FileCheck, GraduationCap } from 'lucide-react';
import { StatutDossier } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentStatut?: StatutDossier;
}

export const WorkflowModal: React.FC<Props> = ({ isOpen, onClose, currentStatut }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '1. Phase Candidat',
      color: 'border-blue-300 bg-blue-50/50',
      nodes: [
        { code: 'BROUILLON', label: 'Brouillon', actor: 'Candidat' },
        { code: 'CARTE_SCANNEE', label: 'Carte Scannée', actor: 'Candidat (Upload/Cam)' },
        { code: 'PREREMPLI', label: 'Prérempli OCR', actor: 'Système OCR' },
        { code: 'EN_COMPLETION', label: 'En Complétion', actor: 'Candidat' },
        { code: 'DOCUMENTS_DEPOSES', label: 'Documents Déposés', actor: 'Candidat' },
        { code: 'SOUMIS', label: 'Soumis', actor: 'Candidat' },
      ],
    },
    {
      step: '2. Moteur de Contrôle Automatique (Système)',
      color: 'border-purple-300 bg-purple-50/50',
      nodes: [
        { code: 'CONTROLE_AUTOMATIQUE', label: 'Audit Automatique', actor: 'Moteur de Règles Système' },
        { code: 'ANOMALIES_SIGNALEES', label: 'Anomalies Signalées', actor: 'Branche Erreur (Correction Candidat)' },
        { code: 'ACCORD_ENCADRANT_REQUIS', label: 'Accord Encadrant', actor: 'Encadrant (Accept/Refuse)' },
        { code: 'TRANSMIS_COMMISSION', label: 'Transmis Commission', actor: 'Conforme Certifié' },
      ],
    },
    {
      step: '3. Phase Académique & Délibération (Commission)',
      color: 'border-teal-300 bg-teal-50/50',
      nodes: [
        { code: 'EN_EVALUATION', label: 'En Évaluation', actor: 'Grille d\'évaluation (/20)' },
        { code: 'ENTRETIEN_PLANIFIE', label: 'Entretien Oral', actor: 'Convocation & Audition' },
        { code: 'DELIBERATION', label: 'Délibération Collégiale', actor: 'Procès-Verbal & Décision' },
        { code: 'REFUSE', label: 'Refusé', actor: 'Candidature Rejetée (Fin)' },
      ],
    },
    {
      step: '4. Phase Administrative & Finalisation (Administration)',
      color: 'border-emerald-300 bg-emerald-50/50',
      nodes: [
        { code: 'VALIDATION_ADMINISTRATIVE', label: 'Validation Administrative', actor: 'Contrôle des originaux' },
        { code: 'PUBLIE', label: 'Résultats Publiés', actor: 'Affichage officiel' },
        { code: 'CHARTE_DE_THESE', label: 'Charte Numérique', actor: 'Génération du contrat' },
        { code: 'SIGNATURE', label: 'Signature Électronique', actor: 'Candidat + Encadrant' },
        { code: 'INSCRIT', label: 'Inscrit au Doctorat', actor: 'Attestation & Matrice (Fin)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Cycle de Vie & Machine à États Finis (Workflow)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Traçabilité intégrale, automatisation du contrôle (suppression du GCD manuel) et gouvernance RBAC stricte
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Principle Alert */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-blue-950">
                Automatisation du contrôle sans suppression de la responsabilité humaine :
              </strong>
              Le contrôle de complétude, la correspondance OCR (carte vs formulaire) et l'anti-doublon sont pris en charge par le système.
              Les étapes d'évaluation scientifique, d'entretien oral et de délibération restent la prérogative exclusive de la Commission, conformément au règlement des études doctorales.
            </div>
          </div>

          {/* Workflow Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((group, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${group.color}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                  <span>{group.step}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                    Phase {idx + 1}/4
                  </span>
                </h3>

                <div className="space-y-2">
                  {group.nodes.map((node) => {
                    const isCurrent = currentStatut === node.code;
                    return (
                      <div
                        key={node.code}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md font-semibold ring-2 ring-blue-300'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCurrent
                                ? 'bg-amber-300 animate-ping'
                                : node.code === 'REFUSE'
                                ? 'bg-rose-500'
                                : node.code === 'INSCRIT'
                                ? 'bg-emerald-500'
                                : 'bg-blue-400'
                            }`}
                          />
                          <span className="font-mono text-[11px] font-medium">{node.code}</span>
                          <span className="text-[11px] opacity-80 font-normal">({node.label})</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {node.actor}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Transition Rules Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Règles métier & Gardes infranchissables
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Un dossier avec des anomalies (non conforme) ne peut <strong>jamais</strong> être transmis à la Commission.</li>
              <li>La Commission ne visualise que les dossiers 100% conformes et validés par l'encadrant.</li>
              <li>Chaque transition est validée par le rôle habilité et scellée dans le journal d'audit immuable.</li>
              <li>La signature de la charte de thèse est conditionnée par la publication des résultats favorables.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Fermer le schéma
          </button>
        </div>
      </div>
    </div>
  );
};
