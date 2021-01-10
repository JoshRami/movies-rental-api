import { User } from '../../users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PasswordToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: number;

  @ManyToOne(() => User, (user) => user.passwordTokens, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;
}
