/**
 * Clients page — Lists all clients for N3+ supervisors.
 *
 * Reference: business-rules.md REG-069
 */

import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { ClientsClient } from "./clients-client";

export default async function ClientsPage() {
  const authContext = await resolveAuthContext();
  const { getClientList } = createVisitsUseCases();

  const clients = await getClientList.execute({ authContext });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          Clientes
        </h1>
        <p className="text-on-surface-variant">
          Base de datos de clientes
        </p>
      </header>

      <ClientsClient initialClients={clients} />
    </div>
  );
}
