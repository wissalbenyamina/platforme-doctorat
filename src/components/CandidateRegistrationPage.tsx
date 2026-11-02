import React, { useState } from 'react';
import { Candidat, OcrResult, StudentCardOcrResult } from '../types/index.ts';
import { scanCni, scanStudentCard, validateIdentity } from '../api/client.ts';
import {
  Scan,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  Camera,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface Props {
  dossierId: string;
  initialCandidat: Candidat;
  onIdentityValidated: () => void;
}

export const CandidateRegistrationPage: React.FC<Props> = ({
  dossierId,
  initialCandidat,
  onIdentityValidated,
}) => {
  const [activeSubStep, setActiveSubStep] = useState<1 | 2 | 3>(1); // 1 = CNI, 2 = Carte Étudiant, 3 = Confirmation Globale

  // CNI OCR State
  const [cniScanning, setCniScanning] = useState(false);
  const [cniOcrResult, setCniOcrResult] = useState<OcrResult | null>(null);
  const [cniSample, setCniSample] = useState<'sample-wissal' | 'sample-yassine'>('sample-wissal');

  // CNI Form Fields (editable by candidate)
  const [cin, setCin] = useState(initialCandidat.cin || 'CD789012');
  const [nom, setNom] = useState(initialCandidat.utilisateur_id ? 'BENYAMINA' : 'BENYAMINA');
  const [prenom, setPrenom] = useState('WISSAL');
  const [dateNaissance, setDateNaissance] = useState(initialCandidat.date_naissance || '2000-08-22');
  const [lieuNaissance, setLieuNaissance] = useState(initialCandidat.lieu_naissance || 'Fès');
  const [cniConfirmedByUser, setCniConfirmedByUser] = useState(false);

  // Student Card OCR State
  const [studentCardScanning, setStudentCardScanning] = useState(false);
  const [studentCardOcrResult, setStudentCardOcrResult] = useState<StudentCardOcrResult | null>(null);
  const [studentCardSample, setStudentCardSample] = useState<'sample-wissal' | 'sample-ensa'>('sample-wissal');

  // Student Card Form Fields (editable by candidate)
  const [codeEtudiant, setCodeEtudiant] = useState(initialCandidat.code_etudiant || 'N138094821');
  const [etablissement, setEtablissement] = useState(
    initialCandidat.etablissement_origine || 'Faculté des Sciences Dhar El Mehraz (FSDM - USMBA)'
  );
  const [filiere, setFiliere] = useState(
    initialCandidat.filiere_origine || 'Master Recherche en Intelligence Artificielle et Systèmes Distribués'
  );
  const [studentCardConfirmedByUser, setStudentCardConfirmedByUser] = useState(false);

  const [savingValidation, setSavingValidation] = useState(false);

  // Étape 1 : Scan CNI
  const handleScanCni = async () => {
    setCniScanning(true);
    try {
      const res = await scanCni(cniSample);
      if (res.success && res.data) {
        setCniOcrResult(res.data);
        setCin(res.data.cin);
        setNom(res.data.nom);
        setPrenom(res.data.prenom);
        setDateNaissance(res.data.date_naissance === '22/08/2000' ? '2000-08-22' : res.data.date_naissance);
        setLieuNaissance(res.data.lieu_naissance);
      }
    } finally {
      setCniScanning(false);
    }
  };

  // Étape 2 : Scan Carte Étudiant
  const handleScanStudentCard = async () => {
    setStudentCardScanning(true);
    try {
      const res = await scanStudentCard(studentCardSample);
      if (res.success && res.data) {
        setStudentCardOcrResult(res.data);
        setCodeEtudiant(res.data.code_etudiant);
        setEtablissement(res.data.etablissement);
        setFiliere(res.data.filiere);
      }
    } finally {
      setStudentCardScanning(false);
    }
  };

  // Validation finale d'identité
  const handleFinalIdentityValidation = async () => {
    setSavingValidation(true);
    try {
      await validateIdentity(dossierId, {
        cin,
        nom,
        prenom,
        date_naissance: dateNaissance,
        lieu_naissance: lieuNaissance,
        code_etudiant: codeEtudiant,
        etablissement,
        filiere,
      });
      onIdentityValidated();
    } finally {
      setSavingValidation(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-bold block flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Préremplissage Intelligent par Scan OCR
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Inscription au cycle doctoral
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Scannez vos documents officiels. Le système extrait automatiquement vos informations. Vous devez ensuite impérativement les vérifier et les valider.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
        <button
          onClick={() => setActiveSubStep(1)}
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
            activeSubStep === 1
              ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold'
              : cniConfirmedByUser
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs ${
              cniConfirmedByUser ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {cniConfirmedByUser ? '✓' : '1'}
          </div>
          <div>
            <div className="font-bold">1. Carte Nationale (CNI)</div>
            <span className="text-[10px] text-slate-500 font-normal">
              {cniConfirmedByUser ? 'Données CNI vérifiées' : 'Scan & Vérification'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubStep(2)}
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
            activeSubStep === 2
              ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold'
              : studentCardConfirmedByUser
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs ${
              studentCardConfirmedByUser ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
            }`}
          >
            {studentCardConfirmedByUser ? '✓' : '2'}
          </div>
          <div>
            <div className="font-bold">2. Carte Étudiant</div>
            <span className="text-[10px] text-slate-500 font-normal">
              {studentCardConfirmedByUser ? 'Code étudiant vérifié' : 'Scan & Numéro étudiant'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubStep(3)}
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
            activeSubStep === 3
              ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 font-bold'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-xs">
            3
          </div>
          <div>
            <div className="font-bold">3. Validation Finale</div>
            <span className="text-[10px] text-slate-500 font-normal">
              Validation par le candidat
            </span>
          </div>
        </button>
      </div>

      {/* SOUS-ÉTAPE 1 : SCAN CARTE NATIONALE (CNI) */}
      {activeSubStep === 1 && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Étape 1 — Scan de la Carte Nationale d'Identité (CNI)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prenez une photo nette ou téléversez le recto de votre CNI pour extraction OCR.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={cniSample}
                  onChange={(e) => setCniSample(e.target.value as any)}
                  className="p-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="sample-wissal">CNI : Wissal Benyamina (CD789012)</option>
                  <option value="sample-yassine">CNI : Yassine El Amrani (AB123456)</option>
                </select>
              </div>
            </div>

            {/* Scan Action Box */}
            <div className="p-6 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Scanner ou photographier la CNI</h4>
                <p className="text-[11px] text-slate-500">Formats acceptés : JPG, PNG, PDF (max 5 Mo)</p>
              </div>
              <button
                disabled={cniScanning}
                onClick={handleScanCni}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Scan className={`w-4 h-4 ${cniScanning ? 'animate-spin' : ''}`} />
                <span>{cniScanning ? 'Extraction OCR en cours...' : 'Lancer le Scan de la CNI'}</span>
              </button>
            </div>
          </div>

          {/* Formulaire de vérification CNI */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Vérification des informations détectées sur la CNI
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                * Les données OCR doivent être vérifiées par vos soins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Numéro de la Carte (CNI) *</label>
                <input
                  type="text"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom de famille *</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prénom *</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date de naissance *</label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lieu de naissance *</label>
                <input
                  type="text"
                  value={lieuNaissance}
                  onChange={(e) => setLieuNaissance(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={cniConfirmedByUser}
                  onChange={(e) => setCniConfirmedByUser(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Je confirme l'exactitude des informations extraites de ma CNI</span>
              </label>

              <button
                disabled={!cniConfirmedByUser}
                onClick={() => setActiveSubStep(2)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <span>Passer au scan de la carte étudiant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOUS-ÉTAPE 2 : SCAN CARTE ÉTUDIANT */}
      {activeSubStep === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Étape 2 — Scan de la Carte Étudiant
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Récupération automatique du code étudiant (CNE / Massar), établissement et filière d'origine.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={studentCardSample}
                  onChange={(e) => setStudentCardSample(e.target.value as any)}
                  className="p-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                >
                  <option value="sample-wissal">FSDM Fès (Master IA & SD)</option>
                  <option value="sample-ensa">ENSA Fès (Génie Info)</option>
                </select>
              </div>
            </div>

            {/* Scan Action Box */}
            <div className="p-6 bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Scanner la carte étudiant USMBA</h4>
                <p className="text-[11px] text-slate-500">Extraction du numéro étudiant / code Massar</p>
              </div>
              <button
                disabled={studentCardScanning}
                onClick={handleScanStudentCard}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Scan className={`w-4 h-4 ${studentCardScanning ? 'animate-spin' : ''}`} />
                <span>{studentCardScanning ? 'Scan de la carte étudiant...' : 'Scanner la carte étudiant'}</span>
              </button>
            </div>
          </div>

          {/* Formulaire de vérification Carte Étudiant */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Vérification des informations de la Carte Étudiant
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Code étudiant / Numéro d'étudiant (CNE) *</label>
                <input
                  type="text"
                  value={codeEtudiant}
                  onChange={(e) => setCodeEtudiant(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Établissement USMBA *</label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Filière / Master d'origine *</label>
                <input
                  type="text"
                  value={filiere}
                  onChange={(e) => setFiliere(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={studentCardConfirmedByUser}
                  onChange={(e) => setStudentCardConfirmedByUser(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Je confirme l'exactitude des informations de ma carte étudiant</span>
              </label>

              <button
                disabled={!studentCardConfirmedByUser}
                onClick={() => setActiveSubStep(3)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <span>Passer au récapitulatif</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOUS-ÉTAPE 3 : CONFIRMATION FINALE DU CANDIDAT */}
      {activeSubStep === 3 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Récapitulatif des données d'identité certifiées
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">
                  1. Données CNI
                </span>
                <div>Numéro CNI : <strong className="font-mono">{cin}</strong></div>
                <div>Nom & Prénom : <strong>{nom} {prenom}</strong></div>
                <div>Date & Lieu : <strong>{dateNaissance} à {lieuNaissance}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">
                  2. Données Académiques
                </span>
                <div>Code Étudiant : <strong className="font-mono">{codeEtudiant}</strong></div>
                <div>Établissement : <strong>{etablissement}</strong></div>
                <div>Filière : <strong>{filiere}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              En validant, ces données seront enregistrées de manière irrévocable dans le journal d'audit de votre dossier et permettront l'ouverture immédiate de l'étape <strong>Dépôt du dossier</strong>.
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveSubStep(2)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Modifier
              </button>

              <button
                disabled={savingValidation}
                onClick={handleFinalIdentityValidation}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingValidation ? 'Validation...' : 'Valider définitivement mon identité'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
