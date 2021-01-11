import { User } from '../users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RentDetail } from './rents.detail.entity';

@Entity()
export class Rent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'purchaseDate',
  })
  createdAt: Date;

  @Column({ type: 'numeric', precision: 2 })
  total: number;

  @ManyToOne(() => User, (user) => user.rents)
  user: User;

  @OneToMany(() => RentDetail, (rentDetail) => rentDetail.rent)
  rentDetails: RentDetail[];
}
