// src/presentation/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import ErroResponse from "./errorResponse";
import { apiResponse } from "../api/apiResponse";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //gestion erreur perso
  if (err instanceof ErroResponse) {
    return apiResponse.error(res, err.message, err.statusCode);
  }

  // gestion erreur normal
  console.error(err);
  return res.status(500).json({
    error: "Erreur interne du serveur",
  });
}
