import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ProviderOptionsSymbol, TypeOptions } from './provider.constants';
import { BaseOAuthService } from './services/base-oath.service';
@Injectable()
export class ProviderService implements OnModuleInit {
  constructor(
    @Inject(ProviderOptionsSymbol) private readonly options: TypeOptions
  ) {}

  public onModuleInit() {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.baseUrl;
    }
  }

  public findByService(service: string): BaseOAuthService | null {
    return (
      this.options.services.find(
        (provider) => provider.name.toLowerCase() === service.toLowerCase()
      ) ?? null
    );
  }
}
