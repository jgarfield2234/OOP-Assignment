import { IsNotEmpty, isNotEmpty, Max, MaxLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "role" })
export class Role {
  @PrimaryGeneratedColumn({ name: "roleId"})
  id: number;

  @Column()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(30, { message: 'Name must be at most 30 characters' })
  name: string;
}

