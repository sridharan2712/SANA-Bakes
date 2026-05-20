const { SignJWT } = require('jose');

async function test() {
  try {
    const secret = new TextEncoder().encode('short'); // 5 bytes
    const token = await new SignJWT({ id: '1' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);
    console.log(token);
  } catch (err) {
    console.error('Error caught:', err.message);
  }
}

test();
