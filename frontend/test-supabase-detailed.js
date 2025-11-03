// test-supabase-detailed.js
// Detailed diagnostic script for Supabase database relationships

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MDc3MiwiZXhwIjoyMDc0OTE2NzcyfQ.exrHxjmf4CkBqt0vi4wp599Ec1jvAkeL4GUy0v5lt4Q';

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 DETAILED SUPABASE DIAGNOSTICS');
console.log('==========================================');

async function checkTableInfo(tableName) {
  try {
    console.log(`\n📋 Table: ${tableName}`);
    console.log('-'.repeat(40));

    // Get sample data
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .limit(3);

    if (error) {
      console.log(`❌ Error accessing ${tableName}:`, error.message);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`✅ Sample data from ${tableName}:`);
      data.forEach((row, index) => {
        console.log(`\n   Row ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' :
                             value === undefined ? 'UNDEFINED' :
                             typeof value === 'object' ? JSON.stringify(value) :
                             String(value);
          console.log(`      ${key}: ${displayValue}`);
        });
      });
    } else {
      console.log(`ℹ️  Table ${tableName} is empty`);
    }

    return data;
  } catch (err) {
    console.log(`❌ Exception checking ${tableName}:`, err.message);
    return null;
  }
}

async function checkForeignKeys() {
  try {
    console.log('\n🔗 CHECKING FOREIGN KEY RELATIONSHIPS');
    console.log('==========================================');

    // Check trade_in_requests foreign keys
    console.log('\n1. Checking trade_in_requests foreign key relationships...');

    const tradeInData = await client
      .from('trade_in_requests')
      .select('id, user_id, new_car_id')
      .limit(5);

    if (tradeInData.data) {
      for (const record of tradeInData.data) {
        console.log(`\n   Trade-in ID: ${record.id}`);

        // Check if user exists
        if (record.user_id) {
          const { data: userData, error: userError } = await client
            .from('users')
            .select('id, username, email')
            .eq('id', record.user_id)
            .single();

          if (userError) {
            console.log(`      ❌ User ${record.user_id} not found: ${userError.message}`);
          } else {
            console.log(`      ✅ User found: ${userData.username} (${userData.email})`);
          }
        }

        // Check if car exists
        if (record.new_car_id) {
          const { data: carData, error: carError } = await client
            .from('cars')
            .select('id, brand, model, year')
            .eq('id', record.new_car_id)
            .single();

          if (carError) {
            console.log(`      ❌ Car ${record.new_car_id} not found: ${carError.message}`);
          } else {
            console.log(`      ✅ Car found: ${carData.brand} ${carData.model} (${carData.year})`);
          }
        }
      }
    }

    // Check trade_in_images foreign keys
    console.log('\n2. Checking trade_in_images foreign key relationships...');

    const imageData = await client
      .from('trade_in_images')
      .select('id, trade_in_id')
      .limit(5);

    if (imageData.data) {
      for (const record of imageData.data) {
        console.log(`\n   Image ID: ${record.id}`);

        if (record.trade_in_id) {
          const { data: tradeInRecord, error: tradeInError } = await client
            .from('trade_in_requests')
            .select('id, old_car_brand, old_car_model, status')
            .eq('id', record.trade_in_id)
            .single();

          if (tradeInError) {
            console.log(`      ❌ Trade-in ${record.trade_in_id} not found: ${tradeInError.message}`);
          } else {
            console.log(`      ✅ Trade-in found: ${tradeInRecord.old_car_brand} ${tradeInRecord.old_car_model} (${tradeInRecord.status})`);
          }
        }
      }
    }

  } catch (err) {
    console.log('❌ Error checking foreign keys:', err.message);
  }
}

async function testManualJoins() {
  try {
    console.log('\n🔄 TESTING MANUAL JOINS');
    console.log('==========================================');

    // Test manual join between trade_in_requests and users
    console.log('\n1. Manual join: trade_in_requests + users');

    const { data: tradeIns, error: tradeInError } = await client
      .from('trade_in_requests')
      .select('*')
      .limit(2);

    if (tradeInError) {
      console.log('❌ Error getting trade-ins:', tradeInError.message);
      return;
    }

    for (const tradeIn of tradeIns) {
      if (tradeIn.user_id) {
        const { data: user, error: userError } = await client
          .from('users')
          .select('id, username, email, role')
          .eq('id', tradeIn.user_id)
          .single();

        if (!userError && user) {
          console.log(`✅ Trade-in ${tradeIn.id} → User ${user.username} (${user.email}, Role: ${user.role})`);
        } else {
          console.log(`❌ Trade-in ${tradeIn.id} → User lookup failed: ${userError?.message}`);
        }
      }
    }

    // Test manual join between trade_in_requests and cars
    console.log('\n2. Manual join: trade_in_requests + cars');

    for (const tradeIn of tradeIns) {
      if (tradeIn.new_car_id) {
        const { data: car, error: carError } = await client
          .from('cars')
          .select('id, brand, model, year, price')
          .eq('id', tradeIn.new_car_id)
          .single();

        if (!carError && car) {
          console.log(`✅ Trade-in ${tradeIn.id} → Car ${car.brand} ${car.model} (${car.year}, $${car.price})`);
        } else {
          console.log(`❌ Trade-in ${tradeIn.id} → Car lookup failed: ${carError?.message}`);
        }
      }
    }

    // Test manual join between trade_in_images and trade_in_requests
    console.log('\n3. Manual join: trade_in_images + trade_in_requests');

    const { data: images, error: imageError } = await client
      .from('trade_in_images')
      .select('*')
      .limit(3);

    if (imageError) {
      console.log('❌ Error getting images:', imageError.message);
      return;
    }

    for (const image of images) {
      if (image.trade_in_id) {
        const { data: tradeIn, error: tradeInError } = await client
          .from('trade_in_requests')
          .select('id, old_car_brand, old_car_model, status')
          .eq('id', image.trade_in_id)
          .single();

        if (!tradeInError && tradeIn) {
          console.log(`✅ Image ${image.id} → Trade-in ${tradeIn.old_car_brand} ${tradeIn.old_car_model} (${tradeIn.status})`);
        } else {
          console.log(`❌ Image ${image.id} → Trade-in lookup failed: ${tradeInError?.message}`);
        }
      }
    }

  } catch (err) {
    console.log('❌ Error testing manual joins:', err.message);
  }
}

async function checkDatabaseSchema() {
  try {
    console.log('\n🗂️  CHECKING DATABASE SCHEMA');
    console.log('==========================================');

    // List all tables to see what's available
    console.log('\nChecking available tables...');

    const tables = [
      'users', 'cars', 'trade_in_requests', 'trade_in_images',
      'test_drive_requests', 'articles', 'article_categories'
    ];

    for (const table of tables) {
      const { data, error, count } = await client
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
      }
    }

  } catch (err) {
    console.log('❌ Error checking schema:', err.message);
  }
}

async function testDataIntegrity() {
  try {
    console.log('\n🔒 CHECKING DATA INTEGRITY');
    console.log('==========================================');

    // Check for orphaned records
    console.log('\n1. Checking for orphaned trade_in_requests...');

    const { data: orphanedTradeIns, error: orphanedError } = await client
      .from('trade_in_requests')
      .select('id, user_id, new_car_id')
      .or('user_id.is.null,user_id.eq.00000000-0000-0000-0000-000000000000')
      .or('new_car_id.is.null,new_car_id.eq.00000000-0000-0000-0000-000000000000');

    if (orphanedError) {
      console.log('❌ Error checking orphaned trade-ins:', orphanedError.message);
    } else {
      if (orphanedTradeIns && orphanedTradeIns.length > 0) {
        console.log(`⚠️  Found ${orphanedTradeIns.length} potentially orphaned trade-in requests:`);
        orphanedTradeIns.forEach(record => {
          console.log(`   - ID: ${record.id}, User ID: ${record.user_id}, Car ID: ${record.new_car_id}`);
        });
      } else {
        console.log('✅ No orphaned trade-in requests found');
      }
    }

    // Check for orphaned images
    console.log('\n2. Checking for orphaned trade_in_images...');

    const { data: orphanedImages, error: orphanedImagesError } = await client
      .from('trade_in_images')
      .select('id, trade_in_id')
      .or('trade_in_id.is.null,trade_in_id.eq.00000000-0000-0000-0000-000000000000');

    if (orphanedImagesError) {
      console.log('❌ Error checking orphaned images:', orphanedImagesError.message);
    } else {
      if (orphanedImages && orphanedImages.length > 0) {
        console.log(`⚠️  Found ${orphanedImages.length} potentially orphaned images:`);
        orphanedImages.forEach(record => {
          console.log(`   - Image ID: ${record.id}, Trade-in ID: ${record.trade_in_id}`);
        });
      } else {
        console.log('✅ No orphaned images found');
      }
    }

  } catch (err) {
    console.log('❌ Error checking data integrity:', err.message);
  }
}

// Main function
async function runDetailedDiagnostics() {
  console.log('Starting detailed Supabase diagnostics...\n');

  try {
    // Check each table structure
    await checkTableInfo('users');
    await checkTableInfo('cars');
    await checkTableInfo('trade_in_requests');
    await checkTableInfo('trade_in_images');

    // Check foreign key relationships
    await checkForeignKeys();

    // Test manual joins
    await testManualJoins();

    // Check database schema
    await checkDatabaseSchema();

    // Check data integrity
    await testDataIntegrity();

    console.log('\n✅ Detailed diagnostics completed!');

  } catch (error) {
    console.log('💥 Fatal error during diagnostics:', error.message);
  }
}

// Run the diagnostics
runDetailedDiagnostics();