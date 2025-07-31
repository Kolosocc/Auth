import { BaseOAuthService } from './base-oath.service';
import { GithubProfile } from './types/github-profile';
import { TypeProviderOptions } from './types/provider-options.types';
import { TypeUserInfo } from './types/user-info.types';

export class GithubProvider extends BaseOAuthService {
  constructor(options: TypeProviderOptions) {
    super({
      name: 'github',
      // Исправлены URL для GitHub
      authorize_url: 'https://github.com/login/oauth/authorize',
      access_url: 'https://github.com/login/oauth/access_token',
      profile_url: 'https://api.github.com/user',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  protected async extractUserInfo(data: GithubProfile): Promise<TypeUserInfo> {
    const baseUserInfo = {
      id: data.id,
      email: data.email || '',
      name: data.name || data.login || '',
      picture: data.avatar_url || '',
    };

    return super.extractUserInfo(baseUserInfo);
  }
}
