import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { IsNotEmpty, MaxLength, IsDateString, IsEnum } from "class-validator";
import { User } from "./User";

export enum LeaveStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    CANCELLED = "Cancelled"
}

export enum LeaveType {
    ANNUAL = "Annual Leave",
    SICK = "Sick Leave",
    UNPAID = "Unpaid Leave"
}

@Entity({ name: "leaverequest" })
export class LeaveRequest {

    @PrimaryGeneratedColumn({ name: "leaveRequestId" })
    id: number;

    @ManyToOne(() => User, { nullable: false, eager: true })
    @JoinColumn({ name: "userId" })
    @IsNotEmpty({ message: "User is required" })
    user: User;

    @Column({type: "enum", enum: LeaveType, default: LeaveType.ANNUAL})
    @IsEnum(LeaveType, { message: "Invalid leave type" })
    leaveType: LeaveType;

    @Column({ type: "date"})
    @IsDateString({}, { message: "Start date must be valid" })
    startDate: string;

    @Column({ type: "date"})
    @IsDateString({}, { message: "End date must be valid" })
    endDate: string;

    @Column({type: "enum", enum: LeaveStatus, default: LeaveStatus.PENDING})
    @IsEnum(LeaveStatus)
    status: LeaveStatus;

    @Column({nullable: true})
    @MaxLength(255, {message: "Reason must be at most 255 characters"})
    reason?: string;

    @CreateDateColumn()
    createdAt: Date;
}