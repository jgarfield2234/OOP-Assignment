import { Request, Response } from "express";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { instanceToPlain } from "class-transformer";
import { LeaveRequest, LeaveStatus } from "../entity/LeaveRequest";
import { User } from "../entity/User";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { AppError } from "../helpers/AppError";
import { IEntityController } from "../Types/IEntityController";
import { LeaveRequestHelper } from "../helpers/LeaveRequestHelper";
import { UserManagement } from "../entity/UserManagement";

export class LeaveRequestController implements IEntityController {
    constructor(private leaveRequestRepository: Repository<LeaveRequest>, private userRepository: Repository<User>, private userManagementRepository: Repository<UserManagement>) {}

    public getAll = async (req: Request, res: Response): Promise<void> => {
        const leaveRequests = await this.leaveRequestRepository.find({
            relations: ["user"]
        });

        if (leaveRequests.length === 0) {
            throw new AppError("No leave requests in database", StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(leaveRequests));
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!leaveRequest) {
            throw new AppError(
                `Leave request with ID ${id} not found`,
                StatusCodes.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(leaveRequest));
    };

    public getPendingRequestsForManager = async (req: Request, res: Response): Promise<void> => {

        const managerId = parseInt(req.params.managerId as string);

        if (isNaN(managerId)) {
            throw new AppError("Invalid manager ID format", StatusCodes.BAD_REQUEST);
        }

        const teamRelationships = await this.userManagementRepository.find({where: {manager: {id: managerId}},relations: ["user", "manager"]});

        if (teamRelationships.length === 0) {
            throw new AppError(`No employees found for manager ID ${managerId}`, StatusCodes.NOT_FOUND);
        }

        const employeeIds = teamRelationships.map(relationship => relationship.user.id);

        const pendingRequests = await this.leaveRequestRepository.createQueryBuilder("leaveRequest").leftJoinAndSelect("leaveRequest.user", "user").where("user.userId IN (:...employeeIds)", { employeeIds }).andWhere("leaveRequest.status = :status", {
                status: LeaveStatus.PENDING
            }).getMany();

        if (pendingRequests.length === 0) {throw new AppError(`No pending leave requests found for manager ID ${managerId}`, StatusCodes.NOT_FOUND);}

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(pendingRequests));
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const {
            userId,
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;

        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError("Invalid employee ID", StatusCodes.BAD_REQUEST);
        }

        if (new Date(endDate) < new Date(startDate)) {
            throw new AppError(
                "End date cannot be before start date",
                StatusCodes.BAD_REQUEST
            );
        }

        const requestedDays = LeaveRequestHelper.calculateLeaveDays(startDate, endDate);

        if (requestedDays > Number(user.annualLeaveBalance)){
            throw new AppError("Days requested exceed the remaining balance", StatusCodes.BAD_REQUEST)
        };

        const overlaps = await LeaveRequestHelper.hasOverlappingLeave(this.leaveRequestRepository, user.id, startDate, endDate);

        if (overlaps){
            throw new AppError("Date range overlaps with existing leave request", StatusCodes.BAD_REQUEST)
        }

        const leaveRequest = new LeaveRequest();

        leaveRequest.user = user;
        leaveRequest.leaveType = leaveType;
        leaveRequest.startDate = startDate;
        leaveRequest.endDate = endDate;
        leaveRequest.status = LeaveStatus.PENDING;
        leaveRequest.reason = reason;

        const errors = await validate(leaveRequest);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const newLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(newLeaveRequest),
            StatusCodes.CREATED
        );
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const {
            userId,
            leaveType,
            startDate,
            endDate,
            status,
            reason
        } = req.body;

        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!leaveRequest) {
            throw new AppError("Leave request not found", StatusCodes.NOT_FOUND);
        }

        if (userId !== undefined) {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new AppError("Invalid employee ID", StatusCodes.BAD_REQUEST);
            }

            leaveRequest.user = user;
        }

        if (leaveType !== undefined) leaveRequest.leaveType = leaveType;
        if (startDate !== undefined) leaveRequest.startDate = startDate;
        if (endDate !== undefined) leaveRequest.endDate = endDate;
        if (reason !== undefined) leaveRequest.reason = reason;

        if (new Date(leaveRequest.endDate) < new Date(leaveRequest.startDate)) {
            throw new AppError(
                "End date cannot be before start date",
                StatusCodes.BAD_REQUEST
            );
        }

        const errors = await validate(leaveRequest);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(updatedLeaveRequest)
        );
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const result = await this.leaveRequestRepository.delete(id);

        if (result.affected === 0) {
            throw new AppError(
                `Leave request with ID ${id} not found`,
                StatusCodes.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccessResponse(
            res,
            "Leave request deleted",
            StatusCodes.OK
        );
    };

    public approve = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!leaveRequest) {
            throw new AppError("Leave request not found", StatusCodes.NOT_FOUND);
        }

        if (leaveRequest.status === LeaveStatus.APPROVED){
            throw new AppError("Leave request already approved", StatusCodes.BAD_REQUEST)
        }

        const requestedDays = LeaveRequestHelper.calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);

        const user = leaveRequest.user;

        if (requestedDays > Number(user.annualLeaveBalance)){
            throw new AppError("Days requested exceed the remaining balance", StatusCodes.BAD_REQUEST)
        };

        user.annualLeaveBalance = Number(user.annualLeaveBalance) - requestedDays;

        leaveRequest.status = LeaveStatus.APPROVED;
        
        await this.userRepository.save(user);

        const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(updatedLeaveRequest)
        );
    };

    public reject = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);
        const { reason } = req.body;

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!leaveRequest) {
            throw new AppError("Leave request not found", StatusCodes.NOT_FOUND);
        }

        if (leaveRequest.status === LeaveStatus.APPROVED || leaveRequest.status === LeaveStatus.CANCELLED){
            throw new AppError("Already approved or cancelled leave requests cannot be rejected", StatusCodes.BAD_REQUEST)
        }

        leaveRequest.status = LeaveStatus.REJECTED;
        leaveRequest.reason = reason ?? "Leave request rejected";

        const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(updatedLeaveRequest)
        );
    };

    public cancel = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!leaveRequest) {
            throw new AppError("Leave request not found", StatusCodes.NOT_FOUND);
        }

        if (leaveRequest.status === LeaveStatus.CANCELLED) {
            throw new AppError("Leave request already cancelled", StatusCodes.BAD_REQUEST);
        }

        const user = leaveRequest.user;

        if (leaveRequest.status === LeaveStatus.APPROVED) {

            const requestedDays = LeaveRequestHelper.calculateLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
            user.annualLeaveBalance = Number(user.annualLeaveBalance) + requestedDays;

            await this.userRepository.save(user);
        }

        leaveRequest.status = LeaveStatus.CANCELLED;

        const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(updatedLeaveRequest)
        );
    };

    public getStatusByEmployee = async (req: Request, res: Response): Promise<void> => {
        const userId = parseInt(req.params.userId as string);

        if (isNaN(userId)) {
            throw new AppError("Invalid employee ID format", StatusCodes.BAD_REQUEST);
        }

        const leaveRequests = await this.leaveRequestRepository.find({where: { user: { id: userId } }, relations: ["user"]});

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(leaveRequests));
    };

    public getRemainingLeaveByEmployee = async (req: Request, res: Response): Promise<void> => {
        const userId = parseInt(req.params.userId as string);

        if (isNaN(userId)) {
            throw new AppError("Invalid employee ID format", StatusCodes.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError("Invalid employee ID", StatusCodes.BAD_REQUEST);
        }
        ResponseHandler.sendSuccessResponse(res, {employeeId: user.id, annualLeaveRemaining: Number(user.annualLeaveBalance)
        });
    };
}