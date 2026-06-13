import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

const useR2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
)

const s3 = useR2
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null

const BUCKET = process.env.R2_BUCKET_NAME || 'expirydeals'
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export interface UploadResult {
  storageKey: string
  urlThumb: string
  urlMedium: string
}

async function ensureLocalDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await s3!.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )
  return `${PUBLIC_URL}/${key}`
}

async function saveLocally(key: string, buffer: Buffer): Promise<string> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, key)
  await ensureLocalDir(path.dirname(filePath))
  await fs.writeFile(filePath, buffer)
  return `/uploads/${key}`
}

export async function uploadListingPhoto(
  imageBuffer: Buffer,
  listingId: string
): Promise<UploadResult> {
  const fileId = uuidv4()
  const thumbKey = `listings/${listingId}/${fileId}-thumb.webp`
  const mediumKey = `listings/${listingId}/${fileId}-medium.webp`

  const thumbBuffer = await sharp(imageBuffer)
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer()

  const mediumBuffer = await sharp(imageBuffer)
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  let urlThumb: string
  let urlMedium: string

  if (useR2 && s3) {
    urlThumb = await uploadToR2(thumbKey, thumbBuffer, 'image/webp')
    urlMedium = await uploadToR2(mediumKey, mediumBuffer, 'image/webp')
  } else {
    urlThumb = await saveLocally(thumbKey, thumbBuffer)
    urlMedium = await saveLocally(mediumKey, mediumBuffer)
  }

  return { storageKey: `listings/${listingId}/${fileId}`, urlThumb, urlMedium }
}

export async function uploadAvatar(imageBuffer: Buffer, userId: string): Promise<string> {
  const fileId = uuidv4()
  const key = `users/avatars/${userId}/${fileId}.webp`

  const buffer = await sharp(imageBuffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer()

  if (useR2 && s3) {
    return uploadToR2(key, buffer, 'image/webp')
  }
  return saveLocally(key, buffer)
}

export async function deleteFile(storageKey: string) {
  if (useR2 && s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }))
  } else {
    const filePath = path.join(LOCAL_UPLOAD_DIR, storageKey)
    await fs.unlink(filePath).catch(() => {})
  }
}
