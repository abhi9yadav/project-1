import crypto from 'crypto';

// Generate a random token. We email the raw token but store only its SHA-256
// hash, so a database leak can't be used to hijack verification/reset flows.
export const createToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(raw);
  return { raw, hash };
};

export const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');
