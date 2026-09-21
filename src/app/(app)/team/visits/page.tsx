import { prisma } from "@/infrastructure/prisma/client";
import { createAuthorizationService } from "@/modules/authorization/composition-root";
import { createOrganizationModule } from "@/modules/organization/composition-root";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/sales/presentation/resolve-auth-context";
import { TeamVisitsClient } from "./team-visits-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeamVisitsPage() {
  const authContext = await resolveAuthContext();
  const auth = createAuthorizationService(prisma);
  const { organizationRepository } = createOrganizationModule(auth);
  const { getVisitList } = createVisitsUseCases(prisma, auth, organizationRepository);
  const visits = await getVisitList.execute({ authContext, scope: "TEAM" });

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-on-surface mb-1">Visitas del equipo</h1>
            <p className="text-on-surface-variant">Visitas asignadas a los vendedores de tu equipo</p>
          </div>
          <Link href="/team/assign-visit" className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#00df81] hover:bg-[#00c873] text-black transition-colors text-center">
            Asignar visita
          </Link>
        </div>
      </header>
      <TeamVisitsClient visits={visits} />
    </div>
  );
}
