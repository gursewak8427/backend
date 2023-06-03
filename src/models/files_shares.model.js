const { Schema, model } = require("mongoose");

const FilesSchema = new Schema({
    user_id_one: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    user_id_two: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    file_id: {
        type: Schema.Types.ObjectId,
        ref: "files"
    },
}, {
    timestamps: true,
});

// Compile model from schema
module.exports = FilesShareModel = model("file_shares", FilesSchema);
