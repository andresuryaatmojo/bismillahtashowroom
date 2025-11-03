// test-cars-structure.js
// Check the structure of the cars table to understand relationship issues

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ymviwplncjfvddqiuhgr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdml3cGxuY2pmdmRkcWl1aGdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM0MDc3MiwiZXhwIjoyMDc0OTE2NzcyfQ.exrHxjmf4CkBqt0vi4wp599Ec1jvAkeL4GUy0v5lt4Q';

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkCarsTableStructure() {
  console.log('🚗 CHECKING CARS TABLE STRUCTURE');
  console.log('==========================================');

  try {
    // Get sample car data
    const { data: cars, error } = await client
      .from('cars')
      .select('*')
      .limit(3);

    if (error) {
      console.log('❌ Error getting cars:', error.message);
      return;
    }

    if (cars && cars.length > 0) {
      console.log('✅ Cars table structure:');
      const columns = Object.keys(cars[0]);
      console.log('   Columns:');
      columns.forEach(column => {
        console.log(`     - ${column}`);
      });

      console.log('\n📋 Sample car data:');
      cars.forEach((car, index) => {
        console.log(`\n   Car ${index + 1}:`);
        console.log(`     ID: ${car.id}`);
        console.log(`     Title: ${car.title}`);
        console.log(`     Brand ID: ${car.brand_id}`);
        console.log(`     Model ID: ${car.model_id}`);
        console.log(`     Year: ${car.year}`);
        console.log(`     Price: ${car.price}`);
        console.log(`     Seller ID: ${car.seller_id}`);
      });

      // Check if there are brand_id and model_id foreign key tables
      console.log('\n🔗 CHECKING BRAND AND MODEL TABLES');
      console.log('==========================================');

      // Check if car_brands table exists
      const { data: brands, error: brandsError } = await client
        .from('car_brands')
        .select('*')
        .limit(5);

      if (brandsError) {
        console.log('❌ car_brands table not accessible:', brandsError.message);
      } else {
        console.log('✅ car_brands table exists:');
        brands.forEach(brand => {
          console.log(`   - ${brand.id}: ${brand.name}`);
        });
      }

      // Check if car_models table exists
      const { data: models, error: modelsError } = await client
        .from('car_models')
        .select('*')
        .limit(5);

      if (modelsError) {
        console.log('❌ car_models table not accessible:', modelsError.message);
      } else {
        console.log('✅ car_models table exists:');
        models.forEach(model => {
          console.log(`   - ${model.id}: ${model.name}`);
        });
      }

      // Check the specific car IDs from trade-in requests
      console.log('\n🔍 CHECKING SPECIFIC CAR IDs FROM TRADE-IN REQUESTS');
      console.log('==========================================');

      const tradeInCarIds = [
        'cf3b4da6-8800-47f7-9923-ee6037660b62',
        '8b4c6db7-74ad-4624-ace5-214352aa8a91'
      ];

      for (const carId of tradeInCarIds) {
        console.log(`\n   Checking car ID: ${carId}`);

        const { data: car, error: carError } = await client
          .from('cars')
          .select('*')
          .eq('id', carId)
          .single();

        if (carError) {
          console.log(`     ❌ Car not found: ${carError.message}`);
        } else {
          console.log(`     ✅ Car found: ${car.title} (${car.year})`);

          // Try to get brand and model info
          if (car.brand_id) {
            const { data: brand, error: brandError } = await client
              .from('car_brands')
              .select('name')
              .eq('id', car.brand_id)
              .single();

            if (!brandError && brand) {
              console.log(`        Brand: ${brand.name}`);
            } else {
              console.log(`        Brand lookup failed: ${brandError?.message}`);
            }
          }

          if (car.model_id) {
            const { data: model, error: modelError } = await client
              .from('car_models')
              .select('name')
              .eq('id', car.model_id)
              .single();

            if (!modelError && model) {
              console.log(`        Model: ${model.name}`);
            } else {
              console.log(`        Model lookup failed: ${modelError?.message}`);
            }
          }
        }
      }

    } else {
      console.log('ℹ️  Cars table is empty');
    }

  } catch (err) {
    console.log('❌ Error checking cars table:', err.message);
  }
}

// Run the check
checkCarsTableStructure().then(() => {
  console.log('\n✅ Cars table structure check completed!');
}).catch(error => {
  console.log('💥 Fatal error:', error.message);
});