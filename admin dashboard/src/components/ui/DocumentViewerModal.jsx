import { Download, FileText, X } from "lucide-react";
import { useState } from "react";
import Button from "./Button.jsx";

export default function DocumentViewerModal({ open, title = "Submitted documents", documents = [], onClose }) {
  const [zoom, setZoom] = useState(1);

  if (!open) return null;

  const docs = documents.filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close document viewer"
        className="absolute inset-0 bg-slate-950/30"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{docs.length} document{docs.length === 1 ? "" : "s"} submitted for verification.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}>Zoom -</Button>
            <Button variant="secondary" size="sm" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>Zoom +</Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-2">
          {docs.map((document) => (
            <article key={`${document.label}-${document.name}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">{document.label}</p>
                  <p className="truncate text-xs text-slate-500">{document.name}</p>
                </div>
                {document.url && (
                  <a
                    href={document.url}
                    download={document.name}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
              </div>
              <div className="grid min-h-52 place-items-center bg-slate-50 p-3">
                {document.type?.startsWith("image/") && document.url ? (
                  <img
                    src={document.url}
                    alt={document.label}
                    className="max-h-64 rounded-md object-contain transition-transform"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : document.url && document.type === "application/pdf" ? (
                  <iframe
                    title={document.label}
                    src={document.url}
                    className="h-64 w-full rounded-md border border-slate-200 bg-white"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm font-medium text-slate-700">Preview unavailable</p>
                    <p className="text-xs">Use download to inspect this file.</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
