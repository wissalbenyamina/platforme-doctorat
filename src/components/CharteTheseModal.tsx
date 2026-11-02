import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, PenTool, Lock } from 'lucide-react';
import { DossierComplet, RoleUtilisateur } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierComplet | null;
  currentUserRole: RoleUtilisateur;
  onSign: (signerRole: string) => Promise<void>;
}

export const CharteTheseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dossier,
  currentUserRole,
  onSign,
}) => {
  const [signing, setSigning] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  if (!isOpen || !dossier) return null;

  const charte = dossier.charte;
  const hasCandidatSigned = !!charte?.signature_candidat;
  const hasEncadrantSigned = !!charte?.signature_encadrant;

  const handleSignClick = async () => {
    if (!acceptTerms) return;
    setSigning(true);
    try {
      await onSign(currentUserRole);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold">
                Charte des Thèses de Doctorat Numérique
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Réf : {charte?.numero_charte || `CH-${dossier.numero_dossier}`} • Conforme au Décret ministériel fixant le statut des études doctorales
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Text & Charter Content */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Doctorant(e) :</span>
              <strong className="text-slate-900 font-semibold">{dossier.candidat.utilisateur.prenom} {dossier.candidat.utilisateur.nom} (CIN: {dossier.candidat.cin})</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Directeur de Thèse :</span>
              <strong className="text-slate-900 font-semibold">{dossier.encadrant ? `Pr. ${dossier.encadrant.prenom} ${dossier.encadrant.nom}` : 'Pr. Assigné'}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 text-[11px] block">Sujet de Recherche Déposé :</span>
              <span className="text-slate-800 font-medium italic">« {dossier.sujet_these} »</span>
            </div>
          </div>

          {/* Article 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide text-blue-900">
              Article 1 : Objet de la Charte
            </h4>
            <p>
              La présente charte définit les engagements réciproques du doctorant, du directeur de thèse, de la structure d’accueil (laboratoire) et de l’Université. Elle vise à garantir l’excellence scientifique, la liberté académique, le respect des délais réglementaires et la déontologie de la recherche.
            </p>
          </div>

          {/* Article 2 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide text-blue-900">
              Article 2 : Engagements du Doctorant
            </h4>
            <p>
              Le doctorant s’engage à consacrer le temps nécessaire à ses travaux de recherche, à respecter les règles de sécurité du laboratoire, à participer aux formations complémentaires (soft skills et méthodologie) et à faire preuve d’une intégrité scientifique absolue. Tout plagiat avéré entraîne la radiation immédiate.
            </p>
          </div>

          {/* Article 3 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide text-blue-900">
              Article 3 : Rôle et Encadrement du Directeur de Thèse
            </h4>
            <p>
              Le directeur de thèse s'engage à assurer un suivi régulier de l'état d'avancement des travaux, à faciliter l'accès aux ressources documentaires et matérielles, et à accompagner le doctorant dans ses publications indexées et participations aux conférences internationales.
            </p>
          </div>

          {/* Article 4 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide text-blue-900">
              Article 4 : Suivi Annuel et Réinscription
            </h4>
            <p>
              L’inscription en 2ème et 3ème année est subordonnée à la présentation d’un rapport d’avancement devant le comité de suivi de thèse et à la validation conjointe de l’encadrant et de la direction du CEDoc.
            </p>
          </div>

          {/* Status of Signatures */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              État des Signatures Électroniques Sécurisées
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Doctorant */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">1. Doctorant</span>
                  {hasCandidatSigned ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Signé
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                      En attente
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {charte?.signature_candidat ? (
                    <div>
                      <div>{charte.signature_candidat.nom}</div>
                      <div className="font-mono text-[9px] text-slate-400 mt-1 truncate">
                        {charte.signature_candidat.hash_certificat}
                      </div>
                    </div>
                  ) : (
                    'Signature requise du candidat'
                  )}
                </div>
              </div>

              {/* Encadrant */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">2. Encadrant</span>
                  {hasEncadrantSigned ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Signé
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                      En attente
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {charte?.signature_encadrant ? (
                    <div>
                      <div>{charte.signature_encadrant.nom}</div>
                      <div className="font-mono text-[9px] text-slate-400 mt-1 truncate">
                        {charte.signature_encadrant.hash_certificat}
                      </div>
                    </div>
                  ) : (
                    'Signature requise de l\'encadrant'
                  )}
                </div>
              </div>

              {/* Directeur CEDoc */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">3. CEDoc (Pôle)</span>
                  {charte?.signature_directeur_pole ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Validé
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      Automatique
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {charte?.signature_directeur_pole ? (
                    <div className="font-mono text-[9px] text-slate-400 truncate">
                      {charte.signature_directeur_pole.hash_certificat}
                    </div>
                  ) : (
                    'Validation conjointe finale'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Checkbox if not signed yet */}
          {(!hasCandidatSigned && currentUserRole === 'CANDIDAT') || (!hasEncadrantSigned && currentUserRole === 'ENCADRANT') ? (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-blue-950 font-medium leading-relaxed">
                  Je déclare avoir pris entière connaissance de l'ensemble des dispositions de la Charte de Thèse, du règlement intérieur du CEDoc et du Code d'éthique universitaire, et je m'engage formellement à les respecter sans réserve.
                </span>
              </label>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Horodatage cryptographique certifié</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer"
            >
              Fermer
            </button>

            {/* Signature button */}
            {(!hasCandidatSigned && currentUserRole === 'CANDIDAT') || (!hasEncadrantSigned && currentUserRole === 'ENCADRANT') ? (
              <button
                disabled={!acceptTerms || signing}
                onClick={handleSignClick}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{signing ? 'Signature en cours...' : `Signer électroniquement (${currentUserRole})`}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
