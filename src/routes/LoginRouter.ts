import { Router } from "express";
import { ILoginController } from "../types/ILoginController";
import { IRouter } from "../types/IRouter";

export class LoginRouter implements IRouter{

    basePath: string = "/api/login";
    authenticate: boolean = false;

    constructor(private router: Router, private loginController: ILoginController) {
        this.addRoutes();
    }


    public getRouter(): Router {
        return this.router;
    }

    private addRoutes() {
        this.router.post('/', this.loginController.login)
    }
}