import { validate } from "class-validator";
import { Role } from "../../src/entity/Role";

describe("Role Entity tests", () => {
    let role: Role;

    beforeEach(() => {
        role = new Role();
        role.id = 1;
        role.name = "employee";
    });

    it("A blank role name is considered invalid", async () => {
        role.name = "";

        const errors = await validate(role);

        expect(errors.length).toBeGreaterThan(0);
    });

    it("A valid role name is accepted", async () => {
        const errors = await validate(role);
        
        expect(errors.length).toBe(0);
    });
});