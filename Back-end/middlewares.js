import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "./config.js";

export const auth = (req, res, next) => {
  console.log(req.headers);
  if (!req.headers.authorization) {
    res
      .status(400)
      .send({ success: false, error: "Please provide authorization header" });
    return;
  }
  const token = req.headers.authorization.split(" ")[1];
  const isTokenValid = jwt.verify(token, TOKEN_SECRET);
  if (isTokenValid) {
    const tokenData = jwt.decode(token);
    const tokenUserId = tokenData.userId;
    req.userId = tokenUserId;
    next();
    return;
  }
  res.status(400).send({ success: false, error: "Invalid token" });
};
