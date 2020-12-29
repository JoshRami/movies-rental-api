import { CreateTagDto } from '../dto/create.tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { Tag } from '../tags.entity';

export const mockAddTag: CreateTagDto = {
  tag: 'thriller',
};

export const mockUpdateTagParam: UpdateTagDto = {
  tag: 'action',
};

export const mockTagModel: Tag = {
  id: 1,
  ...mockAddTag,
  movies: undefined,
};

export const mockUpdatedTagModel: Tag = {
  id: mockTagModel.id,
  tag: 'action',
  movies: undefined,
};

export const tags = { tags: [mockTagModel] };
