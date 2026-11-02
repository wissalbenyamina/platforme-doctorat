import React from 'react';
import { DossierComplet } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';
import {
  Cpu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  History,
  FileCheck2,
  Scan,
  Database,
  Terminal,
} from 'lucide-react';

interface Props {
  dossiers: DossierComplet[];
  onOpenAuditModal: (dossier: DossierComplet) => void;
}

export const SystemView: React.FC<Props> = ({ dossiers, onOpenAuditModal }) => {
  // Aggregate all automated checks executed across all dossiers
  const allControls = dossiers.flatMap((d) =>
    d.controles.map((c) => ({
      ...c,
      dossierNumero: d.numero_dossier,
      candidatNom: `${d.candidat.utilisateur.prenom} ${d.candidat.utilisateur.nom}`,
      dossierObj: d,
    }))
  ).sort((a, b) => new Date(b.date_execution).getTime() - new Date(a.date_execution).getTime());

  // Aggregate all anomalies
  const allAnomalies = dossiers.flatMap((d) =>
    d.anomalies.map((a) => ({
      ...a,
      dossierNumero: d.numero_dossier,
      candidatNom: `${d.candidat.utilisateur.prenom} ${d.candidat.utilisateur.nom}`,
      dossierObj: d,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-slate-800" />
              Moteur de Contrôle Automatique & Traçabilité Système
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Remplacement total du rôle manuel du GCD par un automate déterministe d'audit documentaire et de détection d'anomalies en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Automate v1.0 Actif
            </span>
          </div>
        </div>

        {/* Engine Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold">
              <Scan className="w-4 h-4" />
              <span>OCR & Vision</span>
            </div>
            <p className="text-slate-600 text-[11px]">Extraction automatique CIN, Nom, Prénom, Date et Lieu de naissance.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Levenshtein Match</span>
            </div>
            <p className="text-slate-600 text-[11px]">Contrôle de concordance état civil (seuil de tolérance fixé à 85%).</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <FileCheck2 className="w-4 h-4" />
              <span>Complétude Pièces</span>
            </div>
            <p className="text-slate-600 text-[11px]">Vérification de présence des 4 justificatifs académiques obligatoires.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold">
              <Database className="w-4 h-4" />
              <span>Anti-doublon</span>
            </div>
            <p className="text-slate-600 text-[11px]">Unicité stricte par titulaire de CIN pour l'année universitaire 2026/2027.</p>
          </div>
        </div>
      </div>

      {/* Execution Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Execution Journal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              Journal des Audits Automatiques ({allControls.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {allControls.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Aucun contrôle automatique consigné.
              </div>
            ) : (
              allControls.map((ctrl) => (
                <div
                  key={ctrl.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{ctrl.dossierNumero}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        ctrl.est_conforme ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Score : {ctrl.score_completude}% • {ctrl.est_conforme ? 'Conforme' : 'Anomalies'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    Candidat : <strong className="text-slate-800">{ctrl.candidatNom}</strong> • Exécuté le {new Date(ctrl.date_execution).toLocaleString('fr-FR')}
                  </div>

                  {/* Rules list */}
                  <div className="space-y-1 pt-1">
                    {ctrl.details_rapport.details.map((rule, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] bg-white p-1 rounded border border-slate-200/80">
                        <span className="text-slate-700">{rule.regle}</span>
                        <span className={rule.statut === 'VALIDE' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {rule.statut}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onOpenAuditModal(ctrl.dossierObj)}
                      className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Voir historique complet →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Anomalies Monitor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Registre des Anomalies Signalées ({allAnomalies.length})
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono font-semibold">
              {allAnomalies.filter((a) => !a.resolue).length} Non résolue(s)
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {allAnomalies.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Aucune anomalie détectée sur l'ensemble des candidatures.
              </div>
            ) : (
              allAnomalies.map((ano) => (
                <div
                  key={ano.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    ano.resolue ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-700 font-bold">{ano.dossierNumero}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        ano.resolue ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ano.resolue ? '✓ Résolue' : 'En attente de correction'}
                    </span>
                  </div>

                  <div className="font-medium text-slate-800">{ano.message}</div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/50">
                    <span>Champ : {ano.champ_ou_document}</span>
                    <span>Candidat : {ano.candidatNom}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
