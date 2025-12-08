import B2 from 'backblaze-b2'

export const b2 = new B2({
    applicationKeyId: process.env.PUBLIC_B2_KEY_ID!,
    applicationKey: process.env.PUBLIC_B2_APPLICATION_KEY!,
})
