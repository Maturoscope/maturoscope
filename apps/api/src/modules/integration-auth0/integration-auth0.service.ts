import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class IntegrationAuth0Service {
  private readonly auth0Domain = process.env.AUTH0_ISSUER_URL!;
  private readonly clientId = process.env.AUTH0_CLIENT_ID!;
  private readonly clientSecret = process.env.AUTH0_CLIENT_SECRET!;
  private readonly audience = `${this.auth0Domain}api/v2/`;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    if (!this.auth0Domain || !this.clientId || !this.clientSecret) {
      throw new Error('Auth0 configuration is missing. Please check your environment variables.');
    }
    this.getAccessToken();
  }

  private async getAccessToken() {
    try {
      const response = await fetch(`${this.auth0Domain}oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: this.audience,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error getting token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set token expiry (typically 24 hours for client credentials)
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    } catch (error) {
      console.error('Error getting token from Auth0:', error);
      throw new HttpException(
        'Failed to authenticate with Auth0',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async ensureValidToken() {
    if (!this.accessToken || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
      await this.getAccessToken();
    }
  }

  private async getValidAccessToken(): Promise<string> {
    await this.ensureValidToken();
    if (!this.accessToken) {
      throw new HttpException('No access token available', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.accessToken;
  }

  // Get Management API Token (for server-to-server operations)
  async getManagementToken(): Promise<string> {
    return await this.getValidAccessToken();
  }

  // Get User Access Token (for user authentication)
  async getUserAccessToken(userCredentials: {
    username: string;
    password: string;
    audience?: string;
    scope?: string;
  }) {
    try {
      const response = await fetch(`${this.auth0Domain}oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          username: userCredentials.username,
          password: userCredentials.password,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: userCredentials.audience || this.audience,
          scope: userCredentials.scope || 'openid profile email',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.UNAUTHORIZED);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user access token from Auth0',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Get Token Info (decode and validate token)
  async getTokenInfo(token: string) {
    try {
      const response = await fetch(`${this.auth0Domain}userinfo`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.UNAUTHORIZED);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting token info from Auth0',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Refresh User Token
  async refreshUserToken(refreshToken: string, audience?: string) {
    try {
      const response = await fetch(`${this.auth0Domain}oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          audience: audience || this.audience,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.UNAUTHORIZED);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error refreshing token from Auth0',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Get Client Credentials Token (for machine-to-machine)
  async getClientCredentialsToken(audience?: string, scope?: string) {
    try {
      const response = await fetch(`${this.auth0Domain}oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: audience || this.audience,
          grant_type: 'client_credentials',
          scope: scope,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.UNAUTHORIZED);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting client credentials token from Auth0',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Get Authorization URL for login
  getAuthorizationUrl(params: {
    redirect_uri: string;
    response_type?: string;
    scope?: string;
    state?: string;
    audience?: string;
  }) {
    const url = new URL(`${this.auth0Domain}authorize`);
    
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', params.redirect_uri);
    url.searchParams.append('response_type', params.response_type || 'code');
    url.searchParams.append('scope', params.scope || 'openid profile email');
    if (params.state) {
      url.searchParams.append('state', params.state);
    }
    
    if (params.audience) {
      url.searchParams.append('audience', params.audience);
    }

    return url.toString();
  }

  // Exchange Authorization Code for Token
  async exchangeCodeForToken(code: string, redirect_uri: string) {
    try {
      const response = await fetch(`${this.auth0Domain}oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: redirect_uri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error exchanging code for token from Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Role Management
  async assignRoleToUser(userId: string, roles: string[]) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/users/${userId}/roles`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: roles }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return { message: 'Role assigned correctly' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error assigning role in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeRoleFromUser(userId: string, roleIds: string[]) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/users/${userId}/roles`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: roleIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return { message: 'Role removed correctly' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error removing role in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserRoles(userId: string) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/users/${userId}/roles`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting user roles from Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllRoles() {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/roles`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting roles from Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createRole(roleData: { name: string; description?: string; permissions?: string[] }) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/roles`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating role in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteRole(roleId: string) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/roles/${roleId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return { message: 'Role deleted correctly' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting role in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Permission Management
  async getPermissions() {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/permissions`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting permissions from Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/roles/${roleId}/permissions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return { message: 'Permissions assigned correctly' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error assigning permissions in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removePermissionsFromRole(roleId: string, permissions: string[]) {
    const accessToken = await this.getValidAccessToken();

    try {
      const url = `${this.auth0Domain}api/v2/roles/${roleId}/permissions`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(errorData, HttpStatus.BAD_REQUEST);
      }

      return { message: 'Permissions removed correctly' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error removing permissions in Auth0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
