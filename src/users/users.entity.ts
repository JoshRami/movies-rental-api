import { Token } from '../tokens/tokens.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../users/roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany((type) => Token, (token) => token.user)
  tokens: Token[];

  @OneToOne(() => Role)
  @JoinColumn()
  role: Role;
}
