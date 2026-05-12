import "reflect-metadata";
import { AppDataSource } from "../data_source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";

async function createTestUser() {

    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Find manager role
    const managerRole = await roleRepository.findOne({
        where: {
            name: "manager"
        }
    });

    if (!managerRole) {
        throw new Error("Manager role not found");
    }

    // Create user
    const user = new User();

    user.email = "joe.manager@email.com";
    user.password = "Password123!";
    user.role = managerRole;

    await userRepository.save(user);

    console.log("User created successfully");

    process.exit();
}

createTestUser().catch((error) => {
    console.error(error);
});