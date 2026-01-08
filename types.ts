
export enum FileType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  XLSX = 'XLSX',
  IMG = 'IMG',
  TXT = 'TXT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Deactivated';
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  updatedAt: string;
  author: string;
  changeNote: string;
  size: string;
}

export interface Document {
  id: string;
  name: string;
  type: FileType;
  ownerId: string;
  folderId: string | null;
  lastModified: string;
  size: string;
  currentVersion: number;
  versions: DocumentVersion[];
  tags: string[];
  isStarred: boolean;
  isTrashed: boolean;
  contractNumber?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  docId: string;
  docName: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Shared' | 'Downloaded';
  user: string;
  timestamp: string;
}
