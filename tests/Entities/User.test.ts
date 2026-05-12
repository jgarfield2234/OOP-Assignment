import { validate } from "class-validator";
import { instanceToPlain } from "class-transformer";
import { User } from "../../src/entity/User";
import { getValidEmployee } from "../Mocks/MockData";

describe("User Entity tests", () => {
    let user: User;

    beforeEach(() => {
        user = getValidEmployee();
    });

    it("A password less than 10 characters is considered invalid", async () => {
        user.password = "short";

        const errors = await validate(user);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A poorly formed email is considered invalid", async () => {
        user.email = "not-an-email";

        const errors = await validate(user);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A user with no role is considered invalid", async () => {
        user.role = undefined as any;

        const errors = await validate(user);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A negative annual leave balance is considered invalid", async () => {
        user.annualLeaveBalance = -1;

        const errors = await validate(user);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A valid user is accepted", async () => {
        const errors = await validate(user);

        expect(errors.length).toBe(0);
    });

    it("A user password and salt are excluded when transformed to a plain object", () => {
        const plainUser = instanceToPlain(user);

        expect(plainUser.password).toBeUndefined();
        expect(plainUser.salt).toBeUndefined();
    });
});