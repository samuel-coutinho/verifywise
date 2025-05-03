'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Conditionally create the enum type if it doesn't exist
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_status_questions') THEN
            CREATE TYPE enum_status_questions AS ENUM ('Not started', 'In progress', 'Done');
          END IF;
        END $$;
      `, { transaction });

      // Add the column using the enum type
      await queryInterface.sequelize.query(`
        ALTER TABLE questions ADD COLUMN status enum_status_questions DEFAULT 'Not started';
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `ALTER TABLE questions DROP COLUMN status;`,
        { transaction }
      );
      // Drop the type (optional — only if you're sure it's unused elsewhere)
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS enum_status_questions;`,
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
