import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { TypeBaseProviderOptions } from './types/base-provider.options.type';
import type { TypeUserInfo } from './types/user-info.types';

@Injectable()
export class BaseOAuthService {
  private _baseUrl: string;

  constructor(private readonly options: TypeBaseProviderOptions) {}

  protected async extractUserInfo(data: any): Promise<TypeUserInfo> {
    return {
      ...data,
      provider: this.options.name,
    };
  }

  getAuthUrl(): string {
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: this.options.client_id,
      redirect_uri: this.getRedirectUrl(),
      scope: this.options.scopes.join(' '),
      access_type: 'offline',
      prompt: 'select_account',
    });

    return `${this.options.authorize_url}?${query}`;
  }

  async findUserByCode(code: string): Promise<TypeUserInfo> {
    const client_id = this.options.client_id;
    const client_secret = this.options.client_secret;

    const tokenQuery = new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri: this.getRedirectUrl(),
      grant_type: 'authorization_code',
    });

    const tokenRequest = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    if (!tokenRequest.ok) {
      throw new BadRequestException(
        `Token request failed with status ${tokenRequest.status}: ${tokenRequest.statusText}`
      );
    }

    const tokenResponse = await tokenRequest.json();

    if (tokenResponse.error) {
      throw new BadRequestException(
        `OAuth error: ${tokenResponse.error} - ${tokenResponse.error_description || 'No description provided'}`
      );
    }

    if (!tokenResponse.access_token) {
      throw new BadRequestException('Access token not found in response');
    }

    const userRequest = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    if (!userRequest.ok) {
      throw new UnauthorizedException(
        `Failed to fetch user profile: ${userRequest.statusText} (Status: ${userRequest.status})`
      );
    }

    const user = await userRequest.json();
    const userData = await this.extractUserInfo(user);

    return {
      ...userData,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: tokenResponse.expires_in
        ? Date.now() + tokenResponse.expires_in * 1000
        : undefined,
      provider: this.options.name,
    };
  }

  getRedirectUrl(): string {
    const redirectUri = `${this._baseUrl}/auth/oauth/callback/${this.options.name}`;
    console.log('Generated redirect_uri:', redirectUri, this._baseUrl); // Отладочный вывод
    return redirectUri;
  }

  set baseUrl(value: string) {
    this._baseUrl = value;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  get name(): string {
    return this.options.name;
  }

  get access_url(): string {
    return this.options.access_url;
  }

  get profile_url(): string {
    return this.options.profile_url;
  }

  get scopes(): string[] {
    return this.options.scopes;
  }
}
