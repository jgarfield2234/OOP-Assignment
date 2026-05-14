import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedJWTRequest } from "../Types/IAuthenticatedJWTRequests";
import { Logger } from "./Logger";
import { ResponseHandler } from "./ResponseHandler";
import { StatusCodes } from "http-status-codes";
import { Server } from "../server";

export class MiddlewareFactory {

    static authenticateToken = (
        req: IAuthenticatedJWTRequest,
        res: Response,
        next: NextFunction
    ) => {

        const authHeader = req.headers.authorization;

        if (authHeader) {

            const tokenReceived = authHeader.split(" ")[1];

            if (!tokenReceived) {
                Logger.error(Server.ERROR_TOKEN_NOT_FOUND);

                return ResponseHandler.sendErrorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    Server.ERROR_TOKEN_NOT_FOUND
                );
            }

            if (!process.env.JWT_SECRET_KEY) {
                Logger.error(Server.ERROR_TOKEN_SECRET_NOT_DEFINED);

                return ResponseHandler.sendErrorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    Server.ERROR_TOKEN_SECRET_NOT_DEFINED
                );
            }

            jwt.verify(
                tokenReceived,
                process.env.JWT_SECRET_KEY as string,
                (err, payload) => {

                    if (err) {
                        Logger.error(Server.ERROR_TOKEN_IS_INVALID);

                        return ResponseHandler.sendErrorResponse(
                            res,
                            StatusCodes.UNAUTHORIZED,
                            Server.ERROR_TOKEN_IS_INVALID
                        );
                    }

                    const { token: { email, role } } = payload as any;

                    if (!email || !role) {

                        return ResponseHandler.sendErrorResponse(
                            res,
                            StatusCodes.UNAUTHORIZED,
                            Server.ERROR_TOKEN_IS_INVALID
                        );
                    }

                    req.signedInUser = { email, role };

                    next();
                }
            );

        } else {

            Logger.error(Server.ERROR_TOKEN_NOT_FOUND);

            ResponseHandler.sendErrorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                Server.ERROR_TOKEN_NOT_FOUND
            );
        }
    };
}