import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from './roles.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, default: Roles.Client })
  role: string;
}
