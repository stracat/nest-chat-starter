module.exports = {
  apps: [{
    name: 'eoc-chat-server',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    merge_logs: true,
    autorestart: true,
    watch: false,  
  }]
};
