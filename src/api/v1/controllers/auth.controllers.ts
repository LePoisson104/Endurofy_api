import { Request, Response } from "express";
import { controllerErrorResponse } from "../middlewares/error.handlers";
import { CustomError } from "../interfaces/error.interface";
import { userRequestBody } from "../interfaces/user.interface";
import authServices from "../services/auth.services";

const signup = async (
  req: Request<{}, {}, userRequestBody>,
  res: Response
): Promise<any> => {
  const { firstName, lastName, email, password } = req.body;
  try {
    await authServices.signup(firstName, lastName, email, password);
    return res.status(200).json({ message: "User created successfully!" });
  } catch (err) {
    controllerErrorResponse(res, err as CustomError);
  }
};

export default { signup };
