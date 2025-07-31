import { BaseOAuthService } from './base-oath.service';

import { TypeProviderOptions } from './types/provider-options.types';
import { TypeUserInfo } from './types/user-info.types';
import { YandexProfile } from './types/yandex-profile';

export class YandexProvider extends BaseOAuthService {
  constructor(options: TypeProviderOptions) {
    super({
      name: 'yandex',
      authorize_url: 'https://oauth.yandex.ru/authorize', // Исправлено: ouath → oauth
      access_url: 'https://oauth.yandex.ru/token', // Исправлено: ouath → oauth
      profile_url: 'https://login.yandex.ru/info?format=json',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  public async extractUserInfo(data: YandexProfile): Promise<TypeUserInfo> {
    return super.extractUserInfo({
      email: data.emails[0],
      name: data.display_name,
      picture: data.default_avatar_id
        ? 'https://avatars.yandex.net/get-yapic/' +
          data.default_avatar_id +
          '/islands-200'
        : undefined,
    });
  }
}
