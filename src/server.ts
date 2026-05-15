import express, { Request, Response, NextFunction } from "express";
import { DataSource } from "typeorm";
import { Logger } from "./helpers/Logger";
import { IRouter } from "./Types/IRouter";
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
            console.log("Running")
        } catch (error) {
            Logger.error("Error during Data Source initialization:", error);
            console.log("Error with initialising")
            throw error;
        }
    }
}
