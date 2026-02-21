const { User, Settings } = require('../models');

/**
 * Seed default superadmin account
 */
const seedSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await User.findOne({
            where: { role: 'superadmin' }
        });

        if (!existingSuperAdmin) {
            const superadmin = await User.create({
                email: 'superadmin@synchroscan.com',
                password: 'SuperAdmin123!',
                name: 'Super Admin',
                role: 'superadmin',
                isActive: true,
                features: {
                    knowledgeBase: true,
                    batchScan: true
                }
            });

            await Settings.create({ userId: superadmin.id });

            console.log('✅ Default superadmin account created.');
            console.log('   Email: superadmin@synchroscan.com');
            console.log('   Password: SuperAdmin123!');
            console.log('   ⚠️  Please change the password after first login!');
        } else {
            console.log('ℹ️  Superadmin account already exists.');
        }
    } catch (error) {
        console.error('❌ Error seeding superadmin:', error.message);
    }
};

module.exports = { seedSuperAdmin };
