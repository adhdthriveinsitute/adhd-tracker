import { configDotenv } from "dotenv"
configDotenv()


export const PORT =
    process.env.PORT || 3000;

export const CLIENT_URL =
    process.env.CLIENT_URL

export const MONGO_DB_URI =
    process.env.MONGO_DB_URI;


export const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET;


export const ACCESS_TOKEN_EXPIRY =
    process.env.ACCESS_TOKEN_EXPIRY;

export const SECRET_KEY =
    process.env.SECRET_KEY;

export const RESEND_API_KEY =
    process.env.RESEND_API_KEY;


