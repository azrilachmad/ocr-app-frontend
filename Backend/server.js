require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncModels } = require('./src/models');
const { seedDocumentTypes } = require('./src/seeders/documentTypes');
const { seedSuperAdmin } = require('./src/seeders/superadminSeeder');
// KB no longer uses seeder data — it displays real OCR documents from the documents table

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync models — 'alter' mode ensures new columns are added to existing tables
        await syncModels('alter');

        // Seed default document types if none exist
        await seedDocumentTypes();

        // Seed default superadmin account
        await seedSuperAdmin();

        // KB data comes from real OCR documents — no seeding needed

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Synchro Scan Backend Server                      ║
║                                                       ║
║   Server running on: http://localhost:${PORT}           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
