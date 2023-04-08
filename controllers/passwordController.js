const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateEmail, validateNewPassword } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**-------------------------------------------------------
 * @desc Send Reset Password Link
 * @route /api/password/reset-password-link
 * @method POST
 * @access public
 */
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get the user from DB by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "Użytkownik o podanym adresie email nie istnieje!" });
  }

  // 3. Creating VerificationToken
  let verificationToken = await VerificationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();
  }

  // 4. Creating link
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

  // 5. Creating HTML template
  const htmlTemplate = `<a href="${link}">Kliknij tutaj, aby zresetować hasło</a>`;

  // 6. Sending Email
  await sendEmail(user.email, "Zresetuj hasło", htmlTemplate);

  // 7. Response to the client
  res.status(200).json({
    message:
      "Link do resetowania hasła wysłany na Twój adres email, sprawdź swoją skrzynkę odbiorczą",
  });
});

/**-------------------------------------------------------
 * @desc Get Reset Password Link
 * @route /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
 */
module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "Niepoprawny link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "Niepoprawny link" });
  }

  res.status(200).json({ message: "Prawidłowy adres URL" });
});

/**-------------------------------------------------------
 * @desc Reset Password
 * @route /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
 */
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateNewPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "Niepoprawny link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "Niepoprawny link" });
  }

  if (!user.isAccountVerified) {
    user.isAccountVerified = true;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user.password = hashedPassword;
  await user.save();
  await verificationToken.remove();

  res.status(200).json({ message: "Pomyślnie zresetowano hasło, zaloguj się" });
});
