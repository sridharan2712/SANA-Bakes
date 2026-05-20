const bcrypt = require('bcryptjs');
async function test() {
  try {
    const isMatch = await bcrypt.compare('password', 'not_a_hash');
    console.log('Result:', isMatch);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
