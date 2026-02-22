const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { User, sequelize } = require('./src/models');

const fixFeatures = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const users = await User.findAll();
        let fixed = 0;

        for (const user of users) {
            let currentFeatures = user.features;

            if (typeof currentFeatures === 'string') {
                try {
                    currentFeatures = JSON.parse(currentFeatures);
                } catch (e) { }
            }

            // Check if it's corrupted like {"0":"{"}
            if (currentFeatures && typeof currentFeatures === 'object' && currentFeatures['0'] === '{') {
                console.log(`Fixing corrupted features for user: ${user.email}`);

                // Restore default features
                user.features = { knowledgeBase: false, batchScan: true };
                await user.save();
                fixed++;
            } else if (typeof user.features === 'string') {
                // Even if it's not corrupted object, if it's saved as string incorrectly in DB, re-saving it as object
                user.features = currentFeatures || { knowledgeBase: false, batchScan: true };
                await user.save();
                fixed++;
            }
        }

        console.log(`Successfully fixed ${fixed} users with corrupted features payload.`);
        process.exit(0);
    } catch (e) {
        console.error('Error fixing DB:', e);
        process.exit(1);
    }
}

fixFeatures();
