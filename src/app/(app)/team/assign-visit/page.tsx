import Link from "next/link";
import { createVisitsUseCases } from "@/modules/visits/composition-root";
import { resolveAuthContext } from "@/modules/identity/resolve-auth-context";
import { assignVisit } from "./actions";
import { AssignVisitForm } from "./assign-visit-form";

export default async function AssignVisitPage() {
  const authContext = await resolveAuthContext();
  const useCases = createVisitsUseCases();
  const [clients, team] = await Promise.all([
    useCases.getClientList.execute({ authContext }),
    useCases.getTeamList.execute({ authContext }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/team" className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">← Volver a mi equipo</Link>
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Asignar visita</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Asigna una visita a un vendedor de tu equipo.</p>
      </div>

      <AssignVisitForm clients={clients} team={team} action={assignVisit} />
    </div>
  );
}
