import { JwtPayload } from "jsonwebtoken";

export interface DecodedToken extends JwtPayload {
  UserInfo: {
    userId: string;
    email: string;
  };
}
