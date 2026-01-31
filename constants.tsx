
import React from 'react';
import { FileType, Document, Folder, User, AuditLog } from './types';
import { FileText, FileSpreadsheet, FileImage, FileCode, Folder as FolderIcon } from 'lucide-react';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@documind.pro',
  avatar: 'https://picsum.photos/seed/alex/100/100',
  role: 'Admin',
  status: 'Active'
};

export const MOCK_FOLDERS: Folder[] = Array.from({ length: 9 }, (_, i) => ({
  id: `kebele-${i + 1}`,
  name: `Kebele ${i + 1}`,
  parentId: null,
  createdAt: `2024-01-0${i + 1}`
}));

export const MOCK_DOCS: Document[] = [
  {
    id: 'd1',
    name: 'Q4 Strategy.pdf',
    type: FileType.PDF,
    ownerId: 'u1',
    folderId: 'kebele-1',
    lastModified: '2024-03-15T10:30:00Z',
    size: '2.4 MB',
    currentVersion: 3,
    versions: [
      { id: 'v3', versionNumber: 3, updatedAt: '2024-03-15T10:30:00Z', author: 'Alex Rivera', changeNote: 'Final approval version', size: '2.4 MB' },
      { id: 'v2', versionNumber: 2, updatedAt: '2024-03-10T09:15:00Z', author: 'Sarah Chen', changeNote: 'Added SWOT analysis', size: '2.2 MB' },
      { id: 'v1', versionNumber: 1, updatedAt: '2024-03-01T14:00:00Z', author: 'Alex Rivera', changeNote: 'Initial draft', size: '1.8 MB' },
    ],
    tags: ['Strategy', 'Q4'],
    isStarred: true,
    isTrashed: false,
    previewContent: "STRATEGIC PLAN 2024 - QUARTER 4\n\nObjective: Market dominance in the EMEA region.\nGoals:\n1. Increase enterprise retention by 15%.\n2. Launch AI-native search capabilities.\n3. Expand Kebele-level support systems.\n\nRisk Assessment: Regulatory compliance in emerging markets is the primary bottleneck."
  },
  {
    id: 'd2',
    name: 'Employment_Agreement.docx',
    type: FileType.DOCX,
    ownerId: 'u1',
    folderId: 'kebele-2',
    lastModified: '2024-03-12T16:45:00Z',
    size: '450 KB',
    currentVersion: 1,
    versions: [
      { id: 'v1_d2', versionNumber: 1, updatedAt: '2024-03-12T16:45:00Z', author: 'Legal Team', changeNote: 'Standard template', size: '450 KB' },
    ],
    tags: ['Legal', 'HR'],
    isStarred: false,
    isTrashed: false,
    previewContent: "EMPLOYMENT AGREEMENT\n\nThis agreement is made between DocuMind Pro and the Employee.\n\nSection 1: Responsibilities\nThe Employee shall perform duties as outlined in the Job Description.\n\nSection 2: Compensation\nSalary shall be paid on the 25th of each month."
  },
  {
    id: 'd4',
    name: 'Site_Inspection_North.jpg',
    type: FileType.IMG,
    ownerId: 'u1',
    folderId: 'kebele-1',
    lastModified: '2024-03-22T11:20:00Z',
    size: '1.8 MB',
    currentVersion: 1,
    versions: [
      { id: 'v1_d4', versionNumber: 1, updatedAt: '2024-03-22T11:20:00Z', author: 'Field Agent', changeNote: 'Initial capture', size: '1.8 MB' },
    ],
    tags: ['Inspection', 'Field'],
    isStarred: false,
    isTrashed: false,
    previewUrl: 'https://images.unsplash.com/photo-1541888941259-7927394602ee?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'd3',
    name: 'Revenue_Projections.xlsx',
    type: FileType.XLSX,
    ownerId: 'u1',
    folderId: 'kebele-3',
    lastModified: '2024-03-20T08:00:00Z',
    size: '1.1 MB',
    currentVersion: 1,
    versions: [
      { id: 'v1_d3', versionNumber: 1, updatedAt: '2024-03-20T08:00:00Z', author: 'Finance', changeNote: 'Initial input', size: '1.1 MB' },
    ],
    tags: ['Finance', '2024'],
    isStarred: true,
    isTrashed: false,
    previewContent: "| Month | Projected | Actual |\n|-------|-----------|--------|\n| Jan   | $120k      | $125k   |\n| Feb   | $135k      | $130k   |\n| Mar   | $150k      | $155k   |"
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', docId: 'd1', docName: 'Q4 Strategy.pdf', action: 'Updated', user: 'Alex Rivera', timestamp: '2024-03-15T10:30:00Z' },
  { id: 'l2', docId: 'd3', docName: 'Revenue_Projections.xlsx', action: 'Created', user: 'Finance', timestamp: '2024-03-20T08:00:00Z' },
  { id: 'l3', docId: 'd1', docName: 'Q4 Strategy.pdf', action: 'Downloaded', user: 'Sarah Chen', timestamp: '2024-03-16T11:20:00Z' },
];

export const getFileIcon = (type: FileType) => {
  switch (type) {
    case FileType.PDF: return <FileText className="text-red-500" />;
    case FileType.DOCX: return <FileText className="text-blue-500" />;
    case FileType.XLSX: return <FileSpreadsheet className="text-green-500" />;
    case FileType.IMG: return <FileImage className="text-purple-500" />;
    default: return <FileCode className="text-slate-500" />;
  }
};
