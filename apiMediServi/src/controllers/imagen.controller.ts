import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { uploadImagen } from '../middlewares/upload.middleware';
import imagenService from '../services/imagen.service';

const upload = (req: Request, res: Response, next: NextFunction): void => {
    uploadImagen(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error:
                    error.code === 'LIMIT_FILE_SIZE'
                        ? 'La imagen no debe superar los 2 MB'
                        : error.message,
            });
            return;
        }

        if (error instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            return;
        }

        const previousFileName = req.body.previousFileName as string | undefined;

        imagenService
            .uploadImagen(req.file, previousFileName)
            .then((fileName) => {
                res.status(StatusCodes.OK).json({ message: 'Imagen subida correctamente', fileName });
            })
            .catch(next);
    });
};

const getListFiles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const files = await imagenService.listarImagenes();
        res.json(files);
    } catch (error) {
        next(error);
    }
};

const download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const fileNameParam = req.params['name'];
        if (typeof fileNameParam !== 'string') {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Nombre de imagen inválido' });
            return;
        }
        const filePath = imagenService.getRutaImagen(fileNameParam);
        res.download(filePath, fileNameParam);
    } catch (error) {
        next(error);
    }
};

export default { upload, getListFiles, download };
