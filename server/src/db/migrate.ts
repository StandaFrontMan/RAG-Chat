import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Checking database connection and running migrations...');

  try {
    const initSqlPath = path.resolve(__dirname, '../../../docker/init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');

    await pool.query(sql);
    console.log('✅ Migrations applied successfully!');

    // Check installed extensions
    const extRes = await pool.query(
      "SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp')"
    );
    console.log('\n📦 Installed Extensions:');
    extRes.rows.forEach((r) => console.log(`   - ${r.extname} (v${r.extversion})`));

    // Check created tables
    const tabRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('\n📊 Tables in public schema:');
    tabRes.rows.forEach((r) => console.log(`   - ${r.table_name}`));

    // Test a simple vector operation
    const vecTest = await pool.query("SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector AS cosine_dist");
    console.log(`\n🚀 Vector distance test passed: cosine_dist = ${vecTest.rows[0].cosine_dist}`);

    console.log('\n🎉 Database is ready for RAG and Chat!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
