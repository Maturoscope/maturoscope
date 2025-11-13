declare module 'googleapis' {
  import type { OAuth2Client } from 'google-auth-library';

  export const google: {
    auth: {
      OAuth2: new (
        clientId?: string | null,
        clientSecret?: string | null,
        redirectUri?: string | null,
      ) => OAuth2Client;
    };
  };
}

