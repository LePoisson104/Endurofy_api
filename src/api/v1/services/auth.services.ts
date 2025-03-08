import Users from "../repositories/user.repositories";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { ErrorResponse } from "../middlewares/error.handlers";

const signup = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10); // 10 salt
  const userId = uuidv4();

  await Users.queryCreateNewUser(
    userId,
    firstName,
    lastName,
    email,
    hashedPassword
  );

  return;
};

export default { signup };
