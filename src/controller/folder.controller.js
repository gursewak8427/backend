const UserModel = require("../models/users.model");
const FolderModel = require("../models/folders.model");
const FilesModel = require("../models/files.model");
const FilesShareModel = require("../models/files_shares.model");

const { ObjectId } = require("bson");

const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { sendOtpEmail } = require("../helpers/sendOtpEmail");


const createFolder = async (req, res) => {
    try {
        const { folder_name, folder_description } = req.body;
        const { userId } = req.userData

        if (!folder_name || folder_name == "") {
            res.json({ status: "0", message: "Folder Name is required" });
            return;
        }


        let myFolder = await FolderModel.findOne({
            folder_name,
        });
        if (myFolder) {
            res.json({
                status: "0",
                message: "Folder is already exists",
            });
        } else {



            console.log({ userId });

            myFolder = new FolderModel({
                folder_name,
                folder_description,
                user_id: new ObjectId(userId),
            });

            let response = await myFolder.save();
            console.log(response);

            res.json({
                status: "1",
                message: "Folder Created Successfully",
                details: {
                    folder: response
                }
            });
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            status: "0",
            message: "Server Error Occured",
            details: {
                error,
            },
        });
    }
}

// 204 for No-Content but success;
const getFolders = async (req, res) => {
    const userId = req.userData.userId;

    let myFolders = await FolderModel.find({
        user_id: userId,
        sendBy: null,
    }).populate("user_id").populate("partner_users.userId").populate("sendBy");;

    if (myFolders.length === 0) {
        res.json({
            status: 204,
            message: "You have not any folder",
            details: { myFolders },
        })
    } else {
        res.json({
            status: 1,
            message: "Folders Found",
            details: { myFolders },
        })
    }
}

const uploadFile = async (req, res) => {
    console.log(req.file)

    const { filename, size, mimetype } = req.file;
    const { folderId } = req.body;
    const { userId } = req.userData;

    const getFileType = (mimeType) => {
        if (mimeType.includes('audio')) {
            return 'AUDIO';
        } if (mimeType.includes('video')) {
            return 'VIDEO';
        } else if (mimeType.includes('image')) {
            return 'IMAGE';
        } else if (mimeType.includes('pdf')) {
            return 'PDF';
        } else if (mimeType.includes('zip')) {
            return 'ZIP';
        } else {
            return 'OTHER';
        }
    };

    // Get the fileType based on the mimetype
    const fileType = getFileType(mimetype);


    let response = new FilesModel({
        user_id: new ObjectId(userId),
        folder_id: new ObjectId(folderId),
        file_name: filename,
        file_size: size,
        file_type: fileType,
    })

    await response.save();

    let folderUpdateResponse = await FolderModel.updateOne({
        _id: new ObjectId(folderId),
    }, {
        $inc: { folder_items: 1, folder_size: size },
    })

    console.log({ folderUpdateResponse });

    res.json({
        status: "1",
        message: "File Uploaded Successfully"
    })
}

// 204 for No-Content but success;
const getFiles = async (req, res) => {
    const userId = req.userData.userId;
    const { folderId } = req.body;


    const folderDetails = await FolderModel.findById(new ObjectId(folderId));
    console.log("im here", folderId)

    let myFiles = await FilesModel.find({
        folder_id: folderId,
        sendBy: folderDetails.sendBy,
    }).populate("user_id").populate("folder_id");

    if (myFiles.length === 0) {
        res.json({
            status: 204,
            message: "You have not any File",
            details: { myFiles },
        })
    } else {
        res.json({
            status: 1,
            message: "Files Found",
            details: { myFiles, baseUrl: "http://localhost:3006/uploads/" },
        })
    }
}

const mySharedData = async (req, res) => {
    const userId = req.userData.userId;

    let myFolders = await FolderModel.find(
        {
            $or: [
                {
                    user_id: userId,
                    sendBy: { $ne: null },
                },
                { "partner_users.userId": userId, }
            ]
        }).populate("user_id").populate("partner_users.userId").populate("sendBy");

    let myFiles = await FilesModel.find({
        user_id: userId,
        sendBy: { $ne: null },
        isFolderShare: false,
    }).populate("user_id").populate("folder_id").populate("sendBy");

    res.json({
        status: 1,
        message: "Files Found",
        details: { myFiles, myFolders, baseUrl: "http://localhost:3006/uploads/" },
    })
}

const deleteFiles = async (req, res) => {
    // delete multiple ids
    let { selectedIds } = req.body;
    const objectIds = selectedIds.map((id) => new ObjectId(id));

    console.log({ objectIds });
    // Delete the objects matching the IDs
    const result = await FilesModel.deleteMany({ _id: { $in: objectIds } });
    console.log({ result });
    res.json({
        status: "1",
        message: "Deleted Successfully"
    })
}

