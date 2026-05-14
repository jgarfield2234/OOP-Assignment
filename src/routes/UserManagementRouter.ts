import { Router } from "express";

import { IRouter } from "../Types/IRouter";
import { IEntityController } from "../Types/IEntityController";
import { Authorisation } from "../Middleware/Authorisation";

export class UserManagementRouter implements IRouter {

    basePath: string = "/api/user-management";
    authenticate: boolean = true;

    constructor(private router: Router, private userManagementController: IEntityController & any) {
        console.log("userManagementRouter created");
        this.addRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private addRoutes() {

        console.log("User management routes added");

        this.router.get("/", this.userManagementController.getAll);
        this.router.get("/manager/:managerId", this.userManagementController.getEmployeesForManager);
        this.router.get("/user/:userId", this.userManagementController.getManagerForEmployee);
        this.router.get("/:id", this.userManagementController.getById);
        
        this.router.post("/", Authorisation.authoriseRoles("admin"), this.userManagementController.create);
        this.router.patch("/:id", Authorisation.authoriseRoles("admin"), this.userManagementController.update);
        this.router.delete("/:id", Authorisation.authoriseRoles("admin"), this.userManagementController.delete);
    }
}