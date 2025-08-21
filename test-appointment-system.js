// Test script to verify appointment system is working
const testAppointmentSystem = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Appointment System...\n');
  
  // Test 1: Health check
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Backend health check passed');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Backend not running');
    return;
  }
  
  // Test 2: Appointments endpoint (should return 401 - needs auth)
  try {
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) {
      console.log('✅ Appointments POST endpoint exists (401 - needs auth)');
    } else {
      console.log('❌ Appointments POST endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Appointments POST endpoint error:', error.message);
  }
  
  // Test 3: Therapists endpoint
  try {
    const response = await fetch(`${baseUrl}/api/therapists`);
    if (response.status === 401) {
      console.log('✅ Therapists endpoint exists (401 - needs auth)');
    } else {
      console.log('❌ Therapists endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Therapists endpoint error:', error.message);
  }
  
  // Test 4: Therapist stats endpoint
  try {
    const response = await fetch(`${baseUrl}/api/therapists/stats`);
    if (response.status === 401) {
      console.log('✅ Therapist stats endpoint exists (401 - needs auth)');
    } else {
      console.log('❌ Therapist stats endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Therapist stats endpoint error:', error.message);
  }
  
  // Test 5: Assessment submit endpoint
  try {
    const response = await fetch(`${baseUrl}/api/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) {
      console.log('✅ Assessment submit endpoint exists (401 - needs auth)');
    } else {
      console.log('❌ Assessment submit endpoint issue:', response.status);
    }
  } catch (error) {
    console.log('❌ Assessment submit endpoint error:', error.message);
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- All endpoints should return 401 (authentication required)');
  console.log('- This indicates the endpoints exist and are properly protected');
  console.log('- Frontend should be able to access these through the proxy');
  console.log('\n🎯 Next Steps:');
  console.log('1. Test therapist signup with onboarding modal');
  console.log('2. Test client viewing therapists');
  console.log('3. Test appointment booking with payment');
  console.log('4. Test dashboard updates after booking');
};

// Run the test
testAppointmentSystem().catch(console.error);
