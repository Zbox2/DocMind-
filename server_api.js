
/**
 * DocuMind Pro - SQL Server Bridge API
 * Dependencies: npm install express mssql cors dotenv multer
 */

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
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

// File Upload Configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Database Connection
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to MS SQL Server');
    } catch (err) {
        console.error('SQL Connection Error:', err);
    }
}

// Routes
// 1. Get All Documents
app.get('/api/documents', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Documents WHERE IsTrashed = 0`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Upload Document & Save Metadata
app.post('/api/documents', upload.array('files'), async (req, res) => {
    const { name, contractNumber, ownerId, folderId, size } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('ContractNumber', sql.NVarChar, contractNumber)
            .input('OwnerID', sql.UniqueIdentifier, ownerId)
            .input('Size', sql.NVarChar, size)
            .query(`INSERT INTO Documents (Name, ContractNumber, OwnerID, Size) 
                    VALUES (@Name, @ContractNumber, @OwnerID, @Size)`);
        
        res.status(201).json({ message: 'Document registered in SQL Server' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. Update Status (Star/Trash)
app.patch('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    const { isStarred, isTrashed } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('ID', sql.UniqueIdentifier, id)
            .input('IsStarred', sql.Bit, isStarred)
            .input('IsTrashed', sql.Bit, isTrashed)
            .query(`UPDATE Documents SET IsStarred = @IsStarred, IsTrashed = @IsTrashed 
                    WHERE ID = @ID`);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Bridge API running on port ${PORT}`);
    connectDB();
});
