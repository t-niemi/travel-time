import express from "express";

const unknownEndpoint = (_req: express.Request, res: express.Response) => {
  res.status(404).send({ error: "unknown endpoint" });
};

export default { unknownEndpoint };