const shareFiles = async (req, res) => {
    const { userId } = req.userData;
    let { selectedIds, UserTwoIds /* array */, } = req.body;
    // selectedIds = selectedIds.map((id) => new ObjectId(id));
    // UserTwoIds = UserTwoIds.map((id) => new ObjectId(id));

    // var UserTwoIdArray = emails.map(async email => {
    //     return (await UserModel.findOne({
    //         email
    //     }))._id

    // })
    var data = []
    for (let i = 0; i < selectedIds.length; i++) {
        var fileId = selectedIds[i];
        for (let j = 0; j < UserTwoIds.length; j++) {
            var userIdTwo = UserTwoIds[j];
            let fileDetails = await FilesModel.findById(new ObjectId(fileId));
            if (fileDetails) {
                data.push({
                    user_id: new ObjectId(userIdTwo.userId),
                    folder_id: new ObjectId(fileDetails.folder_id),
                    file_name: fileDetails.file_name,
                    file_size: fileDetails.file_size,
                    file_type: fileDetails.file_type,
                    sendBy: new ObjectId(userId),
                })
            }
        }
    }
    console.log({ data })

    // Delete the objects matching the IDs
    const result = await FilesModel.insertMany(data);

    res.json({
        status: "1",
        message: "Files Share SuccessfullyA"
    })
}

const shareFolder = async (req, res) => {
    const { userId } = req.userData;
    let { folderId, UserTwoIds /* array */, } = req.body;
    // selectedIds = selectedIds.map((id) => new ObjectId(id));
    // UserTwoIds = UserTwoIds.map((id) => new ObjectId(id));

    // var UserTwoIdArray = emails.map(async email => {
    //     return (await UserModel.findOne({
    //         email
    //     }))._id

    // })
    // var data = []
    // var fileData = []
    let folderDetail = await FolderModel.findById(new ObjectId(folderId));
    let FilesList = await FilesModel.find({ folder_id: new ObjectId(folderId) });

    for (let j = 0; j < UserTwoIds.length; j++) {
        var userIdTwo = UserTwoIds[j];
        let data = {
            user_id: new ObjectId(userIdTwo.userId),
            folder_name: folderDetail.folder_name,
            folder_description: folderDetail.folder_description,
            folder_items: folderDetail.folder_items,
            folder_size: folderDetail.folder_size,
            sendBy: new ObjectId(userId),
        }
        const folderResponse = await FolderModel.create(data);

        let fileDataArr = []
        for (let k = 0; k < FilesList.length; k++) {
            const fileD = FilesList[k];
            fileDataArr.push({
                user_id: new ObjectId(userIdTwo.userId),
                folder_id: new ObjectId(folderResponse._id),
                file_name: fileD.file_name,
                file_size: fileD.file_size,
                file_type: fileD.file_type,
                isFolderShare: true,
                sendBy: new ObjectId(userId),
            })
        }
        console.log({ fileDataArr });
        await FilesModel.insertMany(fileDataArr);
    }

    res.json({
        status: "1",
        message: "Folder Share SuccessfullyA"
    })
}

const addPartnerToFolder = async (req, res) => {
    const { userId } = req.userData;
    let { folderId, UserTwoIds /* array */, permission } = req.body;
    let folderDetail = await FolderModel.findById(new ObjectId(folderId));
    for (let index = 0; index < UserTwoIds.length; index++) {
        const uId = UserTwoIds[index];
        folderDetail.partner_users.push({
            userId: new ObjectId(uId.userId),
            permission
        })
    }
    console.log(folderDetail.partner_users);
    await folderDetail.save();
    res.json({
        status: "1",
        message: "User added to folder successfully"
    })
}
// const shareFiles = async (req, res) => {
//     const { userId } = req.userData;
//     let { selectedIds, UserTwoIds /* array */, } = req.body;
//     // selectedIds = selectedIds.map((id) => new ObjectId(id));
//     // UserTwoIds = UserTwoIds.map((id) => new ObjectId(id));

//     // var UserTwoIdArray = emails.map(async email => {
//     //     return (await UserModel.findOne({
//     //         email
//     //     }))._id

//     // })
//     var data = []
//     for (let i = 0; i < selectedIds.length; i++) {
//         var fileId = selectedIds[i];
//         for (let j = 0; j < UserTwoIds.length; j++) {
//             var userIdTwo = UserTwoIds[j];
//             data.push({
//                 user_id_one: new ObjectId(userId),
//                 user_id_two: new ObjectId(userIdTwo.userId),
//                 file_id: new ObjectId(fileId),
//             })
//             // user_id: {
//             //     type: Schema.Types.ObjectId,
//             //     ref: "users"
//             // },
//             // folder_id: {
//             //     type: Schema.Types.ObjectId,
//             //     ref: "folders"
//             // },
//             // file_name: {
//             //     type: String,
//             // },
//             // file_size: {
//             //     type: Number,
//             //     default: 0,
//             // },
//             // file_type: {
//             //     type: String,
//             //     enum: ["AUDIO", "VIDEO", "ZIP", "PDF", "OTHER", "IMAGE"],
//             // },
//         }
//     }
//     console.log({ data })

//     // Delete the objects matching the IDs
//     const result = await FilesShareModel.insertMany(data);

//     res.json({
//         status: "1",
//         message: "Files Share SuccessfullyA"
//     })
// }

module.exports = {
    createFolder,
    getFolders,
    uploadFile,
    getFiles,
    deleteFiles,
    shareFiles,
    mySharedData,
    shareFolder,
    addPartnerToFolder
}
