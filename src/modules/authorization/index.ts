/**
 * Authorization module barrel exports.
 *
 * This module provides the authorization system for Royal Prestige.
 * It follows the modular monolith architecture with clear separation
 * between domain, application, and infrastructure.
 *
 * Reference: authorization.md, system-architecture.md §6.4
 */

// Domain
export * from "./domain";

// Application
export * from "./application";

// Infrastructure
export * from "./infrastructure";
