import fastify from "fastify";
import { env } from "./env";
import { transactions } from "./routes/transactions";
import cookie from "@fastify/cookie";

export const app = fastify();

app.register(cookie);

app.register(transactions, { prefix: "transactions" });

