import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dto/update.role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhitelistGuard } from 'src/auth/guards/jwt-whitelist.guard';
import { AdminsGuard } from 'src/auth/guards/roles-autho-guards';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return { data: user };
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User to delete not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async deleteUser(@Req() req) {
    const id = req.user.id;
    await this.userService.deleteUser(id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User to update not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description:
      'Error while interacting with the database, hint: please check you are not trying to submit data fields wich are uniques',
  })
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const id = req.user.id;
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    return { data: updatedUser };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async getUser(@Req() req) {
    const id = req.user.id;
    const user = await this.userService.getUser(id);
    return { data: user };
  }

  @Patch(':id/role')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The user role has been successfully change it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'You have  submitted wrong data' })
  @ApiResponse({
    status: 422,
    description: 'Error while interacting with the database',
  })
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    await this.userService.changeUserRole(id, updateUserRoleDto);
  }
}
