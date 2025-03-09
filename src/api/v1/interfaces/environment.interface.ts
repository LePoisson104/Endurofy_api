declare namespace NodeJS {
  export interface ProcessEnv {
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    MAIL_PORT: string;
    MAIL_HOST: string;
    AUTH_EMAIL: string;
    AUTH_EMAIL_PASSWORD: string;
  }
}
