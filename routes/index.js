const router = require("express").Router();
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const verifyJWT = require("../middleware/verifyJWT");

router.use("/auth", authRoutes);
router.use("/users", verifyJWT,  userRoutes);

module.exports = router;