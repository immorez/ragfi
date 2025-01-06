import { cleanEnv, port, str, url } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'], // Restrict NODE_ENV to specific values
    }),
    PORT: port(),
    DATABASE_URL: str(), // Validates the database connection string
    ELASTICSEARCH_URL: url(), // Ensures it's a valid URL
    ALPHA_VANTAGE_API_KEY: str(), // Alpha Vantage API key
    ALPHA_VANTAGE_BASE_URL: url(), // Base URL for Alpha Vantage API
  });
};
