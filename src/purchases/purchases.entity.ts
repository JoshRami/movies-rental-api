import { User } from '../users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseDetail } from './purchases.detail.entity';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'purchaseDate',
  })
  createdAt: Date;

  @Column({ type: 'numeric', precision: 2 })
  total: number;

  @ManyToOne(() => User, (user) => user.purchases)
  user: User;

  @OneToMany(() => PurchaseDetail, (purchaseDetail) => purchaseDetail.purchase)
  purchaseDetails: PurchaseDetail[];
}
