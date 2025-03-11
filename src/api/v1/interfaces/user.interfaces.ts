import { Request } from "express";

export interface UserParamsRequest extends Request {
  params: {
    userId: string;
  };
}
