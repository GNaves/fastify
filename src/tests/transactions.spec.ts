import { it, expect, beforeAll, afterAll, describe } from "vitest";
import { app } from "../app";
import request from "supertest";
import { beforeEach } from "node:test";
import { execSync } from "node:child_process";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex -- migrate:rollback --all");
    execSync("npm run knex -- migrate:latest");
  });

  it("should create a new transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New Transaction",
      amount: 5000,
      type: "credit",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should list all transactions", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    if (!cookies) {
      throw new Error("No cookies found in response");
    }

    const list = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(list.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    ]);
  });

  it("should list a specific transaction", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    if (!cookies) {
      throw new Error("No cookies found in response");
    }

    const list = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = list.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      })
    );
  });

  it("should get a summary", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie");

    if (!cookies) {
      throw new Error("No cookies found in response");
    }

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "debit Transaction",
        amount: 2000,
        type: "debit",
      });

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      

    expect(summaryResponse.body).toEqual({
      amount: "3000",
    });
  });
});
