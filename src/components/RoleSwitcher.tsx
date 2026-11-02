import React, { useState, useRef, useEffect } from 'react';
import { Utilisateur, RoleUtilisateur, NotificationItem } from '../types/index.ts';
import {
  Building2,
  ChevronDown,
  RotateCcw,
  Bell,
  GitBranch,
  LogOut,
  Check,
} from 'lucide-react';

interface Props {
  currentUser: Utilisateur;
  onRoleSwitch: (role: RoleUtilisateur) => void;
  onResetDemo: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenWorkflowModal: () => void;
}

export const RoleSwitcher: React.FC<Props> = ({
  currentUser,
  onRoleSwitch,
  onResetDemo,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onOpenWorkflowModal,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showEspacesMenu, setShowEspacesMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.lue).length;

  const espacesDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        espacesDropdownRef.current &&
        !espacesDropdownRef.current.contains(event.target as Node)
      ) {
        setShowEspacesMenu(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const rolesConfig: {
    role: RoleUtilisateur;
    label: string;
    emoji: string;
    userDesc: string;
    email: string;
  }[] = [
    {
      role: 'CANDIDAT',
      label: 'Candidat',
      emoji: '🎓',
      userDesc: 'Wissal Benyamina',
      email: 'wissal.benyamina@usmba.ac.ma',
    },
    {
      role: 'ENCADRANT',
      label: 'Directeur de thèse',
      emoji: '👨‍🏫',
      userDesc: 'Pr. Karim Bennani',
      email: 'k.bennani@usmba.ac.ma',
    },
    {
      role: 'COMMISSION',
      label: 'Commission Doctorale',
      emoji: '👥',
      userDesc: 'Pr. Fatima Alami',
      email: 'f.alami@usmba.ac.ma',
    },
    {
      role: 'ADMINISTRATION',
      label: 'Pôle Doctoral / Admin',
      emoji: '🏛️',
      userDesc: 'M. Mohammed Tazi',
      email: 'm.tazi@usmba.ac.ma',
    },
    {
      role: 'SYSTEME',
      label: 'Système & Logs',
      emoji: '⚙️',
      userDesc: 'Automate de Contrôle',
      email: 'systeme@usmba.ac.ma',
    },
  ];

  const currentRoleObj = rolesConfig.find((r) => r.role === currentUser.role) || rolesConfig[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner : Institution USMBA & Session */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/20">
            U
          </div>
          <div>
            <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px]">
              Université Sidi Mohamed Ben Abdellah • CEDoc USMBA
            </span>
            <span className="hidden sm:inline text-slate-400 mx-2">•</span>
            <span className="hidden sm:inline text-slate-300">
              Portail Doctoral & Suivi d'Admission
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Session 2026-2027
          </span>

          <button
            onClick={onOpenWorkflowModal}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition border border-slate-700 cursor-pointer"
            title="Consulter le cycle et les transitions"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Parcours & Workflow</span>
          </button>

          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 transition border border-amber-800/60 cursor-pointer"
            title="Réinitialiser tous les dossiers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Réinitialiser démo</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 transition border border-rose-800/60 cursor-pointer"
            title="Déconnexion Google"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Bar : Espaces Institutionnels Dropdown & User Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Bouton / Menu Déroulant Unique « Espaces institutionnels » */}
        <div className="relative" ref={espacesDropdownRef}>
          <button
            onClick={() => setShowEspacesMenu(!showEspacesMenu)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-xs ${
              showEspacesMenu
                ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400/30'
                : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600'
            }`}
            aria-expanded={showEspacesMenu}
            aria-haspopup="true"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-bold">Espaces institutionnels</span>
            <span className="text-[11px] font-normal text-slate-300 hidden sm:inline">
              ({currentRoleObj.emoji} {currentRoleObj.label})
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showEspacesMenu ? 'rotate-180 text-white' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showEspacesMenu && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Sélectionner un Espace
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  USMBA
                </span>
              </div>

              <div className="p-2 space-y-1">
                {rolesConfig.map((item) => {
                  const isSelected = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        onRoleSwitch(item.role);
                        setShowEspacesMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/80'
                          : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg select-none">{item.emoji}</span>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">
                            {item.userDesc}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                          <Check className="w-3 h-3" />
                          <span>Actif</span>
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Notifications Dropdown */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notifications ({notifications.length})</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-medium">
                      {unreadCount} non lue(s)
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                          !notif.lue ? 'bg-blue-50/60 font-medium' : ''
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !notif.lue ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{notif.titre}</div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{notif.message}</p>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {notif.horodatage_texte || new Date(notif.cree_le).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.prenom[0]}
              {currentUser.nom[0]}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-medium text-slate-100">
                {currentUser.prenom} {currentUser.nom}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[150px]">
                {currentUser.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
