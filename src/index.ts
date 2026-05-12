import { Server } from "./server";
import { Router } from "express";
import { AppDataSource } from "./data_source";
import { LoginRouter } from "./routes/LoginRouter";
import { RoleRouter } from "./routes/RoleRouter";
import { UserRouter } from "./routes/UserRouter";
import { UserManagementRouter } from "./routes/UserManagementRouter";
import { LeaveRequestRouter } from "./routes/LeaveRequestRouter";
import { LoginController } from "./controllers/LoginController";
import { RoleController } from "./controllers/RoleController";
import { UserController } from "./controllers/UserController";
import { UserManagementController } from "./controllers/UserManagementController";
import { LeaveRequestController } from "./controllers/LeaveRequestController";
import { Role } from "./entity/Role";
import { User } from "./entity/User";
import { LeaveRequest } from "./entity/LeaveRequest";
import { UserManagement } from "./entity/UserManagement";

// Initialise the port
const DEFAULT_PORT = 8900
const port = process.env.SERVER_PORT || DEFAULT_PORT;

if (!process.env.SERVER_PORT) {
    console.log("PORT environment variable is not set, defaulting to " + DEFAULT_PORT);
}

// Initialise the data source
const appDataSource = AppDataSource;

// Instantiate/start the server
const routers = [
    new LoginRouter(Router(), new LoginController(AppDataSource.getRepository(User))), 
    new RoleRouter(Router(), new RoleController(AppDataSource.getRepository(Role))),
    new UserRouter(Router(), new UserController(AppDataSource.getRepository(User))),
    new LeaveRequestRouter(Router(), new LeaveRequestController(AppDataSource.getRepository(LeaveRequest),AppDataSource.getRepository(User),AppDataSource.getRepository(UserManagement))),
    new UserManagementRouter(Router(), new UserManagementController(AppDataSource.getRepository(UserManagement),AppDataSource.getRepository(User)))
]

const server = new Server(port, routers, appDataSource);
server.start();