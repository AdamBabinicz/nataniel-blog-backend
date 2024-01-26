const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");

/**-------------------------------------------------------
 * @desc Create New Post
 * @route /api/posts
 * @method POST
 * @access private (only logged in user)
 */
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1. Validation for image or video
  if (!req.file) {
    return res.status(400).json({ message: "Nie wybrano pliku" });
  }

  // 2. Upload media (image or video) to Cloudinary
  const filePath = path.join(__dirname, `../${req.file.path}`);
  const result = await cloudinaryUploadImage(filePath);

  // 3. Create new post and save it to DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    media: {
      url: result.secure_url,
      publicId: result.public_id,
      contentType: req.file.mimetype,
    },
  });

  // 4. Send response to the client
  res.status(201).json(post);

  // 5. Remove media file from the server
  fs.unlinkSync(filePath);
});

/**-------------------------------------------------------
 * @desc Update Post Video
 * @route /api/posts/upload-video/:id
 * @method PUT
 * @access private (only owner or the post)
 */
module.exports.updatePostVideoCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "Nie wybrano pliku wideo" });
  }

  // 2. Get the post from DB and check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Nie znaleziono posta" });
  }

  // 3. Check if this post belongs to the logged-in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "Odmowa dostępu, nie masz pozwolenia" });
  }

  // 4. Delete the old video
  await cloudinaryRemoveImage(post.media.publicId);

  // 5. Upload new video
  const filePath = path.join(__dirname, `../${req.file.path}`);
  const result = await cloudinaryUploadImage(filePath);

  // 6. Update the video field in the DB
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        media: {
          url: result.secure_url,
          publicId: result.public_id,
          contentType: req.file.mimetype,
        },
      },
    },
    { new: true }
  );

  // 7. Send response to the client
  res.status(200).json(updatedPost);

  // 8. Remove video file from the server
  fs.unlinkSync(filePath);
});

// ... (inne funkcje)
