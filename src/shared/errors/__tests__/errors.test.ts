import { describe, it, expect } from "vitest";
import {
  DomainError,
  NotFoundError,
  ValidationError,
  DomainRuleError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  InfrastructureError,
  DatabaseError,
} from "..";

describe("Error Hierarchy", () => {
  describe("DomainError", () => {
    it("should be an instance of Error", () => {
      const error = new DomainError("test");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
    });

    it("should have correct name", () => {
      const error = new DomainError("something went wrong");
      expect(error.name).toBe("DomainError");
      expect(error.message).toBe("something went wrong");
    });
  });

  describe("NotFoundError", () => {
    it("should format message with entity and identifier", () => {
      const error = new NotFoundError("Employee", "abc-123");
      expect(error.message).toBe(
        "Employee with identifier 'abc-123' not found.",
      );
      expect(error.entity).toBe("Employee");
      expect(error.identifier).toBe("abc-123");
    });

    it("should format message without identifier", () => {
      const error = new NotFoundError("Sale");
      expect(error.message).toBe("Sale not found.");
      expect(error.entity).toBe("Sale");
      expect(error.identifier).toBeUndefined();
    });

    it("should be instance of DomainError", () => {
      const error = new NotFoundError("User");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("ValidationError", () => {
    it("should store field name", () => {
      const error = new ValidationError("Email is required", "email");
      expect(error.field).toBe("email");
      expect(error.message).toBe("Email is required");
    });

    it("should work without field", () => {
      const error = new ValidationError("Invalid input");
      expect(error.field).toBeUndefined();
    });
  });

  describe("DomainRuleError", () => {
    it("should store rule identifier", () => {
      const error = new DomainRuleError(
        "N1 cannot recruit",
        "REG-021",
      );
      expect(error.rule).toBe("REG-021");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("ConflictError", () => {
    it("should be instance of DomainError", () => {
      const error = new ConflictError("Open history record exists");
      expect(error).toBeInstanceOf(DomainError);
      expect(error.name).toBe("ConflictError");
    });
  });

  describe("AuthenticationError", () => {
    it("should have default message", () => {
      const error = new AuthenticationError();
      expect(error.message).toBe("Authentication required.");
    });

    it("should accept custom message", () => {
      const error = new AuthenticationError("Token expired");
      expect(error.message).toBe("Token expired");
    });
  });

  describe("AuthorizationError", () => {
    it("should have default message", () => {
      const error = new AuthorizationError();
      expect(error.message).toBe("Insufficient permissions.");
    });
  });

  describe("InfrastructureError", () => {
    it("should be an instance of Error but NOT DomainError", () => {
      const error = new InfrastructureError("Connection failed");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InfrastructureError);
      expect(error).not.toBeInstanceOf(DomainError);
    });

    it("should support cause", () => {
      const cause = new Error("original");
      const error = new InfrastructureError("wrapped", { cause });
      expect(error.cause).toBe(cause);
    });
  });

  describe("DatabaseError", () => {
    it("should be instance of InfrastructureError", () => {
      const error = new DatabaseError("Query failed");
      expect(error).toBeInstanceOf(InfrastructureError);
      expect(error.name).toBe("DatabaseError");
    });
  });
});
