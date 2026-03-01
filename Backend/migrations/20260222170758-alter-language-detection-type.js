'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Alter the column type to VARCHAR(10)
    await queryInterface.changeColumn('settings', 'language_detection', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'ID'
    });

    // 2. Update existing raw boolean/integer values to string values
    // '0' was typically ID (Indonesian), '1' was typically EN (English) based on typical true/false toggles of a single system but the UI default was Indonesian
    // Based on user feedback: ID -> Indonesian, EN -> English, AUTO -> Auto
    await queryInterface.sequelize.query(
      "UPDATE settings SET language_detection = 'ID' WHERE language_detection IN ('0', 'indonesia', 'false', '');"
    );
    await queryInterface.sequelize.query(
      "UPDATE settings SET language_detection = 'EN' WHERE language_detection IN ('1', 'english', 'true');"
    );
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Revert strings back to booleans
    await queryInterface.sequelize.query(
      "UPDATE settings SET language_detection = '0' WHERE language_detection = 'ID' OR language_detection = 'AUTO';"
    );
    await queryInterface.sequelize.query(
      "UPDATE settings SET language_detection = '1' WHERE language_detection = 'EN';"
    );

    // 2. Change column back to BOOLEAN
    await queryInterface.changeColumn('settings', 'language_detection', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    });
  }
};
