// Test script to verify trade-in data reading
import { supabase } from './src/lib/supabase.js';

async function testTradeInData() {
  console.log('🔧 Testing Trade-In Data Reading...');

  try {
    // Test the query used in LayananTradeIn service
    const { data, error, count } = await supabase
      .from('trade_in_requests')
      .select(`
        *,
        new_car:cars(
          id,
          title,
          price,
          brand_id,
          model_id,
          year
        ),
        trade_in_images(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Query failed:', error);
      return false;
    }

    console.log('✅ Query successful!');
    console.log(`📊 Found ${count} total trade-in requests`);
    console.log(`📋 Retrieved ${data?.length || 0} records`);

    if (data && data.length > 0) {
      console.log('\n📝 Sample record:');
      const first = data[0];
      console.log(`  ID: ${first.id}`);
      console.log(`  Status: ${first.status}`);
      console.log(`  Old Car: ${first.old_car_brand} ${first.old_car_model} (${first.old_car_year})`);
      console.log(`  New Car: ${first.new_car?.title || 'N/A'}`);
      console.log(`  Images: ${first.images?.length || 0} images`);

      // Test new car relationship
      if (first.new_car) {
        console.log(`  New Car Details:`);
        console.log(`    Title: ${first.new_car.title}`);
        console.log(`    Price: Rp ${first.new_car.price?.toLocaleString('id-ID') || '0'}`);
        console.log(`    Year: ${first.new_car.year}`);
        console.log(`    Brand ID: ${first.new_car.brand_id}`);
        console.log(`    Model ID: ${first.new_car.model_id}`);
      }
    }

    return true;
  } catch (err) {
    console.error('❌ Test failed:', err);
    return false;
  }
}

// Run the test
testTradeInData().then(success => {
  if (success) {
    console.log('\n🎉 Trade-in data reading is working correctly!');
  } else {
    console.log('\n💥 Trade-in data reading has issues.');
  }
  process.exit(success ? 0 : 1);
});