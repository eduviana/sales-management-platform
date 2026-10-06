/**
 * Barrel export for the Organization module — Domain layer.
 *
 * Domain rules, constants, and ports are exported from this module.
 * Infrastructure and Application layers import from here.
 */

export {
  LEVEL_MIN,
  LEVEL_MAX,
  LEVEL_NAMES,
  isValidLevel,
  getLevelName,
  isValidPromotion,
  isValidDemotion,
  isValidLevelChange,
} from "./level";

export {
  RECRUITMENT_LADDER,
  canRecruit,
  getRecruitedLevel,
  isValidRecruitment,
} from "./recruitment-rules";

export {
  isValidSupervisorAssignment,
  wouldCreateCycle,
} from "./hierarchy-rules";

export type {
  EmployeeRecord,
  LevelRecord,
  LevelHistoryRecord,
  SupervisorHistoryRecord,
  EmployeeCommissionContext,
  EmployeeCommissionContextPort,
  CreateEmployeeData,
  UpdateEmployeeData,
  CreateLevelHistoryData,
  CreateSupervisorHistoryData,
  OrganizationRepository,
} from "./organization-repository";
