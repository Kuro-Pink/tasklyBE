const getTime = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message, meta = null) => {
    console.log(`[INFO] ${getTime()} - ${message}`, meta || '');
  },

  warn: (message, meta = null) => {
    console.warn(`[WARN] ${getTime()} - ${message}`, meta || '');
  },

  error: (message, meta = null) => {
    console.error(`[ERROR] ${getTime()} - ${message}`, meta || '');
  },

  debug: (message, meta = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${getTime()} - ${message}`, meta || '');
    }
  },
};
