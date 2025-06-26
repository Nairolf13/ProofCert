import bcrypt from 'bcryptjs';

export async function hashToken(token: string) {
  return await bcrypt.hash(token, 12);
}

export async function compareToken(token: string, hash: string) {
  return await bcrypt.compare(token, hash);
}
