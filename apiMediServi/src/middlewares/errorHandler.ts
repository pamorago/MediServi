import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  const status = err?.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err?.message ?? "Error interno del servidor";

  res.status(status).json({ error: message });
};

export default errorHandler;
