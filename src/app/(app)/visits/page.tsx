/**
 * Visits page — Lists all visits for the authenticated seller.
 *
 * Reference: business-rules.md REG-066, REG-067
 */

import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { prisma } from "@/infrastructure/prisma/client";
import { VisitsClient } from "./visits-client";

export default async function VisitsPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { organizationRepository } = createOrganizationModule(auth);
  const { getVisitList } = createVisitsUseCases(prisma, auth, organizationRepository);

  const visits = await getVisitList.execute({ authContext });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-on-surface mb-1">
          Mis Visitas
        </h1>
        <p className="text-on-surface-variant">
          Visitas asignadas y realizadas
        </p>
      </header>

      <VisitsClient initialVisits={visits} />
    </div>
  );
}
