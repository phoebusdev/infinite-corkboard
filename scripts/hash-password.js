#!/usr/bin/env node
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nAdd this to your .env.local:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
});
