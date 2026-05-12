import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, IsNumber, Min } from "class-validator";

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    CreateDateColumn,
} from "typeorm";

import { Role } from "./Role";
import { Exclude } from "class-transformer";
import { PasswordHandler } from "../helpers/PasswordHandler";

@Entity({ name: "user" })
export class User {

    @PrimaryGeneratedColumn({ name: "userId" })
    id: number;

    @Column()
    @IsString()
    @IsNotEmpty({ message: "First name is required" })
    @MaxLength(100, { message: "First name must be at most 100 characters" })
    firstname: string;

    @Column()
    @IsString()
    @IsNotEmpty({ message: "Surname is required" })
    @MaxLength(100, { message: "Surname must be at most 100 characters" })
    surname: string;

    @Column({ unique: true })
    @IsEmail({}, { message: "Must be a valid email address" })
    email: string;

    @Column({ select: false })
    @Exclude()
    @IsString()
    @MinLength(10, {
        message: "Password must be at least 10 characters long"
    })
    password: string;

    @Column({ select: false })
    @Exclude()
    salt: string;

    @ManyToOne(() => Role, {
        nullable: false,
        eager: true
    })
    @JoinColumn({ name: "roleId" })
    @IsNotEmpty({ message: "Role is required" })
    role: Role;

    @Column({
        nullable: true
    })
    @IsString()
    @MaxLength(100, {
        message: "Department must be at most 100 characters"
    })
    department: string;

    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        default: 25.00
    })
    @IsNumber()
    @Min(0, {
        message: "Annual leave balance cannot be negative"
    })
    annualLeaveBalance: number;

    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    hashPassword() {

        if (!this.password) {
            throw new Error(
                "Password must be provided before inserting a user"
            );
        }

        const { hashedPassword, salt } =
            PasswordHandler.hashPassword(this.password);

        this.password = hashedPassword;
        this.salt = salt;
    }
}