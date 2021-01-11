import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from './tags.entity';
import { TagsService } from './tags.service';
import * as TagsMocks from './mocks/tags-mocks';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;

  const mockRepo = {
    create: jest.fn().mockReturnValue(TagsMocks.mockTagModel),
    save: jest.fn().mockReturnValue(TagsMocks.mockTagModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    find: jest.fn().mockReturnValue(TagsMocks.tags.tags),
    findOne: jest.fn().mockReturnValue(TagsMocks.mockTagModel),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When create a tag', () => {
    it('should create the tag', async () => {
      const tag = await service.createTag(TagsMocks.mockAddTag);

      expect(mockRepo.create).toBeCalledWith(TagsMocks.mockAddTag);
      expect(mockRepo.save).toBeCalledTimes(1);
      expect(tag).toBe(TagsMocks.mockTagModel);
    });
  });

  describe('When deleting a tag', () => {
    it('should delete a tag', async () => {
      const id = TagsMocks.mockTagModel.id;
      const affected = await service.deleteTag(id);

      expect(mockRepo.delete).toBeCalledWith(id);
      expect(affected).toBe(true);
    });

    it('Should trowh error when tag have not been deleted', async () => {
      mockRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
      const nonExistentId = -1;
      try {
        await service.deleteTag(nonExistentId);
      } catch (error) {
        expect(mockRepo.delete).toBeCalledWith(nonExistentId);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Tag to delete not found');
      }
    });
  });

  describe('When updating a tag', () => {
    it('should update an tag', async () => {
      mockRepo.save = jest.fn().mockReturnValue(TagsMocks.mockUpdatedTagModel);
      const id = TagsMocks.mockTagModel.id;
      const tagUpdated = await service.updateTag(
        id,
        TagsMocks.mockUpdateTagParam,
      );

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(tagUpdated).toBe(TagsMocks.mockUpdatedTagModel);
    });

    it('should throw error when tag to update is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      const id = TagsMocks.mockTagModel.id;

      try {
        await service.updateTag(id, TagsMocks.mockUpdateTagParam);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('The tag to update is not found');
      }
    });
  });

  describe('When getting a tag by id', () => {
    it('should get a tag', async () => {
      const id = TagsMocks.mockTagModel.id;

      mockRepo.findOne = jest.fn().mockReturnValue(TagsMocks.mockTagModel);
      const tag = await service.getTag(id);

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(tag).toBe(TagsMocks.mockTagModel);
    });

    it('should throw when tag is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      const nonExistentId = -1;
      try {
        await service.getTag(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Tag not found, id: ${nonExistentId}`);
      }
    });
  });

  describe('When getting tags', () => {
    it('should get tags', async () => {
      const tags = await service.getTags();
      expect(tags).toBe(TagsMocks.tags.tags);
    });

    it('should throw error when there are not any tags', async () => {
      mockRepo.find = jest.fn().mockReturnValue([]);
      try {
        await service.getTags();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Tags not found');
      }
    });
  });

  describe('When getting tags by ids', () => {
    it('should get tags entities by id', async () => {
      mockRepo.find = jest.fn().mockReturnValue(TagsMocks.tags);

      const tags = await service.getTagsByIds([1, 2]);
      expect(tags).toBe(TagsMocks.tags);
    });
  });
});
