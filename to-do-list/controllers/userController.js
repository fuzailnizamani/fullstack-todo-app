const cloudinary = require('../config/cloudinary.js');
const User = require('../models/User.js');

const deleteProfilePicture = async (req, res) => {
  try {
    const foundUser = await User.findById(req.user._id);
    if (!foundUser || !foundUser.avatarPublicId) {
      return res.status(404).json({ msg: 'No profile picture found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(foundUser.avatarPublicId);

    // Remove from DB
    foundUser.avatar = null;
    foundUser.avatarPublicId = null;
    await foundUser.save();

    res.json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting profile picture" });
  }
};

module.exports =  deleteProfilePicture;