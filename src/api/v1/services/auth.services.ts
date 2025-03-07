import Users from "../repositories/user.repositories";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const signUp = async (userData: any) => {
  const { firstName, lastName, email, password } = userData;
};
