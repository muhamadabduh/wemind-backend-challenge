import { Body, Controller, Param, Post, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post(':userId/sessions')
  createSession(
    @Param('userId') userId: string,
    @Body() createSessionDto: CreateSessionDto
  ) {
    return this.usersService.createSession(userId, createSessionDto)
  }

  @Get(':userId/sessions')
  getSession(
    @Param('userId') userId: string,
  ) {
    return this.usersService.getUserSessions(userId)
  }

  @Get(':userId/summary')
  async getSummary(
    @Param('userId') userId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.usersService.getSummary(userId, from, to);
  }

  @Get(':userId/streak')
  getStreak(@Param('userId') userId: string) {
    return this.usersService.getUserStreak(userId);
  }

  @Get(':userId/insights')
  getInsights(@Param('userId') userId: string) {
    return this.usersService.getUserInsights(userId);
  }

}
