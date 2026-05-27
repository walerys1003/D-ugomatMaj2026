# image-resize — Supabase Edge Function

On-demand WASM-powered image resizer (avatars, evidence thumbs, marketplace).

## Endpoint

```
POST https://<project-ref>.functions.supabase.co/image-resize
Authorization: Bearer <user JWT>
Content-Type: application/json

{
  "bucket": "avatars",
  "path": "users/abc.../profile.jpg",
  "width": 256,
  "height": 256,
  "fit": "cover",
  "format": "webp"
}
```

## Response

```json
{
  "url": "https://<project>.supabase.co/storage/v1/object/public/image-variants/<path>.w256.h256.webp",
  "cached": false,
  "width": 256,
  "height": 256,
  "format": "webp",
  "bytes": 18742
}
```

If a variant with the same `(path, width, height, format)` already
exists in the variants bucket, returns `"cached": true` immediately
without re-processing.

## Allowed parameters

- `width`: one of `[64, 128, 256, 512, 1024, 2048]`
- `format`: one of `["webp", "jpeg", "png"]` (default: `webp`)
- `fit`: `"cover"` (crop to fill) or `"contain"` (fit inside, default)
- Max input size: 25 MB

## Setup

1. Create variants bucket:
   ```sql
   insert into storage.buckets (id, name, public)
   values ('image-variants', 'image-variants', true)
   on conflict do nothing;
   ```

2. Deploy:
   ```bash
   supabase functions deploy image-resize
   ```

3. (Optional) Override bucket name:
   ```bash
   supabase secrets set VARIANTS_BUCKET=my-custom-variants-bucket
   ```

## Cost model

- Edge function invocation: free up to 500k/month, then $2/M
- ImageMagick WASM: ~50ms per resize (warm), ~200ms cold start
- Storage egress: standard Supabase rates
- Recommend client-side `<Image>` component with `srcSet` to call this
  endpoint only for sizes actually needed.
