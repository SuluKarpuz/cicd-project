import request from "supertest";
import app from "../app.js";
import { version } from "../version.js";

describe("API Endpoints", () => {
  test("GET / should return hello message with version and timestamp", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      message: "Hello from Node.js!",
      version: version,
    });
    expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
  });

  test("GET /health should return healthy status", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "healthy",
    });
  });

  test("GET /nonexistent should return 404", async () => {
    const response = await request(app).get("/nonexistent");
    expect(response.statusCode).toBe(404);
  });
});
