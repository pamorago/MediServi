import fs from 'fs/promises';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'assets', 'uploads');

const uploadImagen = async (file?: Express.Multer.File, previousFileName?: string): Promise<string> => {
    if (!file) {
        throw new Error('Debe seleccionar una imagen');
    }

    if (previousFileName) {
        await deleteImagenIfExists(previousFileName);
    }

    return file.filename;
};

const deleteImagenIfExists = async (fileName: string): Promise<void> => {
    const safeFileName = path.basename(fileName);
    const filePath = path.join(uploadDir, safeFileName);

    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch {
        // Si no existe, no se lanza error
    }
};

const listarImagenes = async (): Promise<string[]> => {
    const files = await fs.readdir(uploadDir);
    return files;
};

const getRutaImagen = (fileName: string): string => {
    const safeFileName = path.basename(fileName);
    return path.join(uploadDir, safeFileName);
};

export default { uploadImagen, deleteImagenIfExists, listarImagenes, getRutaImagen };
