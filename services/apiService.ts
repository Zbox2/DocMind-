
import { Document, FileType } from '../types';

const API_BASE = '/api'; // This works via the IIS Reverse Proxy defined in web.config

export const apiService = {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE}/documents`);
      
      // Handle cases where the Bridge API might not be configured yet
      if (response.status === 404) {
        console.warn('SQL Bridge API not found at /api/documents. Ensure IIS and Node.js bridge are running.');
        return [];
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL Sync Error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      // Don't throw for simple connection errors, just log and return empty
      console.error('SQL Connection failed:', error);
      return [];
    }
  },

  async uploadDocument(doc: Document, files: File[]): Promise<void> {
    const formData = new FormData();
    formData.append('id', doc.id);
    formData.append('name', doc.name);
    formData.append('contractNumber', doc.contractNumber || '');
    formData.append('ownerId', doc.ownerId);
    formData.append('folderId', doc.folderId || '');
    formData.append('size', doc.size);
    
    // Append actual files if provided
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        body: formData,
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
