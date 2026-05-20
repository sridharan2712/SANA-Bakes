const { SignJWT } = require('jose');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const JWT_SECRET = new TextEncoder().encode('fallback_secret_key_for_development_purposes');
    
    // Simulate user
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Hash generated:', hash);
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Is match:', isMatch);

    const token = await new SignJWT({ id: '1', email: 'test@test.com', role: 'USER' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
      
    console.log('Token generated:', token);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
