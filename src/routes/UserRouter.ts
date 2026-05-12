import { Router } from "express";
import { IRouter } from "../types/IRouter";
import { IEntityController } from "../types/IEntityController";
import { IGetByEmail } from "../types/IGetByEmail";
import { Authorisation } from "../Middleware/Authorisation";


export class UserRouter implements IRouter {

    basePath: string = "/api/users";
    authenticate: boolean = true;

    constructor(private router: Router, private UserController: IEntityController & IGetByEmail) {
        console.log("UserRouter created")
        this.addRoutes();
    }


    public getRouter(): Router {
        return this.router;
    }

    private addRoutes() {
        console.log("User routes added")
        this.router.get('/', this.UserController.getAll);
        this.router.get('/email/:emailAddress', this.UserController.getByEmail);
        this.router.get('/:id', this.UserController.getById);

        this.router.post('/', Authorisation.authoriseRoles("admin"), this.UserController.create)
        this.router.delete('/:id', Authorisation.authoriseRoles("admin"), this.UserController.delete)
        this.router.patch('/:id', Authorisation.authoriseRoles("admin"), this.UserController.update)
    }
}