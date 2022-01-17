import {
  BaseEntity,
  Column,
  Entity,
  Exclusion,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  spotifyId: string;

  @Column()
  spotifyAccessToken: string;

  @Column()
  spotifyRefreshToken: string;

  @Column()
  spotifyExpiresIn: number;

  @Column()
  spotifyImageUrl: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  __json: string;
}
