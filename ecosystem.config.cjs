module.exports = {
  apps: [
    {
      name: 'gsk',
      script: './boot-gsk.js',
      env: {
        NINE_ROUTER_API_KEY: '8c93f68b603e4dd4abe7024856996052.hcuBSiEk1S6U8QuZUu8AMyal',
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
