// Secrets must be provided via environment or .env (not committed).
// Copy .env.example to .env and fill in NINE_ROUTER_API_KEY for OmniRoute.
module.exports = {
  apps: [
    {
      name: 'gsk',
      script: './boot-gsk.js',
      env: {
        GSK_MODEL: 'free'
      }
    },
    {
      name: 'sanctum',
      script: 'C:\\Users\\uncom\\Desktop\\final-run\\scribe-sanctum.js',
      cwd: 'C:\\Users\\uncom\\Desktop\\final-run'
    },
    {
      name: 'bridge',
      script: 'C:\\Users\\uncom\\Desktop\\final-run\\soulverse-bridge.js',
      cwd: 'C:\\Users\\uncom\\Desktop\\final-run'
    }
  ]
};
