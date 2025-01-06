import { cleanEnv, port, str, url } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production'],
    }),
    PORT: port(),
    DATABASE_URL: str(),
    ELASTICSEARCH_URL: url(),
    ALPHA_VANTAGE_API_KEY: str(),
    ALPHA_VANTAGE_BASE_URL: url(),
    OPENAI_API_KEY: str(),
  });
};
