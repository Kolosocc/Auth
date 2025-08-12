import { Injectable } from '@nestjs/common';
import { AuthMethod, User } from '@prisma/client';
import { hash } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}
  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  public async getAll() {
    return this.prismaService.user.findMany({
      include: {
        accounts: true,
      },
    });
  }

  public async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: true,
      },
    });

    return user;
  }

  public async create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean
  ): Promise<User> {
    const existing = await this.prismaService.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existing) {
      return existing;
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: password ? await hash(password) : '',
        displayName,
        picture,
        method,
        isVerified,
      },
      include: {
        accounts: true,
      },
    });

    return user;
  }
}
