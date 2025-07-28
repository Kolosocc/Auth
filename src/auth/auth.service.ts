import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { AuthMethod, User } from '@prisma/client';
import { type Request, type Response } from 'express'; // Добавлен Response
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false
    );

    return this.saveSession(req, newUser);
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new InternalServerErrorException('User not found');
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new InternalServerErrorException(
        'Invalid password. Try again or reset password'
      );
    }

    return this.saveSession(req, user);
  }

  public logout(req: Request, res: Response): Promise<void> {
    // Теперь Response правильный
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(
            new InternalServerErrorException(
              'Error destroying session: ' + err.message
            )
          );
        } else {
          res.clearCookie(this.configService.get('SESSION_NAME')); // Исправлена опечатка
          resolve(); // Перенесено сюда
        }
      });
    });
  }

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Error saving session, check config params session: ' +
                err.message // Добавлено .message
            )
          );
        }
        resolve(user);
      });
    });
  }
}
