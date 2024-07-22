import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'coverImage') {
            uploadPath += 'covers/';
        } else if (file.fieldname === 'musicFile') { 
            uploadPath += 'audios/';
        } else if (file.fieldname === 'diploma') {
            uploadPath += 'diplomas/';
        } else if (file.fieldname === 'additions') {
            uploadPath += 'additions/';
        }
        cb(null, uploadPath); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

// Dosya türü filtresi
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp3', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Multer konfigürasyonu
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, 
    fileFilter: fileFilter
});

const uploadMultiple = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'musicFile', maxCount: 1 }, 
    { name: 'diploma', maxCount: 1 },
    { name: 'additions', maxCount: 3 }
]);

export default uploadMultiple;
