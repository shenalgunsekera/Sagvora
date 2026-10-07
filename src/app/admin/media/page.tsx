import { deleteMediaAction } from "@/app/admin/actions";
import MediaUploader from "@/components/admin/MediaUploader";
import { DeleteButton, PageHeader } from "@/components/admin/ui";
import { getMedia } from "@/lib/queries";
import { requireAdmin } from "@/lib/guard";

export const metadata = { title: "Media" };

const kb = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export default async function MediaAdmin() {
  await requireAdmin();

  const media = getMedia();

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Uploads are converted to WebP and capped at 2400px wide, so you can drop full-size photos straight in. SVGs are stored as-is."
      />

      <MediaUploader />

      {media.length === 0 ? (
        <div className="mt-8 rounded-[4px] border border-dashed border-line p-12 text-center text-sm text-paper-30">
          Nothing uploaded yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-[4px] border border-line bg-ink-1">
              <div className="aspect-[4/3] bg-ink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt} className="h-full w-full object-contain" />
              </div>
              <figcaption className="flex items-center justify-between gap-3 border-t border-line p-3">
                <div className="min-w-0">
                  <div className="truncate text-xs text-paper-60" title={m.filename}>
                    {m.filename}
                  </div>
                  <div className="index mt-0.5">
                    {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                    {kb(m.size)}
                  </div>
                </div>
                <DeleteButton
                  action={deleteMediaAction}
                  id={m.id}
                  label="×"
                  confirmText={`Delete ${m.filename}? Anything using it will lose its image.`}
                />
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
