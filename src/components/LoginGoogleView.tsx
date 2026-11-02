import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, GraduationCap, ArrowRight, Lock, CheckCircle2, Building2 } from 'lucide-react';
import { Utilisateur } from '../types/index.ts';

interface Props {
  onLoginSuccess: (user: Utilisateur) => void;
}

export const LoginGoogleView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const demoAccounts = [
    {
      role: 'Candidat',
      name: 'Wissal Benyamina',
      email: 'wissal.benyamina@usmba.ac.ma',
      desc: 'Candidate doctorale • Master IA (FSDM Fès)',
      color: 'bg-blue-600 hover:bg-blue-700',
      badge: 'Candidat',
    },
    {
      role: 'Directeur de thèse',
      name: 'Pr. Karim Bennani',
      email: 'k.bennani@usmba.ac.ma',
      desc: 'Professeur PES • Dir. Labo LIASC (USMBA)',
      color: 'bg-emerald-600 hover:bg-emerald-700',
      badge: 'Encadrant',
    },
    {
      role: 'Commission Doctorale',
      name: 'Pr. Fatima Alami',
      email: 'f.alami@usmba.ac.ma',
      desc: 'Présidente de la Commission Doctorale',
      color: 'bg-purple-600 hover:bg-purple-700',
      badge: 'Commission',
    },
    {
      role: 'Pôle Doctoral / Admin',
      name: 'M. Mohammed Tazi',
      email: 'm.tazi@usmba.ac.ma',
      desc: 'Chef de Service CEDoc • Administration',
      color: 'bg-amber-600 hover:bg-amber-700',
      badge: 'Administration',
    },
    {
      role: 'Système & Logs',
      name: 'Automate de Contrôle',
      email: 'systeme@usmba.ac.ma',
      desc: 'Moteur de règles et traçabilité automatique',
      color: 'bg-slate-700 hover:bg-slate-800',
      badge: 'Système',
    },
  ];

  const handleGoogleAuth = async (emailToTest: string, name?: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToTest, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Authentification Google échouée.');
        return;
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur réseau lors de la communication avec Google OAuth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Institutionnel */}
        <div className="bg-slate-900 text-white p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-white/10 mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>

          <span className="text-[11px] font-mono uppercase tracking-widest text-blue-300 font-semibold block">
            Royaume du Maroc • Université Sidi Mohamed Ben Abdellah de Fès
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Centre des Études Doctorales (CEDoc)
          </h1>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
            Plateforme officielle de pré-inscription, contrôle automatique et suivi d'admission au Cycle Doctoral (Session 2026-2027).
          </p>
        </div>

        {/* Corps principal d'authentification */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Alerte Erreur de Domaine */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5 font-bold text-sm text-rose-700">
                <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600" />
                <span>Adresse non autorisée</span>
              </div>
              <p className="text-rose-800 leading-relaxed pl-7">
                {errorMessage}
              </p>
              <div className="pl-7 pt-1 font-mono text-[11px] text-rose-600 font-semibold">
                Astuce : Utilisez obligatoirement une adresse terminée par <span className="underline">@usmba.ac.ma</span>.
              </div>
            </div>
          )}

          {/* Bouton Principal : Se connecter avec Google */}
          <div className="space-y-4">
            <button
              disabled={loading}
              onClick={() => handleGoogleAuth('wissal.benyamina@usmba.ac.ma', 'Wissal Benyamina')}
              className="w-full py-4 px-6 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-center gap-3.5 text-slate-800 font-bold text-sm sm:text-base transition cursor-pointer group"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Authentification en cours...' : 'Se connecter avec Google'}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition ml-auto" />
            </button>

            <div className="text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Seules les adresses institutionnelles <strong>@usmba.ac.ma</strong> sont acceptées
              </span>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-semibold text-slate-400">
              <span className="bg-white px-3 font-mono">Comptes institutionnels USMBA</span>
            </div>
          </div>

          {/* Sélection rapide de compte institutionnel Google (par rôle) */}
          <div className="space-y-2.5">
            <p className="text-xs text-slate-600 font-semibold mb-1">
              Accès direct par profil d'authentification (@usmba.ac.ma) :
            </p>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleGoogleAuth(acc.email, acc.name)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition">
                      {acc.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {acc.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold group-hover:bg-blue-100 group-hover:text-blue-700">
                    {acc.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testeur d'adresse non autorisée (pour valider le rejet des comptes @gmail.com) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              {showCustomInput ? 'Masquer le testeur manuel d\'adresse' : 'Tester le rejet d\'une autre adresse Gmail (ex: @gmail.com)...'}
            </button>

            {showCustomInput && (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Simuler la saisie d'un compte Google quelconque :
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="ex: candidat.libre@gmail.com"
                    className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    disabled={!customGoogleEmail || loading}
                    onClick={() => handleGoogleAuth(customGoogleEmail, 'Utilisateur Test')}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Tester
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Si l'adresse ne se termine pas par @usmba.ac.ma, le système déclenchera automatiquement le refus d'accès institutionnel.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Sécurité */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Authentification sécurisée par Google Workspace for Education</span>
        </div>
      </div>
    </div>
  );
};
