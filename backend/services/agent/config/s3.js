import { S3Client } from "@aws-sdk/client-s3";

// Works with AWS S3 or any S3-compatible store (Supabase Storage, Cloudflare R2).
// Supabase: S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
//           S3_REGION=<project region shown in Storage > S3 settings>
// R2:       S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com (region "auto")
// Leave S3_ENDPOINT empty to use AWS with AWS_REGION.
const endpoint = process.env.S3_ENDPOINT || undefined

export const s3 = new S3Client({
    region: endpoint ? (process.env.S3_REGION || "auto") : process.env.AWS_REGION,
    endpoint,
    // S3-compatible providers (Supabase requires it) address buckets by path,
    // not by subdomain.
    forcePathStyle: Boolean(endpoint),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY_ID
    },
    // Only send/check checksums when the API requires them; avoids
    // compatibility errors with S3-compatible providers such as R2.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
})
