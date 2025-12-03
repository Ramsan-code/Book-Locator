/**
 * Script to create admin user in the database
 * Run this from the backend/api directory
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin user data
const adminData = {
  name: "Super Admin",
  email: "admin@booklocator.com",
  password: "Admin@123456",
  role: "admin",
  isApproved: true,
  location: {
    type: "Point",
    coordinates: [0, 0]
  },
  bio: "System Administrator"
};

// MongoDB connection string - UPDATE THIS with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booklocator';

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get the Reader model (adjust the path if needed)
    const Reader = mongoose.model('Reader') || mongoose.model('readers');

    // Check if admin already exists
    const existingAdmin = await Reader.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('If you need to reset the password, delete this user first.');
      process.exit(0);
    }

    // Hash the password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    console.log('Creating admin user...');
    const admin = new Reader({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email:', adminData.email);
    console.log('  Password:', adminData.password);
    console.log('');
    console.log('You can now login at: http://localhost:3000/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. Check your MONGODB_URI connection string');
    console.error('3. Verify the Reader model exists in your backend');
    process.exit(1);
  }
}

// Run the script
createAdminUser();
