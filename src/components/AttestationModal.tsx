import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { DossierComplet } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dossier: DossierComplet | null;
}

export const AttestationModal: React.FC<Props> = ({ isOpen, onClose, dossier }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !dossier) return null;

  const handlePrint = () => {
    window.print();
  };

  const matricule = `DOC-2026-${dossier.candidat.cin.toUpperCase()}-REG`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Document Officiel : Attestation d'Inscription Doctorale</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div ref={printRef} className="p-8 sm:p-12 text-slate-900 bg-white space-y-6 max-h-[75vh] overflow-y-auto border-t border-slate-100">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1">
            <h4 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              Royaume du Maroc
            </h4>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Université Mohammed V de Rabat
            </h2>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Centre des Études Doctorales (CEDoc)
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">Année Universitaire 2026 - 2027</p>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <div className="inline-block px-6 py-2 border-2 border-slate-900 rounded-lg">
              <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900">
                Attestation d'Inscription au Cycle Doctoral
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-2">
              N° d'enregistrement : <span className="font-bold text-slate-800">{matricule}</span>
            </p>
          </div>

          {/* Legal statement */}
          <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>
              Le Directeur du Centre des Études Doctorales de l'Université Mohammed V certifie par la présente que :
            </p>

            {/* Candidate Info Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-xs">Nom & Prénom : </span>
                  <strong className="text-slate-900 text-xs sm:text-sm">
                    {dossier.candidat.utilisateur.nom.toUpperCase()} {dossier.candidat.utilisateur.prenom}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Numéro de C.I.N : </span>
                  <strong className="font-mono text-slate-900 text-xs sm:text-sm">
                    {dossier.candidat.cin}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Né(e) le : </span>
                  <strong className="text-slate-900 text-xs">
                    {dossier.candidat.date_naissance} à {dossier.candidat.lieu_naissance}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Nationalité : </span>
                  <strong className="text-slate-900 text-xs">
                    {dossier.candidat.nationalite || 'Marocaine'}
                  </strong>
                </div>
              </div>
            </div>

            <p>
              Est régulièrement inscrit(e) en <strong>1ère année du Cycle Doctoral</strong> au titre de l'année universitaire <strong>2026/2027</strong> pour préparer une thèse de doctorat selon les dispositions ci-après :
            </p>

            {/* Thesis Details Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div>
                <span className="text-slate-500 text-xs font-semibold block">Discipline / Spécialité :</span>
                <span className="text-slate-900 font-medium text-xs">{dossier.specialite}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-semibold block">Sujet de thèse approuvé :</span>
                <span className="text-slate-900 italic text-xs leading-snug">« {dossier.sujet_these} »</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block">Directeur de thèse :</span>
                  <span className="text-slate-900 font-medium text-xs">
                    {dossier.encadrant ? `Pr. ${dossier.encadrant.prenom} ${dossier.encadrant.nom}` : 'Pr. Désigné'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-semibold block">Structure d'accueil (Laboratoire) :</span>
                  <span className="text-slate-900 font-medium text-xs">{dossier.laboratoire_recherche}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
            </p>
          </div>

          {/* Signatures & QR Code */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 items-end">
            <div className="space-y-1">
              <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="25" height="25" fill="black" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="black" />

                  <rect x="65" y="10" width="25" height="25" fill="black" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="black" />

                  <rect x="10" y="65" width="25" height="25" fill="black" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="black" />

                  <rect x="42" y="20" width="8" height="8" fill="black" />
                  <rect x="52" y="32" width="6" height="10" fill="black" />
                  <rect x="42" y="45" width="18" height="6" fill="black" />
                  <rect x="65" y="45" width="10" height="12" fill="black" />
                  <rect x="42" y="65" width="10" height="15" fill="black" />
                  <rect x="60" y="70" width="20" height="8" fill="black" />
                </svg>
              </div>
              <p className="text-[9px] font-mono text-slate-400">Authentification numérique CEDoc</p>
            </div>

            <div className="text-right space-y-4">
              <p className="text-xs text-slate-600">
                Fait à Rabat, le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-800">Le Directeur du Pôle Doctoral</p>
                <div className="mt-1 inline-block border-2 border-emerald-600 rounded-lg px-3 py-1 text-emerald-800 font-serif italic text-xs rotate-[-2deg] bg-emerald-50/50">
                  Sceau officiel & Signature certifiée
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
