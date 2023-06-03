const { Schema, model } = require("mongoose");

const FilesSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    folder_id: {
        type: Schema.Types.ObjectId,
        ref: "folders"
    },
    file_name: {
        type: String,
    },
    file_size: {
        type: Number,
        default: 0,
    },
    file_type: {
        type: String,
        enum: ["AUDIO", "VIDEO", "ZIP", "PDF", "OTHER", "IMAGE"],
    },
    isFolderShare: {
        type: Boolean,
        default: false,
    },
    sendBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null,
    }
}, {
    timestamps: true,
});

// Compile model from schema
module.exports = FilesModel = model("files", FilesSchema);
