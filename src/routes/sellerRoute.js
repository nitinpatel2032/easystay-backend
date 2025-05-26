const { Router } = require("express");
const { sellerController } = require("../controllers/sellerController");

const router = Router();
router.use("/seller", sellerController);

module.exports = router;
