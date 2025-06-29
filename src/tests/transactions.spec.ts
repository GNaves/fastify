import { test, expect, beforeAll, afterAll, describe } from "vitest";
import { app } from "../app";
import request from "supertest";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("User Can Create A New Transaction", async () => {
    const response = await request(app.server).post("/transactions").send({
      title: "New Transaction",
      amount: 5000,
      type: "credit",
    });

    expect(response.statusCode).toBe(201);
  });
});
