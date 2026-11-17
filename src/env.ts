// Loads backend-darmon/.env (if present) before any other module reads process.env
import * as fs from 'fs';

if (fs.existsSync('.env')) process.loadEnvFile('.env');
