"use client";

import * as React from "react";
import { FileUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FileUploader — drag-and-drop + click-to-browse. Renders inline file list,
 * size check, and per-file remove. Server consumes raw File[] via onFiles.
 */
export interface FileUploaderProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  label?: string;
  helper?: string;
  onFiles?: (files: File[]) => void;
  className?: string;
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploader({
  accept,
  maxSizeMb = 50,
  multiple = false,
  label = "Wgraj plik",
  helper,
  onFiles,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [hover, setHover] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function take(list: FileList | null) {
    if (!list) return;
    const maxBytes = maxSizeMb * 1024 * 1024;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > maxBytes) {
        setError(`${f.name} przekracza ${maxSizeMb} MB`);
        continue;
      }
      next.push(f);
    }
    const merged = multiple ? [...files, ...next] : next.slice(0, 1);
    setFiles(merged);
    setError(null);
    onFiles?.(merged);
  }

  function remove(idx: number) {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onFiles?.(next);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-iron-50/40 p-8 text-center transition",
          "focus-visible:outline-none focus-visible:shadow-shield-focus",
          hover
            ? "border-dlugomat-500 bg-dlugomat-50/40 dark:border-dlugomat-400 dark:bg-dlugomat-900/40"
            : "border-iron-300 dark:border-dlugomat-800 dark:bg-dlugomat-900/30",
        )}
      >
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-xl bg-white text-dlugomat-700 shadow-card dark:bg-iron-950 dark:text-dlugomat-300"
        >
          <FileUp className="size-5" />
        </span>
        <span className="text-fluid-sm font-semibold text-iron-900 dark:text-iron-50">
          {label}
        </span>
        <span className="text-fluid-xs text-iron-500">
          Przeciągnij plik lub kliknij · maks. {maxSizeMb} MB
          {accept ? ` · ${accept}` : ""}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => take(e.target.files)}
        />
      </div>

      {helper && !error ? (
        <p className="text-fluid-xs text-iron-500">{helper}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-fluid-xs font-semibold text-danger-600">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-md border border-iron-200 bg-white px-3 py-2 text-fluid-sm dark:border-iron-800 dark:bg-iron-950"
            >
              <span className="flex flex-col">
                <span className="font-semibold text-iron-900 dark:text-iron-50">
                  {f.name}
                </span>
                <span className="text-fluid-xs text-iron-500">
                  {fmtBytes(f.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Usuń ${f.name}`}
                onClick={() => remove(i)}
                className="rounded p-1 text-iron-500 hover:bg-iron-100 hover:text-danger-600 focus-visible:shadow-shield-focus focus-visible:outline-none dark:hover:bg-dlugomat-900"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
