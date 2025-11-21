const express = require('express');
const router = express.Router();
const User = require('../../models/User.js');
const upload = require('../../middleware/multer.js');
const authenticateToken = require('../../middleware/authenticate.js');
const streamifier = require('streamifier');
const cloudinary = require('../../config/cloudinary.js');

// @route   POST /api/profile/avatar
// @desc    Upload or update user profile picture (Cloudinary)
// @access  Private

router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const foundUser = await User.findById(req.user._id);
        if (!foundUser) return res.status(404).json({ msg: 'User not found' });

        // 🧹 Delete old image from Cloudinary if exists
        if (foundUser.avatarPublicId) {
            await cloudinary.uploader.destroy(foundUser.avatarPublicId);
        }

        // ☁️ Upload new image directly from memory (no local file)
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ msg: 'Cloudinary upload failed' });
                }

                // 💾 Save URL and public_id in MongoDB
                foundUser.avatar = result.secure_url;
                foundUser.avatarPublicId = result.public_id;
                await foundUser.save();

                res.json({
                    message: 'Profile picture uploaded successfully',
                    avatarUrl: result.secure_url,
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/avatar', async (req, res) => {
    try {
        const foundUser = await User.findById(req.user._id);
        if (!foundUser) return res.status(404).json({ msg: 'User not found' });

        res.json({
            avatarUrl: foundUser.avatar || null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;