
import { Document, FileType } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE}/documents`);
      
      if (response.status === 404) {
        console.warn('SQL Bridge API not found. Check IIS Proxy settings.');
        return [];
      }

      if (!response.ok) {
        throw new Error(`SQL Fetch Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SQL Connection failed:', error);
      return [];
    }
  },

  async uploadDocument(doc: Document): Promise<void> {
    try {
      // Sending as JSON to simplify Base64 handling on the SQL Server Bridge
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          name: doc.name,
          contractNumber: doc.contractNumber || '',
          type: doc.type,
          ownerId: doc.ownerId,
          folderId: doc.folderId || '',
          size: doc.size,
          fileData: doc.fileData // This contains the Base64 string
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to sync upload to SQL Server:', error);
      throw error;
    }
  },

  async updateDocumentStatus(id: string, status: { isStarred?: boolean, isTrashed?: boolean }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });

      if (!response.ok) {
        console.warn(`Failed to update status in SQL for ${id}`);
      }
    } catch (error) {
      console.error('SQL Status update failed:', error);
    }
  }
};
