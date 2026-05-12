import { Repository } from "typeorm";
import { LeaveRequest } from "../entity/LeaveRequest";

export class LeaveRequestHelper {

    public static calculateLeaveDays(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const difference = end.getTime() - start.getTime();

        return Math.floor(difference / millisecondsPerDay) + 1;
    }

    public static async hasOverlappingLeave(leaveRequestRepository: Repository<LeaveRequest>, userId: number, startDate: string, endDate: string): Promise<boolean> {
        const overlappingLeave = await leaveRequestRepository.createQueryBuilder("leaveRequest").where("leaveRequest.userId = :userId", { userId }).andWhere("leaveRequest.status IN (:...statuses)", {
                statuses: ["Pending", "Approved"]
            }).andWhere("leaveRequest.startDate <= :endDate AND leaveRequest.endDate >= :startDate",{ startDate, endDate }).getOne();

        return overlappingLeave !== null;
    }
}