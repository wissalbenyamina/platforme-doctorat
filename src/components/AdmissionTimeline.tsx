import React from 'react';
import { EtapeAdmission, StatutEtapeAdmission } from '../types/index.ts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  XCircle,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  etapes: EtapeAdmission[];
  progression: number;
  onNavigateToStep?: (etapeId: number) => void;
}

export const AdmissionTimeline: React.FC<Props> = ({
  etapes,
  progression,
  onNavigateToStep,
}) => {
  const getStatusBadge = (statut: StatutEtapeAdmission) => {
    switch (statut) {
      case 'TERMINE':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'Terminé',
          badgeText: '✅ Terminé',
        };
      case 'EN_COURS':
        return {
          icon: Clock,
          color: 'text-blue-800 bg-blue-100 border-blue-300 ring-2 ring-blue-400/30',
          dot: 'bg-blue-600 animate-pulse',
          label: 'En cours',
          badgeText: '🔵 En cours',
        };
      case 'EN_ATTENTE':
        return {
          icon: AlertCircle,
          color: 'text-amber-800 bg-amber-50 border-amber-300',
          dot: 'bg-amber-400',
          label: 'En attente',
          badgeText: '🟡 En attente',
        };
      case 'REFUSE':
        return {
          icon: XCircle,
          color: 'text-rose-800 bg-rose-100 border-rose-300',
          dot: 'bg-rose-600',
          label: 'Refusé',
          badgeText: '❌ Refusé',
        };
      case 'A_VENIR':
      default:
        return {
          icon: Circle,
          color: 'text-slate-500 bg-slate-100 border-slate-200',
          dot: 'bg-slate-300',
          label: 'À venir',
          badgeText: '⚪ À venir',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Progression Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Parcours d'admission au Cycle Doctoral
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            Progression de votre admission : <span className="text-blue-600 font-mono">{progression} %</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            8 Étapes Officielles
          </span>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="space-y-2">
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${progression}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span>1. Inscription (0%)</span>
          <span className="text-blue-600 font-bold">Actuel ({progression}%)</span>
          <span>8. Inscription Définitive (100%)</span>
        </div>
      </div>

      {/* Detailed Chronological Timeline of the 8 Stages */}
      <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6 pt-2 pb-2">
        {etapes.map((step) => {
          const cfg = getStatusBadge(step.statut);
          const Icon = cfg.icon;

          return (
            <div key={step.id} className="relative pl-6 sm:pl-8">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${cfg.dot}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

              {/* Step Card */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 transition text-xs space-y-2.5 ${
                  step.statut === 'EN_COURS'
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/10'
                    : step.statut === 'TERMINE'
                    ? 'border-emerald-200 bg-white hover:border-emerald-300'
                    : step.statut === 'EN_ATTENTE'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Header: Title & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                      {step.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {step.titre}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cfg.badgeText}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs leading-relaxed">
                  {step.description}
                </p>

                {/* Timestamp & Actor when available */}
                {step.horodatage && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{step.horodatage}</span>
                    </div>

                    {step.acteur && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Acteur : <strong className="text-slate-800">{step.acteur}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Waiting State Explanation */}
                {step.statut === 'EN_ATTENTE' && step.message_attente && (
                  <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300/80 text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Étape en attente :</strong>
                      <span>{step.message_attente}</span>
                    </div>
                  </div>
                )}

                {/* Direct Action Navigation Button if actionable */}
                {step.statut === 'EN_COURS' && onNavigateToStep && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigateToStep(step.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <span>Accéder à l'étape</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
