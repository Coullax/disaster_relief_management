'use server'

import { b2 } from '@/lib/storage/s3'

export async function uploadToB2(formData: FormData) {
    try {
        const file = formData.get('file') as File
        const filename = formData.get('filename') as string

        if (!file || !filename) {
            throw new Error('Missing file or filename')
        }

        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        await b2.authorize()

        const uploadUrl = await b2.getUploadUrl({
            bucketId: process.env.PUBLIC_B2_BUCKET_ID!
        })

        const result = await b2.uploadFile({
            uploadUrl: uploadUrl.data.uploadUrl,
            uploadAuthToken: uploadUrl.data.authorizationToken,
            fileName: filename,
            data: fileBuffer,
            mime: file.type,
        })

        // Construct public URL
        // Format: https://f{xxx}.backblazeb2.com/file/{bucketName}/{fileName}
        const bucketName = process.env.PUBLIC_B2_BUCKET_NAME!
        const publicUrl = `https://f000.backblazeb2.com/file/${bucketName}/${filename}`

        return {
            success: true,
            publicUrl,
            fileId: result.data.fileId,
            fileName: result.data.fileName
        }
    } catch (error) {
        console.error('B2 upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        }
    }
}
