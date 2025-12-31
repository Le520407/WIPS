const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

async function exportDatabaseSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 获取所有表名
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${tables.length} tables\n`);

    let schemaSQL = '';
    schemaSQL += '-- WhatsApp Platform Database Schema\n';
    schemaSQL += `-- Generated: ${new Date().toISOString()}\n`;
    schemaSQL += '-- Database: ' + process.env.DB_NAME + '\n\n';
    schemaSQL += '-- Drop existing tables (optional)\n';
    schemaSQL += '-- Uncomment the following lines if you want to drop existing tables\n\n';

    // 生成 DROP TABLE 语句
    for (const table of tables) {
      schemaSQL += `-- DROP TABLE IF EXISTS "${table.table_name}" CASCADE;\n`;
    }

    schemaSQL += '\n\n';

    // 为每个表生成 CREATE TABLE 语句
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📝 Exporting schema for: ${tableName}`);

      // 获取表结构
      const [columns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);

      // 获取主键
      const [primaryKeys] = await sequelize.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = '${tableName}'::regclass
        AND i.indisprimary;
      `);

      // 获取外键
      const [foreignKeys] = await sequelize.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = '${tableName}';
      `);

      // 获取索引
      const [indexes] = await sequelize.query(`
        SELECT
          i.relname AS index_name,
          a.attname AS column_name,
          ix.indisunique AS is_unique
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relname = '${tableName}'
        AND t.relkind = 'r'
        AND i.relname NOT LIKE '%_pkey'
        ORDER BY i.relname, a.attnum;
      `);

      // 生成 CREATE TABLE 语句
      schemaSQL += `-- Table: ${tableName}\n`;
      schemaSQL += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;

      const columnDefs = columns.map((col, index) => {
        let def = `  "${col.column_name}" `;
        
        // 数据类型
        if (col.data_type === 'character varying') {
          def += col.character_maximum_length 
            ? `VARCHAR(${col.character_maximum_length})` 
            : 'VARCHAR';
        } else if (col.data_type === 'timestamp without time zone') {
          def += 'TIMESTAMP';
        } else if (col.data_type === 'timestamp with time zone') {
          def += 'TIMESTAMPTZ';
        } else {
          def += col.data_type.toUpperCase();
        }

        // NOT NULL
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }

        // DEFAULT
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }

        return def;
      });

      schemaSQL += columnDefs.join(',\n');

      // 添加主键
      if (primaryKeys.length > 0) {
        const pkColumns = primaryKeys.map(pk => `"${pk.attname}"`).join(', ');
        schemaSQL += `,\n  PRIMARY KEY (${pkColumns})`;
      }

      schemaSQL += '\n);\n\n';

      // 添加外键
      if (foreignKeys.length > 0) {
        for (const fk of foreignKeys) {
          schemaSQL += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${tableName}_${fk.column_name}_fkey" `;
          schemaSQL += `FOREIGN KEY ("${fk.column_name}") `;
          schemaSQL += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}");\n`;
        }
        schemaSQL += '\n';
      }

      // 添加索引
      if (indexes.length > 0) {
        const indexGroups = {};
        indexes.forEach(idx => {
          if (!indexGroups[idx.index_name]) {
            indexGroups[idx.index_name] = {
              columns: [],
              unique: idx.is_unique
            };
          }
          indexGroups[idx.index_name].columns.push(`"${idx.column_name}"`);
        });

        for (const [indexName, indexInfo] of Object.entries(indexGroups)) {
          const uniqueStr = indexInfo.unique ? 'UNIQUE ' : '';
          schemaSQL += `CREATE ${uniqueStr}INDEX IF NOT EXISTS "${indexName}" `;
          schemaSQL += `ON "${tableName}" (${indexInfo.columns.join(', ')});\n`;
        }
        schemaSQL += '\n';
      }
    }

    // 保存到文件
    const outputPath = path.join(__dirname, 'database-schema.sql');
    fs.writeFileSync(outputPath, schemaSQL);

    console.log('\n✅ Schema exported successfully!');
    console.log(`📁 File saved to: ${outputPath}`);
    console.log(`📊 Total tables: ${tables.length}`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportDatabaseSchema();
