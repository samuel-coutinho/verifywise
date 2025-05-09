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
      const queries = [
        `ALTER TABLE questions DROP COLUMN status;`,
        `DROP TYPE enum_status_questions;`
      ]
      for (let query of queries) {
        await queryInterface.sequelize.query(query, { transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
