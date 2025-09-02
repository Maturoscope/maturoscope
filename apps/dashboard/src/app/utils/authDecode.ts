import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface JwtPayload {
  userName: string;
  userEmail: string;
  userId: string;
  userPicture: string;
  sub: string;
  userRoles: string[];
}

const AUTH0_ISSUER = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL;

const client = jwksClient({
  jwksUri: `${AUTH0_ISSUER}/.well-known/jwks.json`,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyToken(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        issuer: process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL + '/',
      },
      (err, decoded) => {
        if (err) {
          return reject(new Error(`Token verification failed: ${err.message}`));
        }
        if (decoded && typeof decoded === 'object') {
          resolve(decoded as JwtPayload);
        } else {
          reject(new Error('Token decoding failed - invalid token structure'));
        }
      },
    );
  });
}
