import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { Authorization } from 'src/auth/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  public async findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('all')
  public async getAll() {
    return this.userService.getAll();
  }

  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('by-id/:id')
  public async findById(@Param('id') userId: string) {
    console.log(userId);
    return this.userService.findById(userId);
  }
}
