import pool from "../../../config/db.config";
import { ErrorResponse } from "../middlewares/error.handlers";

const queryCreateNewUser = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string
) => {
  const query =
    "INSERT INTO users (user_id, email, hashed_password, first_name, last_name) values (?,?,?,?,?)";

  try {
    const [results] = await pool.execute(query, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
    ]);
    return results;
  } catch (err: any) {
    console.error("Error executing query: ", err);
    if (err.code === "ER_DUP_ENTRY") {
      throw new ErrorResponse("Duplicate email!", 409);
    }
    throw new ErrorResponse("Error creating new user", 500);
  }
};

export default { queryCreateNewUser };
