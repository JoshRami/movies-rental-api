import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTagDto } from './dto/create.tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './tags.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
  ) {}

  async createTag(tag: CreateTagDto): Promise<Tag> {
    const newTag = this.tagRepository.create(tag);
    return await this.tagRepository.save(newTag);
  }

  async deleteTag(id: number): Promise<boolean> {
    const IS_AFFECTED = 1;
    const { affected } = await this.tagRepository.delete(id);
    if (!affected) {
      throw new BadRequestException('Tag to delete not found');
    }
    return affected === IS_AFFECTED;
  }

  async updateTag(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.findOne(id);

    if (!tag) {
      throw new NotFoundException('The tag to update is not found');
    }
    const updated = await this.tagRepository.save({
      ...tag,
      ...updateTagDto,
    });

    return updated;
  }

  async getTag(id: number) {
    const tag = await this.tagRepository.findOne(id);
    if (!tag) {
      throw new NotFoundException(`Tag not found, id: ${id}`);
    }
    return tag;
  }

  async getTags() {
    const tags = await this.tagRepository.find();
    if (!tags) {
      throw new NotFoundException(`Tags not found`);
    }
    return tags;
  }

  async getTagsByIds(tagsIds: number[]) {
    const tags = await this.tagRepository.find({ id: In(tagsIds) });
    return tags;
  }
}
