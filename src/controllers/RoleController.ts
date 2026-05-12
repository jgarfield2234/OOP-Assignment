import { Request, response, Response } from 'express';
import { AppDataSource } from '../data_source';
import { Role } from '../entity/Role';
import { Repository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../helpers/ResponseHandler';
import { validate } from 'class-validator';
import { AppError } from '../helpers/AppError';
import { IEntityController } from '../types/IEntityController';

export class RoleController implements IEntityController{
    constructor(private roleRepository:Repository<Role>) {}

    // Get all Roles
    public getAll = async (req: Request, res: Response): Promise<void> =>{
    
        const roles = await this.roleRepository.find();

        // Error handling for no content
        if (roles.length === 0) {
            throw new AppError("No content found", StatusCodes.NO_CONTENT)
        }

        ResponseHandler.sendSuccessResponse(res, roles);
        
    };

    // Get Role by ID
    public getById = async (req: Request, res: Response): Promise<void> => {
        
        // Error handling to check if ID is a valid number
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST);
            
        }   


        const role = await this.roleRepository.findOne({ where: { id: id }});

        // Error handling for role not found
        if (!role) {
            throw new AppError(`Role not found with ID: ${id}`)
        }

        ResponseHandler.sendSuccessResponse(res, role)


    };
    
    // CREATE
    public create = async (req: Request, res: Response): Promise<void> => {
            
        const role = new Role()
        role.name = req.body.name;

        const errors = await validate(role);
        if (errors.length > 0){
            throw new Error (errors.map(err => Object.values(err.constraints || {})).join(",")); // need to learn
        }

        const newRole = await this.roleRepository.save(role);
        ResponseHandler.sendSuccessResponse(res, newRole, StatusCodes.CREATED)

    }

    // DELETE
    public delete = async (req: Request, res: Response): Promise <void> => {

        const id = req.params.id;

        if (!id){
            throw new AppError("No ID provided", StatusCodes.BAD_REQUEST)
        }

        const result = await this.roleRepository.delete(id);

        if (result.affected === 0){
            throw new AppError("Role not found", StatusCodes.NOT_FOUND)
        }

        ResponseHandler.sendSuccessResponse(res, "Role deleted")
    }

    // UPDATE
    public update = async(req: Request, res: Response): Promise <void> => {
        const id = parseInt(req.params.id as string);
        const name = req.body.name;

        if (isNaN(id)){
            throw new AppError("Invalid ID format", StatusCodes.BAD_REQUEST)
        }

        const role = await this.roleRepository.findOneBy({ id });

        if (!role){
            throw new AppError("Role not found", StatusCodes.NOT_FOUND)
        }

        if (name !== undefined) role.name = name;

        const errors = await validate(role);

        if (errors.length > 0){
            throw new Error (errors.map(err => Object.values(err.constraints || {})).join(",")); // need to learn
        }

        const updatedRole = await this.roleRepository.save(role);

        ResponseHandler.sendSuccessResponse(res, updatedRole)

    }
}