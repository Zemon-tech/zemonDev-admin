# Admin Management Scripts

This directory contains scripts for managing admin users in the zemonDev-admin system.

## Files

- `createAdmin.ts` - TypeScript version of the admin creation script
- `createAdmin.js` - JavaScript version that can be run directly
- `package.json` - Dependencies for the scripts
- `tsconfig.json` - TypeScript configuration

## Quick Start

### Option 1: Run JavaScript version directly (Recommended)

```bash
# Navigate to the scripts directory
cd backend-admin/scripts

# Run the script with MongoDB ObjectIds
node createAdmin.js <userId> <grantedByUserId>
```

### Option 2: Run TypeScript version

```bash
# Navigate to the scripts directory
cd backend-admin/scripts

# Install dependencies
npm install

# Run the script
npm run create-admin <userId> <grantedByUserId>
```

## Usage Examples

### Make a user admin:

```bash
# Replace with actual MongoDB ObjectIds
node createAdmin.js 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012
```

Where:
- `507f1f77bcf86cd799439011` = MongoDB ObjectId of the user to make admin
- `507f1f77bcf86cd799439012` = MongoDB ObjectId of the user granting the admin role

### Find MongoDB ObjectIds:

To get the MongoDB ObjectId for a user, you can:

1. **Use MongoDB Compass or MongoDB Shell:**
   ```javascript
   db.users.findOne({ clerkId: "user_31gY0PeD0KZg7qEOQYA20mF3jLQ" })
   ```

2. **Check your database directly:**
   ```bash
   # Connect to your MongoDB instance
   mongosh "mongodb+srv://phantom:Shivang.0@zemoncomm.5xcpete.mongodb.net/?retryWrites=true&w=majority&appName=zemonComm"
   
   # Find user by Clerk ID
   use your_database_name
   db.users.findOne({ clerkId: "user_31gY0PeD0KZg7qEOQYA20mF3jLQ" })
   ```

## What the Script Does

1. **Connects to MongoDB** using your environment variables
2. **Validates ObjectIds** to ensure they're in correct format
3. **Checks if users exist** in the database
4. **Creates admin role** in the UserRole collection
5. **Prevents duplicates** - won't create role if user is already admin
6. **Provides feedback** with success/error messages

## Output Example

```
✅ MongoDB connected successfully
✅ Admin role created successfully for John Doe (john@example.com)
   Role ID: 507f1f77bcf86cd799439013
   Granted by: Admin User
   Granted at: 2024-01-15T10:30:00.000Z
🎉 Script completed successfully
🔌 Database connection closed
```

## Troubleshooting

### Common Issues:

1. **"MONGODB_URI not found"**
   - Make sure you're running from the `backend-admin/scripts` directory
   - Check that `.env` file exists in `backend-admin/` directory

2. **"Invalid MongoDB ObjectId"**
   - Ensure you're using the actual MongoDB ObjectId (24 character hex string)
   - Not the Clerk ID (which looks like `user_31gY0PeD0KZg7qEOQYA20mF3jLQ`)

3. **"User not found"**
   - Verify the MongoDB ObjectId exists in your users collection
   - Check that you're connected to the correct database

4. **"MongoDB connection failed"**
   - Verify your MongoDB connection string in `.env`
   - Check network connectivity to MongoDB Atlas

## Security Notes

- The script requires two valid user ObjectIds
- Only existing users can grant admin roles
- The script validates all inputs before processing
- Admin roles are stored with audit trail (who granted, when granted)

