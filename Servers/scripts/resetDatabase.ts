import { sequelize } from '../database/db';
import { createNewUserQuery } from "../utils/user.utils";
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import { insertMockData } from "../driver/autoDriver.driver";

const execAsync = promisify(exec);

async function resetDatabase() {
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

    // Run migrations
    await execAsync('npx sequelize db:migrate');
    console.log('Migrations applied.');

    // Create default admin user
    const password_hash = await bcrypt.hash("Verifywise#1", 10);
    const admin = {
      name: "VerifyWise",
      surname: "Admin",
      email: "verifywise@email.com",
      password: "Verifywise#1",
      confirmPassword: "Verifywise#1",
      role: 1,
      created_at: new Date(),
      last_login: new Date(),
      password_hash
    };

    await createNewUserQuery(admin);
    console.log('Default admin user created.');

    // Insert mock data (awaiting it to complete)
    await insertMockData();
    console.log('Mock data inserted.');

    process.exit(0);
  } catch (err) {
    console.error('Error resetting database:', err);
    process.exit(1);
  }
}

resetDatabase();
