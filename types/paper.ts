export enum PaperColor {
  Yellow = '#fef3c7',
  Pink = '#fce7f3',
  Blue = '#dbeafe',
  Green = '#dcfce7',
  Orange = '#fed7aa',
}

export interface Paper {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  color: PaperColor;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  tags: string[];
  isLocked: boolean;
}

export interface PaperVersion {
  paperId: string;
  version: number;
  text: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
}
