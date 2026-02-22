const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { sequelize } = require('./src/config/database');
const { DataTypes } = require('sequelize');

const migrateDocumentTypes = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB for migration');

        // 1. Manually add defined column (matching sequelize's underscored expectations)
        try {
            await sequelize.query('ALTER TABLE `document_types` ADD COLUMN `user_id` INTEGER AFTER `id`;');
            console.log('Added user_id column to document_types table.');
        } catch (e) {
            console.log('user_id column might already exist. Proceeding...');
        }

        // 2. Define the Raw Models explicitly mapping field names
        const RawUser = sequelize.define('User', { id: { type: DataTypes.INTEGER, primaryKey: true } }, { tableName: 'users', timestamps: false });
        const RawTempDocType = sequelize.define('DocumentType', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
            name: { type: DataTypes.STRING },
            description: { type: DataTypes.STRING },
            fields: { type: DataTypes.JSON },
            active: { type: DataTypes.BOOLEAN }
        }, { tableName: 'document_types', timestamps: true, underscored: true });

        // 3. Fetch all existing global document types (where user_id is NULL)
        const globalTypes = await RawTempDocType.findAll();

        if (globalTypes.length === 0) {
            console.log('No global document types found. Exiting.');
            process.exit(0);
        }

        const users = await RawUser.findAll();
        let createdCount = 0;

        // 4. For each user, clone the global types
        for (const user of users) {
            for (const globalType of globalTypes) {
                // Only duplicate if it was an original global type (meaning it doesn't currently belong to someone)
                if (!globalType.userId) {
                    await RawTempDocType.create({
                        userId: user.id,
                        name: globalType.name,
                        description: globalType.description,
                        fields: globalType.fields,
                        active: globalType.active
                    });
                    createdCount++;
                }
            }
        }

        // 5. Delete the original global types (the ones where user_id is null)
        await RawTempDocType.destroy({ where: { userId: null } });

        console.log(`Migration complete. Copied ${createdCount} document templates across ${users.length} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateDocumentTypes();
