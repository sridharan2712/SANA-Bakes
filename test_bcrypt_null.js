const bcrypt = require('bcryptjs');
async function test() {
  try {
    const isMatch = await bcrypt.compare('password', null);
    console.log('Result:', isMatch);
  } catch (err) {
    console.error('Error caught:', err.message);
  }
}
test();
