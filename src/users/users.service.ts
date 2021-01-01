import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update.role.dto';
import { Role } from './roles/role.entity';
import { Roles } from './roles/roles.enum';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async createUser(user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(user);
    const role = await this.roleRepository.findOne({ role: Roles.Client });
    newUser.role = role;
    return await this.userRepository.save(newUser);
  }

  async deleteUser(id: number): Promise<boolean> {
    const IS_AFFECTED = 1;
    const { affected } = await this.userRepository.delete(id);
    if (!affected) {
      throw new BadRequestException('User to delete not found');
    }
    return affected === IS_AFFECTED;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('the user to update is not found');
    }
    const updated = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    return updated;
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne(id, {
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User not found, id: ${id}`);
    }
    return user;
  }

  async findByCredentials(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ username, password });
    if (!user) {
      throw new NotFoundException(
        `User not found with the credentials: username: ${username}, password: ${password}`,
      );
    }
    return user;
  }

  async verifyAdmin(id: number): Promise<void> {
    const user = await this.getUser(id);
    const {
      role: { role },
    } = user;
    if (role !== Roles.Admin) {
      throw new UnauthorizedException(
        'Sorry only admins can perform this action',
      );
    }
  }

  async changeUserRole(
    toChangeUserRolId: number,
    updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const roleToChange = updateUserRoleDto.role;
    const user = await this.getUser(toChangeUserRolId);

    const roleToChangeEntity = await this.roleRepository.findOne({
      role: roleToChange,
    });

    if (user.role === roleToChangeEntity) {
      throw new BadRequestException(
        `The user with id: ${toChangeUserRolId} already has role: ${roleToChange}`,
      );
    }
    user.role = roleToChangeEntity;
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
}
