const multer = require('multer');

// Store the file in memory, not on disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const mime = allowed.test(file.mimetype);
    if (mime) cb(null, true);
    else cb(new Error('Only images are allowed (jpeg, jpg, png)'));
};

const upload = multer({ storage, fileFilter });
module.exports = upload;