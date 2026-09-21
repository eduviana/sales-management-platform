/**
 * Barrel export for the Identity module — Domain layer.
 *
 * Domain ports and value objects are exported from this module.
 * Infrastructure and Application layers import from here.
 */

export { AuthenticatedIdentity } from "./authenticated-identity";
export type {
  AccountStatus,
  EmployeeStatus,
  IdentityUserAccount,
  IdentityEmployee,
} from "./authenticated-identity";

export type { PasswordService } from "./password-service";
export type { SessionPort, SessionData } from "./session-port";
export type { PasswordResetNotifier } from "./password-reset-notifier";
export type { TokenService } from "./token-service";
export type {
  IdentityRepository,
  UserAccountRecord,
  EmployeeRecord,
  IdentityRecord,
  PasswordResetTokenRecord,
} from "./identity-repository";
