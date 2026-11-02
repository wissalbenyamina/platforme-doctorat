import React from 'react';
import { StatutDossier } from '../types/index.ts';
import {
  FileText,
  Scan,
  Edit3,
  UploadCloud,
  Send,
  Cpu,
  AlertTriangle,
  UserCheck,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  FileCheck,
  Megaphone,
  Scroll,
  PenTool,
  GraduationCap,
} from 'lucide-react';

interface Props {
  statut: StatutDossier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ statut, size = 'md', showIcon = true }) => {
  const config: Record<
    StatutDossier,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    BROUILLON: {
      label: 'Brouillon',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: FileText,
    },
    CARTE_SCANNEE: {
      label: 'Carte scannée',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: Scan,
    },
    PREREMPLI: {
      label: 'Prérempli (OCR)',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: Edit3,
    },
    EN_COMPLETION: {
      label: 'En complétion',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Edit3,
    },
    DOCUMENTS_DEPOSES: {
      label: 'Documents déposés',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: UploadCloud,
    },
    SOUMIS: {
      label: 'Soumis',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: Send,
    },
    CONTROLE_AUTOMATIQUE: {
      label: 'Contrôle automatique',
      bg: 'bg-purple-50 animate-pulse',
      text: 'text-purple-700',
      border: 'border-purple-300',
      icon: Cpu,
    },
    ANOMALIES_SIGNALEES: {
      label: 'Anomalies signalées',
      bg: 'bg-rose-50',
      text: 'text-rose-700 font-semibold',
      border: 'border-rose-300 ring-2 ring-rose-100',
      icon: AlertTriangle,
    },
    ACCORD_ENCADRANT_REQUIS: {
      label: 'Accord encadrant requis',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: UserCheck,
    },
    TRANSMIS_COMMISSION: {
      label: 'Transmis Commission',
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-300',
      icon: CheckCircle2,
    },
    EN_EVALUATION: {
      label: 'En évaluation',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-300',
      icon: Award,
    },
    ENTRETIEN_PLANIFIE: {
      label: 'Entretien planifié',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-300',
      icon: Calendar,
    },
    DELIBERATION: {
      label: 'Délibération',
      bg: 'bg-violet-50',
      text: 'text-violet-800',
      border: 'border-violet-300',
      icon: Award,
    },
    REFUSE: {
      label: 'Non retenu',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
    },
    VALIDATION_ADMINISTRATIVE: {
      label: 'Validation administrative',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: FileCheck,
    },
    PUBLIE: {
      label: 'Résultats publiés',
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      border: 'border-emerald-400',
      icon: Megaphone,
    },
    CHARTE_DE_THESE: {
      label: 'Charte de thèse',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: Scroll,
    },
    SIGNATURE: {
      label: 'En cours de signature',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      icon: PenTool,
    },
    INSCRIT: {
      label: 'Inscrit au Doctorat',
      bg: 'bg-emerald-600 text-white font-bold',
      text: 'text-white',
      border: 'border-emerald-600 shadow-sm',
      icon: GraduationCap,
    },
  };

  const current = config[statut] || {
    label: statut,
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: FileText,
  };

  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} transition-colors`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
};
