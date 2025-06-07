import { sequelize } from '../database/db';
import { createNewUserQuery } from "../utils/user.utils";
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import { insertMockData } from "../driver/autoDriver.driver";
import { QueryTypes } from 'sequelize';

const execAsync = promisify(exec);

async function resetDatabase() {
  const transaction = await sequelize.transaction();
  let committed = false;
  try {
    console.log('Resetting database...');

    // Drop all tables
    await sequelize.query(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT tablename FROM pg_tables 
              WHERE schemaname = current_schema() 
              AND tablename NOT LIKE 'spatial_ref_sys' -- optional: skip system tables
          ) LOOP
              EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
          END LOOP;
      END $$;
    `);
    console.log('All tables dropped.');

    await sequelize.query(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT n.nspname, t.typname
              FROM pg_type t
              JOIN pg_enum e ON t.oid = e.enumtypid
              JOIN pg_namespace n ON n.oid = t.typnamespace
              WHERE n.nspname = current_schema()
              GROUP BY n.nspname, t.typname
          ) LOOP
              EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
          END LOOP;
      END $$;
    `);
    console.log('All enum types dropped.');

    // Run migrations
    await execAsync('npx sequelize db:migrate');
    console.log('Migrations applied.');

    // Create default admin user
    const password_hash = await bcrypt.hash("Verifywise#1", 10);
    const adminData = {
      name: "VerifyWise",
      surname: "Admin",
      email: "verifywise@email.com",
      password: "Verifywise#1",
      confirmPassword: "Verifywise#1",
      role_id: 1,
      created_at: new Date(),
      last_login: new Date(),
      password_hash
    };

    const admin = await createNewUserQuery(adminData, transaction, true);
    await transaction.commit();
    committed = true;
    console.log('Default admin user created.');

    // Insert mock data (awaiting it to complete)
    await insertMockData();
    console.log('Mock data inserted.');

    // Fetch the first project to get its ID
    const project = await sequelize.query(
      'SELECT * FROM projects LIMIT 1',
      { type: QueryTypes.SELECT }
    );

    if (!project || project.length === 0) {
      throw new Error('No projects found in the database.');
    }
    const projectId = (project[0] as { id: number }).id;
    console.log(`Project found with ID: ${projectId}`);

    // Check if the admin user is already a member of the project
    const existingMember = await sequelize.query(
      'SELECT * FROM projects_members WHERE project_id = :project_id AND user_id = :user_id',
      {
        replacements: { project_id: projectId, user_id: admin.id },
        type: QueryTypes.SELECT,
      }
    );

    if (existingMember && existingMember.length > 0) {
      console.log('Admin user is already a member of the project.');
      console.log('Database reset successfully.');
      process.exit(0);
    }

    // Insert the admin user as a member of the project
    await sequelize.query(
      `INSERT INTO projects_members (project_id, user_id, is_demo) VALUES (:project_id, :user_id, :is_demo) RETURNING *`,
      {
        replacements: {
          project_id: projectId, user_id: admin.id, is_demo: true
        },
        type: QueryTypes.INSERT,
      }
    );

    console.log('Database reset successfully.');

    process.exit(0);
  } catch (err) {
    if (!committed) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
    }
    console.error('Error resetting database:', err);
    process.exit(1);
  }
}

resetDatabase();
