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
    folder_id: {
        type: Schema.Types.ObjectId,
        ref: "folders"
    },
}, {
    timestamps: true,
});

// Compile model from schema
module.exports = FilesModel = model("folder_shares", FilesSchema);
