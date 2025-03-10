declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;

      // Database
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_PORT: string;

      // JWT Secrets
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;

      // Email Configuration
      MAIL_HOST: string;
      MAIL_PORT: string;
      AUTH_EMAIL: string;
      AUTH_EMAIL_PASSWORD: string;

      // CORS
      ALLOWED_ORIGINS?: string;

      // Rate Limiting
      RATE_LIMIT_WINDOW?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
    }
  }
}

// This export is needed to make this a module
export {};
