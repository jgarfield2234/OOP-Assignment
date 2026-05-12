import { Response } from "express";
import { Logger } from "../helpers/Logger";
import { ResponseHandler } from "../helpers/ResponseHandler";
import { AppError } from "../helpers/AppError";
import { StatusCodes } from "http-status-codes";

export class ErrorHandler {

    static handle(err: AppError, res:Response): void {
        Logger.error(err.message);

        const statusCode = err instanceof AppError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;

        ResponseHandler.sendErrorResponse(res, statusCode, err.message || "Unexpected error")
    }
}
