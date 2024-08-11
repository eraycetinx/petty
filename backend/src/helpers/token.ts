import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constant";

interface props {
  uuid: String;
  username: String;
  email: String;
}

export const generateToken = ({ email, username, uuid }: props) => {
  return jwt.sign({ email, username, uuid }, JWT_SECRET, {
    expiresIn: "1y",
  });
};
