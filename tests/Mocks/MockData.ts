import { Role } from "../../src/entity/Role";
import { User } from "../../src/entity/User";
import { LeaveRequest, LeaveStatus, LeaveType } from "../../src/entity/LeaveRequest";
import { UserManagement } from "../../src/entity/UserManagement";

export function getValidEmployeeRole(): Role {
    const role = new Role();
    role.id = 1;
    role.name = "employee";
    return role;
}

export function getValidManagerRole(): Role {
    const role = new Role();
    role.id = 2;
    role.name = "manager";
    return role;
}

export function getValidEmployee(): User {
    const user = new User();
    user.id = 1;
    user.firstname = "Ben";
    user.surname = "Taylor";
    user.email = "ben.taylor@email.com";
    user.password = "Password123!";
    user.role = getValidEmployeeRole();
    user.department = "IT";
    user.annualLeaveBalance = 25;
    return user;
}

export function getValidManager(): User {
    const user = new User();
    user.id = 2;
    user.firstname = "Sarah";
    user.surname = "Manager";
    user.email = "sarah.manager@email.com";
    user.password = "Password123!";
    user.role = getValidManagerRole();
    user.department = "IT";
    user.annualLeaveBalance = 25;
    return user;
}

export function getValidLeaveRequest(): LeaveRequest {
    const leaveRequest = new LeaveRequest();
    leaveRequest.id = 1;
    leaveRequest.user = getValidEmployee();
    leaveRequest.leaveType = LeaveType.ANNUAL;
    leaveRequest.startDate = "2026-06-10";
    leaveRequest.endDate = "2026-06-12";
    leaveRequest.status = LeaveStatus.PENDING;
    leaveRequest.reason = "Holiday";
    return leaveRequest;
}

export function getValidUserManagement(): UserManagement {
    const userManagement = new UserManagement();
    userManagement.id = 1;
    userManagement.user = getValidEmployee();
    userManagement.manager = getValidManager();
    userManagement.startDate = "2026-04-01";
    userManagement.endDate = undefined;
    return userManagement;
}