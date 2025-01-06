import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, ELASTICSEARCH_URL, ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL } =
  process.env;
