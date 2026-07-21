// Promote an existing user to admin by email.
// Usage: node makeAdmin.js user@example.com
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`${email} is now an admin.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
