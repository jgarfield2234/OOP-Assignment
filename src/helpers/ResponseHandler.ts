import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Logger } from "./Logger";

export class ResponseHandler {

    public static sendErrorResponse(res: Response, statusCode: number, message: string = "An unexpected error occurred"):Response {
        const timestamp = new Date().toISOString();
        Logger.error(`Error: ${message}`,`${timestamp}`)

        const errorResponse = {
            error: {
                message: message,
                status: statusCode,
                timestamp: timestamp,
            }
        }

        return res.status(statusCode).json(errorResponse);
    }

    public static sendSuccessResponse(res: Response, data: any, statusCode: number = StatusCodes.OK):Response{
        const successResponse = {
            data:data
        }
        
        return res.status(statusCode).send(successResponse)
    }
}