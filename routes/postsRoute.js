const router = require("express").Router();
const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  updatePostVideoCtrl, // Dodano nową funkcję do aktualizacji pliku wideo
  toggleLikeCtrl,
} = require("../controllers/postsController");
const { verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const mediaUpload = require("../middlewares/mediaUpload");

// /api/posts
router
  .route("/")
  .post(verifyToken, mediaUpload.single("media"), createPostCtrl) // Zmieniono z "image" na "media"
  .get(getAllPostsCtrl);

// /api/posts/count
router.route("/count").get(getPostCountCtrl);

// /api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePostCtrl)
  .delete(validateObjectId, verifyToken, deletePostCtrl)
  .put(validateObjectId, verifyToken, updatePostCtrl);

// /api/posts/update-image/:id
router.route("/update-image/:id").put(
  validateObjectId,
  verifyToken,
  mediaUpload.single("media"), // Zmieniono z "image" na "media"
  updatePostImageCtrl
);

// /api/posts/update-video/:id
router.route("/update-video/:id").put(
  validateObjectId,
  verifyToken,
  mediaUpload.single("media"), // Zmieniono z "image" na "media"
  updatePostVideoCtrl
);

// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;
