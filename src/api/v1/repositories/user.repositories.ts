import pool from "../../../config/db.config";

const queryCreateNewUser = async (
  userId: string,
  email: string,
  hashedPassword: string,
  firstName: string,
  lastName: string
) => {
  const query =
    "INSERT INTO users (user_id, email, hashed_password, fist_name, last_name) values (?,?,?,?,?)";

  try {
    const [results] = await pool.execute(query, [
      userId,
      email,
      hashedPassword,
      firstName,
      lastName,
    ]);
    return results;
  } catch (err) {
    console.error("Error executing query: ", err);
    throw new Error("Error creating new user");
  }
};

export default { queryCreateNewUser };
