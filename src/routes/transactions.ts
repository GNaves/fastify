import { z } from "zod";
import { knex } from "../database";
import { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exist";

export async function transactions(app: FastifyInstance) {
  

  app.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { session_id } = request.cookies;

      const transactions = await knex("transactions")
        .where("session_id", session_id)
        .select();

      return reply.status(200).send({ transactions });
    }
  );

  app.get(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = paramsSchema.parse(request.params);

      const { session_id } = request.cookies;

      const transactions = await knex("transactions")
        .where({ session_id, id })
        .first();

      return reply.status(200).send({ transactions });
    }
  );

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { session_id } = request.cookies;

      const summary = await knex("transactions")
        .where("sessions_id", session_id)
        .sum("amount", { as: "amount" })
        .first();

      return reply.status(200).send({ summary });
    }
  );

  app.post("/", async (request, reply) => {
    const bodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = bodySchema.parse(request.body);

    let session_id = request.cookies.session_id;

    if (!session_id) {
      session_id = crypto.randomUUID();

      reply.cookie("session_id", session_id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
    }

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id,
    });

    return reply.status(201).send();
  });
}
