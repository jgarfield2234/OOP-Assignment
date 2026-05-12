import { Request, Response } from "express";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { validate } from "class-validator";
import { instanceToPlain } from "class-transformer";
import { AppError } from "../helpers/AppError";
import { IEntityController } from "../types/IEntityController";
import { IGetByEmail } from "../types/IGetByEmail";

export class UserController implements IEntityController, IGetByEmail {
    constructor(private userRepository: Repository<User>) {}

    public getAll = async (req: Request, res: Response): Promise<void> => {
        const users = await this.userRepository.find({
            relations: ["role"]
        });

        if (users.length === 0) {
            throw new AppError("No users in database", StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(users));
    };

    public getByEmail = async (req: Request, res: Response): Promise<void> => {
        const emailParam = req.params.emailAddress;

        if (typeof emailParam !== "string" || emailParam.trim().length === 0) {
            throw new AppError("Email is required", StatusCodes.BAD_REQUEST);
        }

        const email = emailParam.trim().toLowerCase();

        const user = await this.userRepository.findOne({
            where: { email },
            relations: ["role"]
        });

        if (!user) {
            throw new AppError(`${email} not found`, StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(user));
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["role"]
        });

        if (!user) {
            throw new AppError(`User with ID ${id} not found`, StatusCodes.NOT_FOUND);
        }

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(user));
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const {
            firstname,
            surname,
            email,
            password,
            roleId,
            department,
            annualLeaveBalance
        } = req.body;

        const user = new User();

        user.firstname = firstname;
        user.surname = surname;
        user.email = email;
        user.password = password;
        user.role = { id: roleId } as any;
        user.department = department;
        user.annualLeaveBalance = annualLeaveBalance ?? 25;

        const errors = await validate(user);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const newUser = await this.userRepository.save(user);

        ResponseHandler.sendSuccessResponse(
            res,
            instanceToPlain(newUser),
            StatusCodes.CREATED
        );
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const {
            firstname,
            surname,
            email,
            password,
            roleId,
            department,
            annualLeaveBalance
        } = req.body;

        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["role"]
        });

        if (!user) {
            throw new AppError("User not found", StatusCodes.NOT_FOUND);
        }

        if (firstname !== undefined) user.firstname = firstname;
        if (surname !== undefined) user.surname = surname;
        if (email !== undefined) user.email = email;
        if (password !== undefined) user.password = password;
        if (roleId !== undefined) user.role = { id: roleId } as any;
        if (department !== undefined) user.department = department;
        if (annualLeaveBalance !== undefined) {
            user.annualLeaveBalance = annualLeaveBalance;
        }

        const errors = await validate(user, {skipMissingProperties: true});

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat()
                .join(", ");

            throw new AppError(errorMessages, StatusCodes.BAD_REQUEST);
        }

        const updatedUser = await this.userRepository.save(user);

        ResponseHandler.sendSuccessResponse(res, instanceToPlain(updatedUser));
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
        }

        const result = await this.userRepository.delete(id);

        if (result.affected === 0) {
            throw new AppError(
                `User with ID ${id} not found`,
                StatusCodes.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccessResponse(res, "User deleted", StatusCodes.OK);
    };
}