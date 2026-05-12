import express, { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { LoginRouter } from "./routes/LoginRouter"
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { StatusCodes } from "http-status-codes";
import { Logger } from "./helpers/Logger";
import { ResponseHandler } from "./helpers/ResponseHandler";
import jwt from 'jsonwebtoken';
import { IAuthenticatedJWTRequest } from "./types/IAuthenticatedJWTRequests";
import { IRouter } from "./types/IRouter";
import { AppError } from "./helpers/AppError";
import { ErrorHandler } from "./Middleware/ErrorHandler";
import { MiddlewareFactory } from "./helpers/MiddlewareFactory";


export class Server {
    public static readonly ERROR_TOKEN_IS_INVALID = "Not authorised - Token is invalid";
    public static readonly ERROR_TOKEN_NOT_FOUND = "Not authorised - Token not found";
    public static readonly ERROR_TOKEN_SECRET_NOT_DEFINED = "Not authorised - Token not defined;"

    private readonly app: express.Application;

    constructor(private readonly port: string | number, private readonly routers: IRouter[],  private readonly appDataSource: DataSource) {

        this.app = express();

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware() {
        this.app.use(express.json());
    }

    private initializeRoutes() {
        console.log("Registering routes");

        // Test route
        this.app.get("/api/users-test", (req, res) => {
            console.log("Users test route hit");
            res.send("Users test route works");
        });

        for (const route of this.routers){
            if (route.authenticate){
                this.app.use(route.basePath, MiddlewareFactory.authenticateToken, route.getRouter());
            } else {
                this.app.use(route.basePath, route.getRouter())
            }
        }

        // Main routes
    }

    private initializeErrorHandling() {
        this.app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
            ErrorHandler.handle(err, res);
});
    }

    public async start() {
        await this.initialiseDataSource();
        this.app.listen(this.port, () => {
            Logger.info(`Server is running on port ${this.port}`);
        });
    }

    private async initialiseDataSource() {
        try {
            console.log("Attempting connection")
            await this.appDataSource.initialize();
            Logger.info("Data Source has been initialized!");
            console.log("Runninhg")
        } catch (error) {
            Logger.error("Error during Data Source initialization:", error);
            console.log("Error with initialising")
            throw error;
        }
    }
}



// Could potentially add rate limiting if extra time?? --> Doc 3 of security lecture 
// Could potentially add log route access if extra time??