# Admin User Setup Guide

## Current Situation
- ✅ Frontend code is working correctly
- ❌ Admin user doesn't exist in database yet
- Backend is returning 401 Unauthorized

## Admin Credentials
```
Email: admin@booklocator.com
Password: Admin@123456
```

---

## Option 1: Run Existing Seed Script (Recommended)

### Step 1: Open Terminal
Open a new terminal window (Ctrl + `)

### Step 2: Navigate to Backend
```bash
cd /home/uki-technology-school/CODE/Book_Locator/api
```

### Step 3: Check for Seed Script
```bash
# Look for seed files
ls -la | grep -i seed

# Check package.json for seed command
cat package.json | grep -i seed
```

### Step 4: Run Seed Script
Try one of these commands (depending on what you found):
```bash
npm run seed
# OR
node src/seed.js
# OR
node scripts/seedAdmin.js
# OR
node seed.js
```

### Step 5: Verify Success
Look for a success message like:
```
✅ Admin user created successfully
```

---

## Option 2: Use the Script I Created

### Step 1: Copy the Script to Backend
```bash
# From the client directory
cp create-admin-user.js ../api/
cd ../api
```

### Step 2: Update MongoDB Connection
Edit the script and update the MONGODB_URI if needed:
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/booklocator';
```

### Step 3: Run the Script
```bash
node create-admin-user.js
```

---

## Option 3: Manual Database Creation

### Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to your database
3. Find the `readers` collection
4. Click "Add Data" → "Insert Document"
5. Paste this (you'll need to hash the password first):

```json
{
  "name": "Super Admin",
  "email": "admin@booklocator.com",
  "password": "$2b$10$[HASHED_PASSWORD_HERE]",
  "role": "admin",
  "isApproved": true,
  "location": {
    "type": "Point",
    "coordinates": [0, 0]
  },
  "bio": "System Administrator",
  "createdAt": { "$date": "2025-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-01-01T00:00:00.000Z" }
}
```

### Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Switch to your database
use booklocator

# Check if admin exists
db.readers.findOne({ email: "admin@booklocator.com" })

# If not exists, you need to hash the password first
# Then insert the document (see above JSON)
```

### Hash Password with Node
```bash
# In your backend directory
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123456', 10).then(hash => console.log(hash));"
```

---

## After Creating Admin User

### Test the Login
1. Go to: http://localhost:3000/admin/login
2. Enter:
   - Email: `admin@booklocator.com`
   - Password: `Admin@123456`
3. Click "Sign In"

### Expected Result
✅ Redirected to `/admin` dashboard  
✅ Navbar shows avatar (not "Sign In" button)  
✅ Click avatar → see dropdown with "Log out" option  
✅ All admin features accessible  

---

## Troubleshooting

### Still Getting 401 Error?
1. **Check backend console** for error messages
2. **Verify database connection**: Make sure MongoDB is running
3. **Check user in database**: 
   ```bash
   mongosh
   use booklocator
   db.readers.findOne({ email: "admin@booklocator.com" })
   ```
4. **Verify password hash**: Make sure password is hashed, not plain text
5. **Check role**: Make sure `role: "admin"` (not "reader")
6. **Check isApproved**: Make sure `isApproved: true`

### Backend Not Running?
```bash
cd /home/uki-technology-school/CODE/Book_Locator/api
npm start
# OR
npm run dev
```

### Need Help?
Share the error message from:
1. Backend console logs
2. Browser console (F12 → Console tab)
3. Network tab response (F12 → Network → click on "login" request → Response tab)
