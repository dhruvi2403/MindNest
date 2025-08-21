// Script to create therapist profiles for users who are therapists but don't have profiles
const { MongoClient } = require('mongodb');

async function fixMissingTherapists() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('mindnest');
    
    // Find all users with role 'therapist'
    const therapistUsers = await db.collection('users').find({ role: 'therapist' }).toArray();
    console.log(`Found ${therapistUsers.length} therapist users`);
    
    // Find existing therapist profiles
    const existingTherapists = await db.collection('therapists').find({}).toArray();
    const existingUserIds = existingTherapists.map(t => t.userId.toString());
    console.log(`Found ${existingTherapists.length} existing therapist profiles`);
    
    // Create profiles for missing therapists
    const missingTherapists = therapistUsers.filter(user => 
      !existingUserIds.includes(user._id.toString())
    );
    
    console.log(`Creating profiles for ${missingTherapists.length} missing therapists`);
    
    for (const user of missingTherapists) {
      const therapistProfile = {
        userId: user._id,
        specialization: ['General Counseling'], // Default specialization
        bio: `Experienced mental health professional dedicated to helping clients achieve their wellness goals.`,
        location: 'Available Online',
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        rating: 4.5,
        verified: false,
        licenseNumber: 'LIC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        education: 'Master\'s in Clinical Psychology',
        yearsOfPractice: '5',
        onboarded: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('therapists').insertOne(therapistProfile);
      console.log(`Created profile for ${user.name}`);
    }
    
    console.log('✅ All missing therapist profiles created!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Run the script
fixMissingTherapists();
