import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'placementor_super_secret_jwt_key_2025_secure_dev';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};
