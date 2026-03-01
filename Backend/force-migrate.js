const { sequelize } = require('./src/models');

async function migrate() {
    try {
        console.log("Connecting to Database...");
        await sequelize.authenticate();
        console.log("Altering language_detection to VARCHAR(10)...");

        // 1. Alter Column Type
        await sequelize.query('ALTER TABLE settings MODIFY language_detection VARCHAR(10) DEFAULT "ID"');

        // 2. Map old raw data to new codes
        await sequelize.query("UPDATE settings SET language_detection = 'ID' WHERE language_detection IN ('0', 'indonesia', 'false', '')");
        await sequelize.query("UPDATE settings SET language_detection = 'EN' WHERE language_detection IN ('1', 'english', 'true')");

        console.log("Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
