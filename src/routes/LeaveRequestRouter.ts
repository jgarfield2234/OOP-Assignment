import { Router } from "express";
import { IRouter } from "../Types/IRouter";
import { IEntityController } from "../Types/IEntityController";
import { Authorisation } from "../Middleware/Authorisation";

export class LeaveRequestRouter implements IRouter {

    basePath: string = "/api/leave-requests";
    authenticate: boolean = true;

    constructor(private router: Router, private leaveRequestController: IEntityController & any) { //Add in ILeaveRequestController
        console.log("LeaveRequestRouter created");
        this.addRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

private addRoutes() {
    console.log("Leave request routes added");

    this.router.get("/", this.leaveRequestController.getAll);

    // Leave-specific routes first
    this.router.get("/status/:userId", this.leaveRequestController.getStatusByEmployee);
    this.router.get("/remaining/:userId", this.leaveRequestController.getRemainingLeaveByEmployee);
    this.router.get("/manager/:managerId/pending", this.leaveRequestController.getPendingRequestsForManager)

    this.router.patch("/approve/:id", Authorisation.authoriseRoles("manager", "admin"), this.leaveRequestController.approve);
    this.router.patch("/reject/:id", Authorisation.authoriseRoles("manager", "admin"), this.leaveRequestController.reject);
    this.router.patch("/cancel/:id", Authorisation.authoriseRoles("employee", "manager", "admin"), this.leaveRequestController.cancel);

    // Generic ID routes last
    this.router.get("/:id", this.leaveRequestController.getById);
    this.router.post("/", Authorisation.authoriseRoles("employee", "manager", "admin"), this.leaveRequestController.create);
    this.router.patch("/:id", Authorisation.authoriseRoles("admin"), this.leaveRequestController.update); // May allow all, unsure yet
    this.router.delete("/:id", Authorisation.authoriseRoles("admin"), this.leaveRequestController.delete);
}
}