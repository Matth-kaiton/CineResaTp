// src/presentation/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../../../domain/errorResponse";
import { apiResponse } from "./apiResponse";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ErrorResponse) {
    return apiResponse.error(res, { error: err.message }, err.statusCode);
  }

  // gestion erreur normal
  console.error(err);
  return res.status(500).json({
    error: "Erreur interne du serveur",
  });
}
