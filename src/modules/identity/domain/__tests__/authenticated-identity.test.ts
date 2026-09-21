import { describe, it, expect } from "vitest";
import { AuthenticatedIdentity } from "..";

describe("AuthenticatedIdentity", () => {
  const validUser = {
    id: "user-1",
    email: "test@example.com",
    status: "ACTIVE" as const,
    mustChangePassword: false,
  };

  const activeEmployee = {
    id: "emp-1",
    firstName: "Juan",
    lastName: "Pérez",
    status: "ACTIVE" as const,
    currentLevelId: 3,
    supervisorId: "emp-0",
  };

  it("should be valid when both account and employee are active", () => {
    const identity = new AuthenticatedIdentity(validUser, activeEmployee);
    expect(identity.isValid).toBe(true);
    expect(identity.canAuthenticate).toBe(true);
    expect(identity.isEmployeeActive).toBe(true);
  });

  it("should not be valid when account is SUSPENDED", () => {
    const suspendedUser = { ...validUser, status: "SUSPENDED" as const };
    const identity = new AuthenticatedIdentity(suspendedUser, activeEmployee);
    expect(identity.isValid).toBe(false);
    expect(identity.canAuthenticate).toBe(false);
  });

  it("should not be valid when account is LOCKED", () => {
    const lockedUser = { ...validUser, status: "LOCKED" as const };
    const identity = new AuthenticatedIdentity(lockedUser, activeEmployee);
    expect(identity.isValid).toBe(false);
    expect(identity.canAuthenticate).toBe(false);
  });

  it("should not be valid when employee is INACTIVE", () => {
    const inactiveEmployee = { ...activeEmployee, status: "INACTIVE" as const };
    const identity = new AuthenticatedIdentity(validUser, inactiveEmployee);
    expect(identity.isValid).toBe(false);
    expect(identity.isEmployeeActive).toBe(false);
  });

  it("should expose mustChangePassword from user account", () => {
    const identity = new AuthenticatedIdentity(
      { ...validUser, mustChangePassword: true },
      activeEmployee,
    );
    expect(identity.mustChangePassword).toBe(true);
  });

  it("should not expose mustChangePassword when false", () => {
    const identity = new AuthenticatedIdentity(validUser, activeEmployee);
    expect(identity.mustChangePassword).toBe(false);
  });

  it("should expose user account and employee data", () => {
    const identity = new AuthenticatedIdentity(validUser, activeEmployee);
    expect(identity.userAccount.id).toBe("user-1");
    expect(identity.userAccount.email).toBe("test@example.com");
    expect(identity.employee.firstName).toBe("Juan");
    expect(identity.employee.lastName).toBe("Pérez");
  });
});
