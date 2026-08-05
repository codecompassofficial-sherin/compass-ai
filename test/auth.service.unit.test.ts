process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/compass-ai-test";
process.env.JWT_ACCESS_SECRET = "test-only-access-secret-0123456789abcdef";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.FRONTEND_URL = "http://localhost:3000";

import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

const SMTP_UNAVAILABLE = new Error("connect ECONNREFUSED 127.0.0.1:587");
const USER_ID = "507f1f77bcf86cd799439011";

let sendMail: () => Promise<void> = async () => {};
let createEmailVerificationToken: () => Promise<void> = async () => {};
let findUserById: () => Promise<unknown> = async () => ({
  _id: USER_ID,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
});

mock.module("../src/shared/services/mailer.js", {
  namedExports: {
    sendMail: async () => sendMail(),
  },
});

mock.module("../src/modules/auth/auth.repository.js", {
  namedExports: {
    authRepository: {
      findUserById: async () => findUserById(),
      createEmailVerificationToken: async () => createEmailVerificationToken(),
    },
  },
});

const { authService } = await import("../src/modules/auth/auth.service.js");

describe("requestVerificationEmail", () => {
  it("does not throw when SMTP is unavailable", async () => {
    sendMail = async () => {
      throw SMTP_UNAVAILABLE;
    };

    const token = await authService.requestVerificationEmail(USER_ID);

    assert.equal(token, undefined);
  });

  it("returns the verification token when the email is sent", async () => {
    sendMail = async () => {};

    const token = await authService.requestVerificationEmail(USER_ID);

    assert.ok(token, "expected a verification token");
    assert.ok(token.length > 0);
  });

  it("does not swallow unexpected non-mail errors", async () => {
    sendMail = async () => {};
    createEmailVerificationToken = async () => {
      throw new Error("database unavailable");
    };

    await assert.rejects(
      authService.requestVerificationEmail(USER_ID),
      (err) => err instanceof Error && err.message === "database unavailable",
    );
  });

  it("rejects with INVALID_ACCESS_TOKEN when the user does not exist", async () => {
    sendMail = async () => {};
    findUserById = async () => null;

    await assert.rejects(
      authService.requestVerificationEmail(USER_ID),
      (err) => (err as { code?: string }).code === "INVALID_ACCESS_TOKEN",
    );
  });
});
