
/**
 * DocuMind Pro - SQL Server Bridge API
 * Dependencies: npm install express mssql cors dotenv multer
 */

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server Configuration
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrongPassword',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'DocuMind',
    options: {
        encrypt: true,
        trustServerCertificate: true // For local development
    }
};

// Use a connection pool to handle requests reliably
let poolPromise = sql.connect(dbConfig);

// File Upload Configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Routes
// 1. Get All Documents
app.get('/api/documents', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Documents WHERE IsTrashed = 0');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET Documents Error:', err);
        res.status(500).send(err.message);
    }
});

// 2. Upload Document & Save Metadata
app.post('/api/documents', upload.array('files'), async (req, res) => {
    const { id, name, contractNumber, ownerId, folderId, size } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('ContractNumber', sql.NVarChar, contractNumber)
            .input('OwnerID', sql.NVarChar, ownerId)
            .input('FolderID', sql.NVarChar, folderId)
            .input('Size', sql.NVarChar, size)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Documents WHERE ID = @ID)
                INSERT INTO Documents (ID, Name, ContractNumber, OwnerID, FolderID, Size) 
                VALUES (@ID, @Name, @ContractNumber, @OwnerID, @FolderID, @Size)
            `);
        
        res.status(201).json({ message: 'Document synchronized successfully' });
    } catch (err) {
        console.error('POST Document Error:', err);
        res.status(500).send(err.message);
    }
});

// 3. Update Status (Star/Trash)
app.patch('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    const { isStarred, isTrashed } = req.body;
    try {
        const pool = await poolPromise;
        const request = pool.request().input('ID', sql.NVarChar, id);
        
        let query = 'UPDATE Documents SET ';
        const updates = [];
        if (isStarred !== undefined) {
            request.input('IsStarred', sql.Bit, isStarred);
            updates.push('IsStarred = @IsStarred');
        }
        if (isTrashed !== undefined) {
            request.input('IsTrashed', sql.Bit, isTrashed);
            updates.push('IsTrashed = @IsTrashed');
        }
        
        if (updates.length === 0) return res.json({ message: 'No changes provided' });
        
        query += updates.join(', ') + ' WHERE ID = @ID';
        await request.query(query);
        
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error('PATCH Document Error:', err);
        res.status(500).send(err.message);
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Bridge API running on port ${PORT}`);
});
