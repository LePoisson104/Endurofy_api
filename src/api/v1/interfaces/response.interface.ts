export interface SuccessResponse<T = any> {
  status: "success";
  message: string;
  data?: T;
}
