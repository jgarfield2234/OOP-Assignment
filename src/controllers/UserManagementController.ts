import { Request, Response } from "express";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { instanceToPlain } from "class-transformer";
import { User } from "../entity/User";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { AppError } from "../helpers/AppError";
import { IEntityController } from "../types/IEntityController";
import { UserManagement } from "../entity/UserManagement";

export class UserManagementController implements IEntityController {
    constructor(private userManagementRepository: Repository<UserManagement>, private userRepository: Repository<User>) {}

    public getAll = async (req: Request, res: Response): Promise<void> => {
        const userManagement = await this.userManagementRepository.find({
            relations: ["user", "manager"]
        });

        if (userManagement.length === 0) {
            throw new AppError("No user management records in database", StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(userManagement));
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const userManagement = await this.userManagementRepository.findOne({
            where: { id },
            relations: ["user", "manager"]
        });

        if (!userManagement) {
            throw new AppError(
                `User management record with ID ${id} not found`,
                StatusCodes.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(userManagement));
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const {
            userId,
            managerId,
            startDate,
            endDate,
        } = req.body;

          if (userId !== undefined && managerId !== undefined && userId === managerId) {
            throw new AppError("A user cannot be their own manager", StatusCodes.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        const manager = await this.userRepository.findOne({
            where: { id: managerId }
        });

        if (!user) {
            throw new AppError("Invalid employee ID", StatusCodes.BAD_REQUEST);
        }

        if (!manager) {
            throw new AppError("Invalid manager ID", StatusCodes.BAD_REQUEST);
        }

        if (endDate && new Date(endDate) < new Date(startDate)) {
            throw new AppError(
                "End date cannot be before start date",
                StatusCodes.BAD_REQUEST
            );
        }

        const userManagement = new UserManagement();

        userManagement.user = user;
        userManagement.manager = manager;
        userManagement.startDate = startDate;
        userManagement.endDate = endDate;

        const errors = await validate(userManagement);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const newUserManagement = await this.userManagementRepository.save(userManagement);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(newUserManagement),
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
            managerId,
            startDate,
            endDate,
        } = req.body;

        const userManagement = await this.userManagementRepository.findOne({
            where: { id },
            relations: ["user", "manager"]
        });

        if (userId !== undefined && managerId !== undefined && userId === managerId) {
            throw new AppError("A user cannot be their own manager", StatusCodes.BAD_REQUEST);
        }

        if (!userManagement) {
            throw new AppError("User management record not found", StatusCodes.NOT_FOUND);
        }

        if (userId !== undefined) {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new AppError("Invalid employee ID", StatusCodes.BAD_REQUEST);
            }

            userManagement.user = user;
        }

        if (managerId !== undefined){
            const manager = await this.userRepository.findOne({ where: {id: managerId}});

            if (!manager){
                throw new AppError("Invalid manager ID", StatusCodes.BAD_REQUEST)
            }

            userManagement.manager = manager;
        }


        if (startDate !== undefined) userManagement.startDate = startDate;
        if (endDate !== undefined) userManagement.endDate = endDate;

        if (userManagement.endDate && new Date(userManagement.endDate) < new Date(userManagement.startDate)) {
            throw new AppError(
                "End date cannot be before start date",
                StatusCodes.BAD_REQUEST
            );
        }

        const errors = await validate(userManagement);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const updatedUserManagement = await this.userManagementRepository.save(userManagement);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(updatedUserManagement)
        );
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const result = await this.userManagementRepository.delete(id);

        if (result.affected === 0) {
            throw new AppError(
                `User management record with ID ${id} not found`,
                StatusCodes.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccessResponse(res, "User management record deleted", StatusCodes.OK);
    };

    public getEmployeesForManager = async (req: Request, res: Response): Promise<void> => {


        const managerId = parseInt(req.params.managerId as string);

        if (isNaN(managerId)) {
            throw new AppError("Invalid manager ID format", StatusCodes.BAD_REQUEST);
        }

        const userManagement = await this.userManagementRepository.find({
            where: { manager: { id: managerId }},
            relations: ["user", "manager"]
        });

        if (userManagement.length === 0) {
            throw new AppError(`No employees found for manager ID ${managerId}`, StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(userManagement));
    };

    public getManagerForEmployee = async (req: Request, res: Response): Promise<void> => {
        
        const userId = parseInt(req.params.userId as string);

        if (isNaN(userId)) {
            throw new AppError("Invalid employee ID format", StatusCodes.BAD_REQUEST);
        }

        const userManagement = await this.userManagementRepository.findOne({
            where: { user: { id: userId }},
            relations: ["user", "manager"]
        });

        if (!userManagement) {
            throw new AppError(`No manager found for employee ID ${userId}`, StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(userManagement));
    };
};