const mongoose = require("mongoose");
const Joi = require("joi");

// Post Schema
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    media: {
      type: {
        url: String,
        publicId: String,
        contentType: String, // Dodane dla identyfikacji typu (image/video)
      },
      default: {
        url: "",
        publicId: null,
        contentType: "",
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    video: {
      type: {
        url: String,
        publicId: String,
      },
      default: {
        url: "",
        publicId: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Comment For This Post
PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

// Post Model
const Post = mongoose.model("Post", PostSchema);

// Validate Create Post
function validateCreatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().min(10).required(),
    category: Joi.string().trim().required(),
    // Dodano walidację dla pola video
    video: Joi.object({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
  });
  return schema.validate(obj);
}

// Validate Update Post
function validateUpdatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().min(10),
    category: Joi.string().trim(),
    // Dodano walidację dla pola video
    video: Joi.object({
      url: Joi.string(),
      publicId: Joi.string(),
    }),
  });
  return schema.validate(obj);
}

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
