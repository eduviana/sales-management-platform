/**
 * AuthenticatedIdentity value object.
 *
 * Represents the resolved identity of an authenticated user.
 * This is the result of session resolution — it aggregates
 * UserAccount and Employee data into a single read-only context.
 *
 * Reference: authorization.md §4, system-architecture.md §11
 */

/**
 * Account status as defined in the Prisma schema.
 * Must match the AccountStatus enum exactly.
 */
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "LOCKED";

/**
 * Employee status as defined in the Prisma schema.
 * Must match the EmployeeStatus enum exactly.
 */
export type EmployeeStatus = "ACTIVE" | "INACTIVE";

/**
 * Read-only representation of the UserAccount within the identity context.
 */
export interface IdentityUserAccount {
  readonly id: string;
  readonly email: string;
  readonly status: AccountStatus;
  readonly mustChangePassword: boolean;
}

/**
 * Read-only representation of the Employee within the identity context.
 */
export interface IdentityEmployee {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: EmployeeStatus;
  readonly currentLevelId: number | null;
  readonly supervisorId: string | null;
}

/**
 * The fully resolved identity of an authenticated user.
 *
 * This value object is constructed server-side after session resolution.
 * It should never be constructed from client-provided data.
 *
 * Reference: authorization.md §3.3, §4
 */
export class AuthenticatedIdentity {
  constructor(
    public readonly userAccount: IdentityUserAccount,
    public readonly employee: IdentityEmployee,
  ) {}

  /** Whether the account can authenticate (ACTIVE status). */
  get canAuthenticate(): boolean {
    return this.userAccount.status === "ACTIVE";
  }

  /** Whether the employee is active in the organization. */
  get isEmployeeActive(): boolean {
    return this.employee.status === "ACTIVE";
  }

  /** Whether the user must change their password before other operations. */
  get mustChangePassword(): boolean {
    return this.userAccount.mustChangePassword;
  }

  /** Whether this identity is fully valid for system access. */
  get isValid(): boolean {
    return this.canAuthenticate && this.isEmployeeActive;
  }
}
