import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { AppError } from "../helpers/AppError";
import { STATUS_CODES } from "node:http";

export class Authorisation {

    public static authoriseRoles(...allowedRoles: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AppError("No token provided", StatusCodes.UNAUTHORIZED);
            }

            const token = authHeader.split(" ")[1];

            if (!token){
                throw new AppError("Invalid token format", StatusCodes.UNAUTHORIZED);
            }

            try {
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
                const userRole = decoded.token.role.name;

                if (!allowedRoles.includes(userRole)){
                    throw new AppError("You are not authorised to access this endpoint", StatusCodes.FORBIDDEN);
                }

                next();

            } catch (error){
                if (error instanceof AppError){
                    throw error;
                }
                throw new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
            }
        }
    }

}