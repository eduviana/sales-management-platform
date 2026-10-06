import type { ReactNode } from "react";
import { FileText, LayoutList, Link2, PlayCircle } from "lucide-react";
import type { ModuleWithMaterials } from "@/modules/training/application";
import {
  Modal,
  ModuleForm,
  MaterialForm,
  DeleteButton,
  StatusToggle,
} from "@/modules/training/presentation/components";
import {
  deleteModuleFormData,
  deleteMaterialFormData,
} from "@/modules/training/presentation/training-actions";
import { SectionCard } from "@/shared/presentation/components";
import { MaterialAction } from "./material-action";

const TYPE_ICONS: Record<string, ReactNode> = {
  PDF: <FileText className="w-4 h-4 text-rose-400" aria-hidden="true" />,
  VIDEO: <PlayCircle className="w-4 h-4 text-sky-400" aria-hidden="true" />,
  DOCUMENT: <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />,
  LINK: <Link2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />,
};

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  DOCUMENT: "Documento",
  LINK: "Enlace",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Nivel 1",
  2: "Nivel 2",
  3: "Nivel 3",
  4: "Nivel 4",
  5: "Nivel 5",
  6: "Nivel 6",
  7: "Nivel 7",
};

interface TrainingModuleCardProps {
  mod: ModuleWithMaterials;
  index: number;
  courseId: string;
  isAdmin: boolean;
}

/** One course module: header, admin controls and its material list. */
export function TrainingModuleCard({
  mod,
  index,
  courseId,
  isAdmin,
}: TrainingModuleCardProps) {
  return (
    <SectionCard
      icon={<LayoutList className="w-4 h-4" aria-hidden="true" />}
      accent="bg-sky-400/10 text-sky-400"
      title={`Módulo ${index + 1}`}
    >
      {/* Module header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-title-md font-semibold text-on-surface">
            {mod.module.name}
          </h2>
          {mod.module.description && (
            <p className="text-body-sm text-on-surface-variant mt-1">
              {mod.module.description}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Modal
              trigger={
                <button className="px-3 py-1.5 text-label-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-opacity">
                  Nuevo Material
                </button>
              }
              title="Nuevo Material"
            >
              <MaterialForm mode="create" moduleId={mod.module.id} />
            </Modal>
            <Modal
              trigger={
                <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  Editar
                </button>
              }
              title="Editar Módulo"
            >
              <ModuleForm
                mode="edit"
                courseId={courseId}
                moduleId={mod.module.id}
                initialName={mod.module.name}
                initialDescription={mod.module.description ?? ""}
                initialSortOrder={mod.module.sortOrder}
              />
            </Modal>
            <DeleteButton
              label={`el módulo "${mod.module.name}"`}
              action={deleteModuleFormData}
              id={mod.module.id}
            />
          </div>
        )}
      </div>

      {/* Materials */}
      {mod.materials.length === 0 ? (
        <div className="px-4 py-6 text-body-sm text-on-surface-variant text-center border border-dashed border-outline-variant rounded-xl">
          No hay materiales en este módulo.
        </div>
      ) : (
        <div className="divide-y divide-outline-variant rounded-xl overflow-hidden border border-outline-variant bg-surface">
          {mod.materials.map((material) => (
            <div
              key={material.id}
              className="px-4 py-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="p-1.5 rounded-lg bg-surface-container-high shrink-0">
                  {TYPE_ICONS[material.type] ?? <FileText className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <div className="text-body-md font-medium text-on-surface truncate">
                    {material.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-label-xs text-on-surface-variant">
                      {TYPE_LABELS[material.type] ?? material.type}
                    </span>
                    {material.levelId !== null && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-400/10 text-sky-400 border border-sky-400/20">
                        {LEVEL_LABELS[material.levelId] ?? `Nivel ${material.levelId}`}
                      </span>
                    )}
                    {isAdmin && material.status && (
                      <StatusToggle
                        contentType="material"
                        contentId={material.id}
                        currentStatus={material.status}
                      />
                    )}
                  </div>
                  {material.description && (
                    <p className="text-body-xs text-on-surface-variant mt-1 line-clamp-1">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <>
                    <Modal
                      trigger={
                        <button className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                          Editar
                        </button>
                      }
                      title="Editar Material"
                    >
                      <MaterialForm
                        mode="edit"
                        moduleId={mod.module.id}
                        materialId={material.id}
                        initialName={material.name}
                        initialDescription={material.description ?? ""}
                        initialType={material.type}
                        initialUrl={material.url ?? ""}
                        initialLevelId={material.levelId}
                        initialStatus={material.status}
                      />
                    </Modal>
                    <DeleteButton
                      label={`el material "${material.name}"`}
                      action={deleteMaterialFormData}
                      id={material.id}
                    />
                  </>
                )}
                <MaterialAction type={material.type} url={material.url} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
