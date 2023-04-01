import express from 'express';
import cloudinary from '../core/cloudinary';

class UploadFileController {
    //функция загрузки изображений для твитов пользователя через cloudinary
    async upload(req: express.Request, res: express.Response): Promise<void> {
        const file = req.file;

        cloudinary.v2.uploader
            .upload_stream({ resource_type: 'auto' }, (error, result) => {
                if (error || !result) {
                    return res.status(500).json({
                        status: 'error',
                        message: error || 'upload error',
                    });
                }
            res.status(201).json({
                url: result.url,
                size: Math.round(result.bytes / 1024),
                height: result.height,
                width: result.width,

            });
        })
        .end(file != undefined ? file.buffer : undefined);
    }
}

export const UploadFileCtrl = new UploadFileController();
