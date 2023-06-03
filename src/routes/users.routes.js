const router = require("express").Router();
const multer = require("multer");
// const checkAuth = require("../helper/checkAuth");

const UserController = require("../controller/user.controller");

// const multer = require("multer");
const storage = multer.diskStorage({
    destination: "uploads",

    filename: function (req, file, cb) {
        let name = `${Date.now().toString()}-${file.originalname}`;
        cb(null, name);
    },
});

var upload = multer({ storage: storage });

// User Login
router.post("/sendEmailOtp", UserController.sendEmailOtp)
router.post("/registerUser", UserController.registerUser)
router.post("/loginUser", UserController.loginUser)
router.post("/checkEmail", UserController.checkEmail)

// router.post("/create", checkAuth, register)
// router.get("/", checkAuth, profile)
// router.patch("/", checkAuth, update)
// router.get("/all_list", getAll)
// router.delete("/:id", deleteOne) // delete
// router.post("/markAttendace/", checkAuth, markAttendace) // getAll
// router.post("/getTodayAttendace/", checkAuth, getTodayAttendace) // getAll
// router.post("/getAllAttendaceByDate/", getAllAttendaceByDate) // getAll
// router.post("/getAllAttendaceByEmail/", getAllAttendaceByEmail) // getAll


module.exports = router;