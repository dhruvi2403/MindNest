// Simple backend test script
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Backend Endpoints...\n');
  
  // Test health endpoint
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check:', data.message);
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log('❌ Backend not running on port 5000');
    console.log('   Make sure you run "npm start" in the backend folder');
    return;
  }
  
  // Test therapists endpoint (requires auth, so this will return 401)
  try {
    const response = await fetch(`${baseUrl}/api/therapists`);
    if (response.status === 401) {
      console.log('✅ Therapists endpoint exists (returns 401 - needs auth)');
    } else {
      console.log('❌ Therapists endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Therapists endpoint error:', error.message);
  }
  
  // Test assessment endpoint
  try {
    const response = await fetch(`${baseUrl}/api/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) {
      console.log('✅ Assessment submit endpoint exists (returns 401 - needs auth)');
    } else {
      console.log('❌ Assessment submit endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Assessment submit endpoint error:', error.message);
  }
  
  console.log('\n📋 Backend Status Summary:');
  console.log('- Make sure backend is running on port 5000');
  console.log('- Make sure frontend proxy is configured correctly');
  console.log('- All endpoints should return 401 (auth required) when not authenticated');
  console.log('- This is normal and expected behavior');
};

// Run the test
testEndpoints().catch(console.error);
