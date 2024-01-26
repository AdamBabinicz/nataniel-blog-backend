const router = require("express").Router();
const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profileMediaUploadCtrl, // Zaktualizowano nazwę funkcji
  deleteUserProfileCtrl,
} = require("../controllers/usersController");
const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const mediaUpload = require("../middlewares/mediaUpload");

// api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

// api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization, deleteUserProfileCtrl);

// api/users/profile/media-upload
router
  .route("/profile/media-upload")
  .post(verifyToken, mediaUpload.single("media"), profileMediaUploadCtrl);

// api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

module.exports = router;
