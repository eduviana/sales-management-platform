/**
 * Barrel export for the Identity module — Application layer.
 */

export { LoginUseCase } from "./login-use-case";
export type { LoginInput, LoginOutput } from "./login-use-case";

export { LogoutUseCase } from "./logout-use-case";
export type { LogoutInput } from "./logout-use-case";

export { ChangePasswordUseCase } from "./change-password-use-case";
export type { ChangePasswordInput } from "./change-password-use-case";

export { RequestPasswordResetUseCase } from "./request-password-reset-use-case";
export type {
  RequestPasswordResetInput,
  RequestPasswordResetOutput,
} from "./request-password-reset-use-case";

export { ResetPasswordUseCase } from "./reset-password-use-case";
export type { ResetPasswordInput } from "./reset-password-use-case";

export { ResolveIdentityUseCase } from "./resolve-identity-use-case";
