import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/database';
import { User } from './models/User';

dotenv.config();

const testLogin = async () => {
  await connectDB();
  const emailInput = 'saumyrajpoot666@gmail.com';
  const passwordInput = 'Admin@9987';

  console.log(`[Diagnostic] Searching for user with email: ${emailInput.toLowerCase()} or badge: ${emailInput.toUpperCase()}...`);

  const user = await User.findOne({
    $or: [
      { email: emailInput.toLowerCase() },
      { badgeNumber: emailInput.toUpperCase() },
    ],
  });

  if (!user) {
    console.error('[Diagnostic FAIL] No user found in MongoDB with that email or badge!');
    const allUsers = await User.find({}).select('email badgeNumber role name');
    console.log('[Diagnostic] All existing users in DB:', allUsers);
    process.exit(1);
  }

  console.log(`[Diagnostic FOUND] User found: ${user.name} (${user.badgeNumber}), Role: ${user.role}, Email: ${user.email}`);

  const isMatch = await bcrypt.compare(passwordInput, user.passwordHash);
  console.log(`[Diagnostic Password Compare]: ${isMatch ? 'SUCCESS (Password Matches!)' : 'FAIL (Password does NOT match!)'}`);

  process.exit(0);
};

testLogin();
