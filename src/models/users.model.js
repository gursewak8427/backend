const { Schema, model } = require("mongoose");

const adminSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        required: true,
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
    },
});

// Compile model from schema
module.exports = UserModel = model("users", adminSchema);
