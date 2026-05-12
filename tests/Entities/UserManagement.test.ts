import { validate } from "class-validator";
import { UserManagement } from "../../src/entity/UserManagement";
import { getValidUserManagement } from "../Mocks/MockData";

describe("UserManagement Entity tests", () => {
    let userManagement: UserManagement;

    beforeEach(() => {
        userManagement = getValidUserManagement();
    });

    it("A user management record with no employee is considered invalid", async () => {
        userManagement.user = undefined as any;

        const errors = await validate(userManagement);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A user management record with no manager is considered invalid", async () => {
        userManagement.manager = undefined as any;

        const errors = await validate(userManagement);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("An invalid start date is considered invalid", async () => {
        userManagement.startDate = "not-a-date";

        const errors = await validate(userManagement);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A user management record can have no end date", async () => {

        userManagement.endDate = undefined;

        const errors = await validate(userManagement);

        expect(errors.length).toBe(0);
    });

    it("A valid user management record is accepted", async () => {

        const errors = await validate(userManagement);

        expect(errors.length).toBe(0);
    });
});