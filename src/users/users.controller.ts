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
  @ApiResponse({ status: 400, description: 'User to delete not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiResponse({ status: 400, description: 'User to update not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const id = req.user.id;
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    return { data: updatedUser };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUser(@Req() req) {
    const id = req.user.id;
    const user = await this.userService.getUser(id);
    return { data: user };
  }

  @Post(':id/role')
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiResponse({
    status: 204,
    description: 'The user role has been successfully change it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    await this.userService.changeUserRole(id, updateUserRoleDto);
  }
}
