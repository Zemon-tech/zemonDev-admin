const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create admin role for a user
const createAdminRole = async (userId, grantedByUserId) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid MongoDB ObjectId: ${userId}`);
    }
    
    if (!mongoose.Types.ObjectId.isValid(grantedByUserId)) {
      throw new Error(`Invalid MongoDB ObjectId: ${grantedByUserId}`);
    }

    // Import models dynamically
    const User = require('../src/models/user.model').default;
    const UserRole = require('../src/models/userRole.model').default;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if grantor user exists
    const grantorUser = await User.findById(grantedByUserId);
    if (!grantorUser) {
      throw new Error(`Grantor user with ID ${grantedByUserId} not found`);
    }

    // Check if role already exists
    const existingRole = await UserRole.findOne({ userId, role: 'admin' });
    if (existingRole) {
      console.log(`⚠️  User ${user.fullName} (${user.email}) already has admin role`);
      return existingRole;
    }

    // Create new admin role
    const adminRole = new UserRole({
      userId: new mongoose.Types.ObjectId(userId),
      role: 'admin',
      grantedBy: new mongoose.Types.ObjectId(grantedByUserId),
      grantedAt: new Date()
    });

    const savedRole = await adminRole.save();
    
    console.log(`✅ Admin role created successfully for ${user.fullName} (${user.email})`);
    console.log(`   Role ID: ${savedRole._id}`);
    console.log(`   Granted by: ${grantorUser.fullName}`);
    console.log(`   Granted at: ${savedRole.grantedAt}`);
    
    return savedRole;
  } catch (error) {
    console.error('❌ Error creating admin role:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node createAdmin.js <userId> <grantedByUserId>');
      console.log('Example: node createAdmin.js 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012');
      console.log('');
      console.log('Where:');
      console.log('  userId: MongoDB ObjectId of the user to make admin');
      console.log('  grantedByUserId: MongoDB ObjectId of the user granting the admin role');
      process.exit(1);
    }

    const [userId, grantedByUserId] = args;

    // Connect to database
    await connectDB();

    // Create admin role
    await createAdminRole(userId, grantedByUserId);

    console.log('🎉 Script completed successfully');
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminRole, connectDB };

