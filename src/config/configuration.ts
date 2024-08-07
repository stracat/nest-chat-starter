export default () => ({
  port: parseInt(process.env.WEB_PORT, 10) || 3000,
  mysql: {
    global: {
      host: process.env.MYSQL_GLOBAL_HOST,
      user: process.env.MYSQL_GLOBAL_USER,
      password: process.env.MYSQL_GLOBAL_PASSWORD,
      database: process.env.MYSQL_GLOBAL_DATABASE,
    },
    game1: {
      host: process.env.MYSQL_GAME1_HOST,
      user: process.env.MYSQL_GAME1_USER,
      password: process.env.MYSQL_GAME1_PASSWORD,
      database: process.env.MYSQL_GAME1_DATABASE,
    },
    admin: {
      host: process.env.MYSQL_ADMIN_HOST,
      user: process.env.MYSQL_ADMIN_USER,
      password: process.env.MYSQL_ADMIN_PASSWORD,
      database: process.env.MYSQL_ADMIN_DATABASE,
    },  
    log: {
      host: process.env.MYSQL_LOG_HOST,
      user: process.env.MYSQL_LOG_USER,
      password: process.env.MYSQL_LOG_PASSWORD,
      database: process.env.MYSQL_LOG_DATABASE,
    },  
  },
  redis: {
    base: { 
      url: process.env.REDIS_BASE_URL,
      password: process.env.REDIS_BASE_PASS 
    },
    chat: { 
      url: process.env.REDIS_CHAT_URL,
      password: process.env.REDIS_CHAT_PASS 
    },
    save: { 
      url: process.env.REDIS_SAVE_URL,
      password: process.env.REDIS_SAVE_PASS 
    },
    pubsub: { 
      url: process.env.REDIS_PUBSUB_URL,
      password: process.env.REDIS_PUBSUB_PASS
    },
  },
});
