const { createClient } = require('@supabase/supabase-js');

// Load env vars manually or hardcode for test script
const supabaseUrl = 'https://byucepwhtomdilhrvctz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dWNlcHdodG9tZGlsaHJ2Y3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTYwNzEsImV4cCI6MjA4NjA3MjA3MX0.pCN1yXTvvVY13EJFCiFuoflJse40IXk_pBe2T3Xu_LM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoadCities() {
    console.log('Testing loadCities...');
    const { data, error } = await supabase
        .from('villes_france')
        .select('id, name')
        .eq('is_major', true)
        .order('name');

    if (error) {
        console.error('❌ Error loading cities:', error);
    } else {
        console.log(`✅ Success! Loaded ${data.length} cities.`);
        if (data.length > 0) {
            console.log('First 3 cities:', data.slice(0, 3));
        } else {
            console.log('⚠️ No cities found.');
        }
    }
}

testLoadCities();
