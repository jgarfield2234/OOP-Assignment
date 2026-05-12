import { validate } from "class-validator";
import { LeaveRequest, LeaveStatus, LeaveType } from "../../src/entity/LeaveRequest";
import { getValidLeaveRequest } from "../Mocks/MockData";

describe("LeaveRequest Entity tests", () => {
    let leaveRequest: LeaveRequest;

    beforeEach(() => {
        leaveRequest = getValidLeaveRequest();
    });

    it("A leave request with no user is considered invalid", async () => {
        leaveRequest.user = undefined as any;

        const errors = await validate(leaveRequest);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("An invalid leave type is considered invalid", async () => {
        leaveRequest.leaveType = "Random Leave" as LeaveType;

        const errors = await validate(leaveRequest);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("An invalid leave status is considered invalid", async () => {
        leaveRequest.status = "Waiting" as LeaveStatus;

        const errors = await validate(leaveRequest);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A reason longer than 255 characters is considered invalid", async () => {
        leaveRequest.reason = "a".repeat(256);

        const errors = await validate(leaveRequest);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A valid leave request is accepted", async () => {
        const errors = await validate(leaveRequest);

        expect(errors.length).toBe(0);
    });
});