import { User } from '../users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne((type) => User, (user) => user.tokens, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;
}
