const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
  .get(getAllProducts);

//upload image must be above :id, otherwise would be treated as :id
router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);

//routes with :id
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
