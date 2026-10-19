import { error } from "node:console";

export const apiResponse = {
  // Pour un succès avec des données (GET, PUT, DELETE)
  success(res: any, data: any, statusCode: number = 200) {
    return res.status(statusCode).json(data);
  },

  // Pour un succès avec des données (POST)
  create(res: any, data: any, statusCode: number = 201) {
    return res.status(statusCode).json(data);
  },

  // Pour formater les erreurs
  error(res: any, data: any, statusCode: number) {
    return res.status(statusCode).json(data);
  },
};
