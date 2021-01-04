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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WhitelistGuard } from 'src/auth/guards/jwt-whitelist.guard';
import { AdminsGuard } from 'src/auth/guards/roles-autho-guards';
import { CreateTagDto } from './dto/create.tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createTag(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.createTag(createTagDto);
    return { data: tag };
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The tag has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Tag to delete not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    await this.tagsService.deleteTag(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WhitelistGuard, AdminsGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The tag has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Tag to update not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateTagDto,
  ) {
    const updatedTag = await this.tagsService.updateTag(id, updateUserDto);
    return { data: updatedTag };
  }

  @Get(':id')
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const tag = await this.tagsService.getTag(id);
    return { data: tag };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The tags has been successfully return it.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'movie not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTags() {
    const tags = await this.tagsService.getTags();
    return { data: tags };
  }
}
