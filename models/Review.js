const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 50,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

//user can leave only 1 review per product - compound index
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

//using Aggregate pipelines
//creating statics method on schema
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  //invoking this.aggregate method,passing an array
  const result = await this.aggregate([
    //get all reviews where product property matches productID
    { $match: { product: productId } },
    //group and create calculated properties
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  //findOneAndUpdate {define match criteria},{spec update logic}
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  //calling statics method
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  //calling statics method
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
