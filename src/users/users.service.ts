import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto) {
    const newUser = this.userRepository.create(user);
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
    const user = await this.userRepository.findOne(id);
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
}
