/**
 * ClientRepository — Port for client persistence.
 *
 * Reference: docs/database/data-model.md §20
 */

import type { Client, CreateClientData, UpdateClientData } from "../domain/client";

export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  findByOwnerId(ownerEmployeeId: string): Promise<Client[]>;
  create(data: CreateClientData): Promise<Client>;
  update(id: string, data: UpdateClientData): Promise<Client>;
  countByOwnerId(ownerEmployeeId: string): Promise<number>;
}
