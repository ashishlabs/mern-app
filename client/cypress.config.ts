// cypress.config.ts
import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

// Load the environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,  // Use value from .env.local
    env: {
      API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,  // Use API URL from .env.local
    },
  },
});
