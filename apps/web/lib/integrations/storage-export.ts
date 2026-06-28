/**
 * Tier 12 — Document export to Google Drive / Dropbox / OneDrive.
 */
export type StorageProvider = "google_drive" | "dropbox" | "onedrive";

export interface StoredFile {
  provider: StorageProvider;
  external_id: string;
  url?: string;
  size_bytes?: number;
}

export async function uploadToGoogleDrive(opts: { accessToken: string; filename: string; mime: string; bytes: Buffer; folderId?: string }): Promise<StoredFile> {
  const meta = { name: opts.filename, parents: opts.folderId ? [opts.folderId] : undefined, mimeType: opts.mime };
  const boundary = `dlugomat${Math.random().toString(16).slice(2)}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${opts.mime}\r\n\r\n`),
    opts.bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { authorization: `Bearer ${opts.accessToken}`, "content-type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`drive_${r.status}`);
  const j: any = await r.json();
  return { provider: "google_drive", external_id: j.id, url: `https://drive.google.com/file/d/${j.id}/view` };
}

export async function uploadToDropbox(opts: { accessToken: string; path: string; bytes: Buffer }): Promise<StoredFile> {
  const r = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      authorization: `Bearer ${opts.accessToken}`,
      "content-type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({ path: opts.path, mode: "add", autorename: true, mute: false }),
    },
    body: opts.bytes,
  });
  if (!r.ok) throw new Error(`dropbox_${r.status}`);
  const j: any = await r.json();
  return { provider: "dropbox", external_id: j.id, size_bytes: j.size };
}

export async function uploadToOneDrive(opts: { accessToken: string; path: string; bytes: Buffer }): Promise<StoredFile> {
  const r = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:${encodeURI(opts.path)}:/content`, {
    method: "PUT",
    headers: { authorization: `Bearer ${opts.accessToken}`, "content-type": "application/octet-stream" },
    body: opts.bytes,
  });
  if (!r.ok) throw new Error(`onedrive_${r.status}`);
  const j: any = await r.json();
  return { provider: "onedrive", external_id: j.id, url: j.webUrl, size_bytes: j.size };
}
