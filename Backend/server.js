require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncModels } = require('./src/models');
const { seedDocumentTypes } = require('./src/seeders/documentTypes');
const { seedSuperAdmin } = require('./src/seeders/superadminSeeder');
const { seedKB } = require('./src/seeders/kbSeeder');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync models (set to true to force recreate tables - use cautiously!)
        await syncModels(false);

        // Seed default document types if none exist
        await seedDocumentTypes();

        // Seed default superadmin account
        await seedSuperAdmin();

        // Seed KB categories, articles, and files
        await seedKB();

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
