import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { IsNotEmpty, IsDateString, IsOptional } from "class-validator";
import { User } from "./User";

@Entity({ name: "usermanagement" })
export class UserManagement {

    @PrimaryGeneratedColumn({ name: "id" })
    id: number;

    @ManyToOne(() => User, { nullable: false, eager: true })
    @JoinColumn({ name: "userId" })
    @IsNotEmpty({ message: "User is required" })
    user: User;

    @ManyToOne(() => User, { nullable: false, eager: true })
    @JoinColumn({ name: "managerId" })
    @IsNotEmpty({ message: "Manager is required" })
    manager: User;

    @Column({ type: "date"})
    @IsDateString({}, { message: "Start date must be valid" })
    startDate: string;

    @Column({ type: "date", nullable: true})
    @IsOptional()
    @IsDateString({}, { message: "End date must be valid" })
    endDate?: string;
}