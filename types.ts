
export enum VSLDuration {
  SHORT = 'Curta (Mecanismo Direto - até 8 min)',
  MEDIUM = 'Média (Pura Copy/Narrativa - até 15 min)',
  LONG = 'Longa (Híbrido/Conteúdo - até 60 min)'
}

export enum VSLFormat {
  CAMERA = 'Especialista na Câmera',
  SLIDES = 'Narração com Animação/Slides',
  INTERVIEW = 'Formato Entrevista/Podcast'
}

export enum VSLGoal {
  LEAD_CAPTURE = 'Captação de Leads',
  DIRECT_SALE = 'Venda Direta',
  APPLICATION = 'Aplicação para High Ticket',
  STRATEGY_SESSION = 'Sessão Estratégica (Filtro)',
  OTHER = 'Outro'
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // Base64
}

export interface VSLConfig {
  expert: string;
  audience: string;
  campaign: string;
  duration: VSLDuration;
  contentInput?: string; // For Long VSL
  format: VSLFormat;
  goal: VSLGoal;
  goalOther?: string; // For Other Goal
  product?: string; // Produto a ser vendido (para Venda Direta)
  observations?: string;
  files?: UploadedFile[];
}

export interface GeneratedLead {
  id: number;
  title: string;
  content: string;
}

export interface ScriptBlock {
  id: string;
  title: string; // Ex: "Bloco 2: A Jornada"
  description: string; // Instrução interna
  content: string;
  status: 'pending' | 'streaming' | 'waiting_approval' | 'approved';
}

export type AppState = 'CONFIG' | 'LEADS_GENERATED' | 'BLOCK_BUILDER' | 'COMPLETED';
