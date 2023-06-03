const { Schema, model } = require("mongoose");

const folderSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    folder_name: {
        type: String,
    },
    folder_description: {
        type: String,
    },
    folder_items: {
        type: Number,
        default: 0,
    },
    folder_size: {
        type: Number,
        default: 0,
    },
    sendBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    partner_users: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users"
        },
        permission: {
            type: String,
            enum: ["ALL", "VIEW", "VIEW_UPLOAD"]
        }
    }]
}, {
    timestamps: true,
});

// Compile model from schema
module.exports = FolderModel = model("folders", folderSchema);
