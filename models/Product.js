const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [100, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  //1. set up this model to accept virtuals
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

  //2. create virtual property
ProductSchema.virtual("reviews", {
  //ref: model name > Review
  ref: "Review",
  localField: "_id",
  //foreignField: field in Review model we want to reference
  foreignField: "product",
  //justOne: false = we want a list
  justOne: false,
  //match:{rating:1.2}
});

ProductSchema.pre("remove", async function (next) {
  //this.model("Review") - when deleting product, remove all associated reviews
  await this.model("Review").deleteMany({ product: this._id });
});


module.exports = mongoose.model("Product", ProductSchema);