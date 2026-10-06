import { Download, ExternalLink, PlayCircle } from "lucide-react";

/** Action link for a training material, varying by type (PDF / video / other). */
export function MaterialAction({ type, url }: { type: string; url: string | null }) {
  if (!url) {
    return <span className="text-label-sm text-on-surface-variant">Sin enlace</span>;
  }

  if (type === "PDF") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-medium text-[#0a1b12] bg-[#00df81] rounded-lg hover:bg-[#00c873] transition-colors"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        Descargar
      </a>
    );
  }

  if (type === "VIDEO") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-colors"
      >
        <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Ver
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-medium text-on-primary bg-primary-container rounded-lg hover:opacity-90 transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
      Abrir
    </a>
  );
}
