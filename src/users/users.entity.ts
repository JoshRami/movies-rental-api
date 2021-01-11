import { Token } from '../tokens/tokens.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../users/roles/role.entity';
import { Rent } from '../rents/rents.entity';
import { PasswordToken } from '../auth/password-tokens/passwords-token.entity';
import { Purchase } from '../purchases/purchases.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @ManyToOne(() => Role)
  @JoinColumn()
  role: Role;

  @OneToMany(() => Rent, (rent) => rent.user)
  rents?: Rent[];

  @OneToMany(() => PasswordToken, (passwordToken) => passwordToken.user)
  passwordTokens?: PasswordToken[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases?: Purchase[];
}
