import { Router } from "express";
import { IRouter } from "../types/IRouter";
import { IEntityController } from "../types/IEntityController";


export class RoleRouter implements IRouter {

    basePath: string = "/api/roles";
    authenticate: boolean = true;


    constructor(private router: Router, private roleController: IEntityController) {
        this.addRoutes();
    }


    public getRouter(): Router {
        return this.router;
    }

    private addRoutes() {
        this.router.get('/', this.roleController.getAll);
        this.router.get('/:id', this.roleController.getById);
        this.router.post('/',this.roleController.create)
        this.router.delete('/:id',this.roleController.delete)
        this.router.patch('/:id', this.roleController.update)
    }
}