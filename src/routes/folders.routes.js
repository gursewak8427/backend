const router = require("express").Router();
const multer = require("multer");
const checkAuth = require("../helpers/checkAuth");

// const UserController = require("../controller/user.controller");
const FolderController = require("../controller/folder.controller");

// const multer = require("multer");
const storage = multer.diskStorage({
    destination: "uploads",

    filename: function (req, file, cb) {
        let name = `${Date.now().toString()}-${file.originalname}`;
        cb(null, name);
    },
});

var upload = multer({ storage: storage });

// Folder APIs
router.post("/createFolder", checkAuth, FolderController.createFolder)
router.get("/", checkAuth, FolderController.getFolders)
router.post("/uploadFile", checkAuth, upload.single("file"), FolderController.uploadFile)
router.post("/files", checkAuth, FolderController.getFiles)
router.delete("/files", checkAuth, FolderController.deleteFiles)
router.post("/files/share", checkAuth, FolderController.shareFiles)
router.post("/share", checkAuth, FolderController.shareFolder)
router.get("/mySharedData", checkAuth, FolderController.mySharedData)
router.post("/addPartnerToFolder", checkAuth, FolderController.addPartnerToFolder)

module.exports = router;