import path from 'path';

const BASE_URL =
  (process.env.BASE_URL as string) || 'https://sipd-ri.kemendagri.go.id';

const AUTH_PROV = process.env.AUTH_PROV as string;
const AUTH_KOTA = process.env.AUTH_KOTA as string;
const AUTH_USERNAME = process.env.AUTH_USERNAME as string;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD as string;

const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

const TAHUN = process.env.TAHUN as string;

export {
  BASE_URL,
  TAHUN,
  AUTH_PROV,
  AUTH_KOTA,
  AUTH_USERNAME,
  AUTH_PASSWORD,
  AUTH_FILE,
};
