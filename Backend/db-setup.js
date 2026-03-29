#!/usr/bin/env node

/**
 * Database Setup Script for Synchro Scan
 * =======================================
 * Use this script to initialize or update the database schema.
 *
 * Usage:
 *   node db-setup.js              — Alter mode (add missing columns, safe for production)
 *   node db-setup.js --force      — Force mode (DROP & recreate all tables — DESTROYS DATA!)
 *   node db-setup.js --seed       — Alter + run all seeders
 *   node db-setup.js --force-seed — Force + run all seeders (fresh install)
 */

require('dotenv').config();

const { testConnection } = require('./src/config/database');
const { syncModels } = require('./src/models');
const { seedDocumentTypes } = require('./src/seeders/documentTypes');
const { seedSuperAdmin } = require('./src/seeders/superadminSeeder');
const { seedKB } = require('./src/seeders/kbSeeder');

const args = process.argv.slice(2);
const isForce = args.includes('--force') || args.includes('--force-seed');
const shouldSeed = args.includes('--seed') || args.includes('--force-seed');

const run = async () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🗄️  Synchro Scan — Database Setup                   ║
╚═══════════════════════════════════════════════════════╝
    `);

    console.log(`Mode: ${isForce ? '⚠️  FORCE (drop & recreate)' : '🔄 ALTER (safe update)'}`);
    console.log(`Seed: ${shouldSeed ? '✅ Yes' : '❌ No'}`);
    console.log(`DB:   ${process.env.DB_NAME || 'synchro_scan_db'} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log('');

    if (isForce) {
        console.log('⚠️  WARNING: This will DROP and recreate ALL tables!');
        console.log('⚠️  All existing data will be PERMANENTLY LOST!');
        console.log('');

        // Give 3 seconds to abort
        console.log('Starting in 3 seconds... Press Ctrl+C to abort.');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    try {
        // 1. Test connection
        console.log('\n[1/3] Testing database connection...');
        await testConnection();

        // 2. Sync schema
        console.log('\n[2/3] Synchronizing database schema...');
        const mode = isForce ? 'force' : 'alter';
        await syncModels(mode);

        // 3. Seed data (optional)
        if (shouldSeed) {
            console.log('\n[3/3] Running seeders...');

            console.log('  → Seeding document types...');
            await seedDocumentTypes();

            console.log('  → Seeding superadmin account...');
            await seedSuperAdmin();

            console.log('  → Seeding Knowledge Base data...');
            await seedKB();

            console.log('✅ All seeders completed.');
        } else {
            console.log('\n[3/3] Skipping seeders (use --seed to run)');
        }

        console.log('\n✅ Database setup completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

run();
