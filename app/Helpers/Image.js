'use strict'

const Drive = use('Drive')
const imageHash = use('node-image-hash')

const getImageHash = async image => {
    const { hash: filename } = await imageHash.hash(image, 8)
    return `${filename}${Date.now()}`
}

const moveAvatarToS3 = async (fileProcessed, filename, ext, mime) => {
    await Drive.put(`avatar/${filename}.${ext}`, fileProcessed, {
        ACL: 'public-read',
        ContentType: mime,
        CacheControl: 'max-age=31536000, public'
    })
}

const moveImageBackgroundToS3 = async (
    fileProcessed,
    userId,
    pageId,
    imageName,
    mime
) => {
    await Drive.put(`pages/${userId}/${pageId}/${imageName}`, fileProcessed, {
        ACL: 'public-read',
        ContentType: mime,
        CacheControl: 'max-age=31536000, public'
    })
}

const deleteImageBackgroundFromS3 = async (userId, pageId, imageName) => {
    await Drive.delete(`pages/${userId}/${pageId}/${imageName}`)
}

const deleteAvatarFromS3 = async imageName => {
    await Drive.delete(`avatar/${imageName}`)
}

const ImageTypes = {
    PageBackground: 1,
    LinkThumb: 2,
    UserAvatar: 3
}

module.exports = {
    ImageTypes,
    getImageHash,

    moveAvatarToS3,
    deleteAvatarFromS3,

    moveImageBackgroundToS3,
    deleteImageBackgroundFromS3
}
