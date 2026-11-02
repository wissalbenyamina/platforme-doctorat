import React from 'react';
import { X, Clock, ShieldCheck, User } from 'lucide-react';
import { DossierComplet } from '../types/index.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierComplet | null;
}

export const AuditLogModal: React.FC<Props> = ({ isOpen, onClose, dossier }) => {
  if (!isOpen || !dossier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold">
                Journal d'Audit & Traçabilité Immuable
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Dossier N° <span className="font-mono text-blue-300">{dossier.numero_dossier}</span> • Candidat : {dossier.candidat.utilisateur.prenom} {dossier.candidat.utilisateur.nom}
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
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {dossier.historique.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Aucune action enregistrée pour le moment.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
              {dossier.historique.map((hist, index) => (
                <div key={hist.id || index} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge statut={hist.ancien_statut} size="sm" />
                        <span className="text-slate-400">→</span>
                        <StatusBadge statut={hist.nouveau_statut} size="sm" />
                      </div>
                      <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(hist.cree_le).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium text-xs mb-2 leading-relaxed">
                      {hist.commentaire || 'Transition de statut'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Acteur : <strong className="text-slate-700">{hist.acteur_nom}</strong></span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-600 font-mono text-[10px] uppercase">
                        {hist.acteur_role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="font-mono text-[11px]">Enregistrements certifiés non altérables</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
