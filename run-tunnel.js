const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 3000,
      subdomain: 'sanabakes'
    });

    console.log(`your url is: ${tunnel.url}`);

    // Keep the Node.js event loop alive indefinitely
    setInterval(() => {}, 60000);

    tunnel.on('close', () => {
      console.log('tunnel closed, restarting...');
      process.exit(1);
    });

    tunnel.on('error', (err) => {
      console.error('tunnel error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('setup error:', err);
    process.exit(1);
  }
})();
