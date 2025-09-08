declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_KEY: string;
  }
}
