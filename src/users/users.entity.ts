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
import { Rent } from '../rents/rents.entity';
import { Purchase } from '../purchases/purchases.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToOne(() => Role)
  @JoinColumn()
  role: Role;

  @OneToMany(() => Rent, (rent) => rent.user)
  rents?: Rent[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases?: Purchase[];
}
