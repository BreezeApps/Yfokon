import { writeFileSync } from 'fs';
import { join } from 'path';

const now = new Date();
const buildDateISO = now.toISOString(); // Format: 2025-02-21T15:30:45.123Z

const envContent = `VITE_BUILD_DATE=${buildDateISO}\n`;

try {
  writeFileSync(join(process.cwd(), '.env'), envContent, 'utf-8');
  console.log(`✓ Build date set to ${buildDateISO}`);
} catch (error) {
  console.error('Error writing .env file:', error);
  process.exit(1);
}

