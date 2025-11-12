import jwt from 'jsonwebtoken';

export const sign = (user) => {
  const token = jwt.sign(user, 'secret');
  return token;
}

export const verify = (token) => {
  try {
    return jwt.verify(token, 'secret');
  } catch (error) {
    return null;
  }
}
