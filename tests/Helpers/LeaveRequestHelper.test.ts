import { LeaveRequestHelper } from "../../src/helpers/LeaveRequestHelper";

describe("LeaveRequestHelper tests", () => {

    it("A same day leave request is calculated as one day", () => {
        // Arrange
        const startDate = "2026-06-10";
        const endDate = "2026-06-10";

        // Act
        const result = LeaveRequestHelper.calculateLeaveDays(startDate, endDate);

        // Assert
        expect(result).toBe(1);
    });

    it("A three day leave request is calculated inclusively", () => {
        // Arrange
        const startDate = "2026-06-10";
        const endDate = "2026-06-12";

        // Act
        const result = LeaveRequestHelper.calculateLeaveDays(startDate, endDate);

        // Assert
        expect(result).toBe(3);
    });
});