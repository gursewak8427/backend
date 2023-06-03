const UserModel = require("../models/users.model");

const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { ObjectId } = require("bson");
const { sendOtpEmail } = require("../helpers/sendOtpEmail");



const sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || email == "") {
            res.json({ status: "0", message: "email is required" });
            return;
        }

        let user = await UserModel.findOne({
            email,
        });
        if (user) {
            res.json({
                status: "0",
                message: "Email is already used",
            });
        } else {
            // generate a random 5 digit number
            let randomString = 12345;
            // let randomString = Math.floor(Math.random() * 90000) + 10000;
            // let randomString = (Math.random() + 1).toString(36).substring(7);

            const protocol = req.protocol;
            const host = req.hostname;
            const url = req.originalUrl;
            const port = process.env.PORT || 3006;

            if (host === "localhost") {
                var fullUrl = `${protocol}://${host}:${port}`;
            } else {
                var fullUrl = `${protocol}://${host}:${port}`;
            }

            // Send Otp
            await sendOtpEmail(email, randomString, fullUrl);

            res.json({
                status: "1",
                message: "OTP sent at Email successfully",
                details: {
                    token: "1245-" + randomString + "-44689-123-12344"
                }
            })
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



const registerUser = async (req, res) => {
    try {
        const { email, password, code, token } = req.body;
        let realCode = token.split("-")[1]
        if (realCode != code) {
            res.json({
                status: "0",
                message: "Invalid Code",
            })
            return;
        }
        if (!email || email == "") {
            res.json({ status: "0", message: "email is required" });
            return;
        }


        let user = await UserModel.findOne({
            email,
        });
        if (user) {
            res.json({
                status: "0",
                message: "Email is already used",
            });
        } else {

            if (!password || password == "") {
                res.json({ status: "0", message: "password is required" });
                return;
            }
            if (password?.length < 6) {
                res.json({
                    status: "0",
                    name: "ValidationError",
                    message: "Password must have minimum 6 characters",
                });
                return;
            }

            bcrypt.hash(password, saltRounds, async function (err, hash) {
                // Store hash in your password DB.
                if (err) {
                    res.json({
                        status: "0",
                        message: "Server error occured",
                        details: {
                            error: err,
                        },
                    });
                    return;
                }

                let user = new UserModel({
                    email,
                    password: hash,
                });

                try {
                    let response = await user.save();
                    console.log(response);

                    // generate jwt token
                    let jwtSecretKey = process.env.JWT_SECRET_KEY;
                    let data = {
                        time: Date(),
                        userId: user._id.toString(),
                        email: user.email,
                    };

                    const token = jwt.sign(data, jwtSecretKey);

                    res.json({
                        status: "1",
                        message: "User Registered Successfully",
                        details: {
                            user,
                            token
                        },
                    });
                    return;

                } catch (error) {
                    if (error.name === "ValidationError") {
                        let errorsData = {};
                        Object.keys(error.errors).forEach((key) => {
                            errorsData[key] = error.errors[key].message;
                        });

                        res.json({
                            status: "0",
                            name: "ValidationError",
                            message: "Validation Error",
                            details: {
                                error: errorsData,
                            },
                        });
                        return;
                    }

                    console.log(error);
                    return;
                }

            });
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


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || email == "") {
            res.json({ status: "0", message: "email is required" });
            return;
        }


        let user = await UserModel.findOne({
            email,
        });
        if (!user) {
            res.json({
                status: "0",
                message: "Email not found",
            });
        } else {

            if (!password || password == "") {
                res.json({ status: "0", message: "password is required" });
                return;
            }

            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    res.json({
                        status: "0",
                        message: "Server Error Occured",
                        details: {
                            error: err,
                        },
                    });
                    return;
                }

                if (!result) {
                    res.json({
                        status: "0",
                        message: "Password is wrong",
                    });
                    return;
                }

                try {

                    // generate jwt token
                    let jwtSecretKey = process.env.JWT_SECRET_KEY;
                    let data = {
                        time: Date(),
                        userId: user._id.toString(),
                        email: user.email,
                    };

                    const token = jwt.sign(data, jwtSecretKey);

                    res.json({
                        status: "1",
                        message: "User Login Successfully",
                        details: {
                            user,
                            token
                        },
                    });
                    return;

                } catch (error) {
                    if (error.name === "ValidationError") {
                        let errorsData = {};
                        Object.keys(error.errors).forEach((key) => {
                            errorsData[key] = error.errors[key].message;
                        });

                        res.json({
                            status: "0",
                            name: "ValidationError",
                            message: "Validation Error",
                            details: {
                                error: errorsData,
                            },
                        });
                        return;
                    }

                    console.log(error);
                    return;
                }

            });
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
function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
    return (false)
}

const checkEmail = async (req, res) => {
    try {
        const { sharedEmail } = req.body;
        if (!sharedEmail || sharedEmail == "") {
            res.json({ status: "0", message: "Email is required" });
            return;
        }

        if(!ValidateEmail(sharedEmail)){
            res.json({ status: "0", message: "Invalid Email" });
            return;
        }

        let user = await UserModel.findOne({
            email: sharedEmail,
        });
        if (!user) {
            res.json({
                status: "0",
                message: "This Email is not registered",
            });
        } else {
            res.json({
                status: "1",
                message: "You can share to this email",
                details: {
                    userId: user._id
                }
            });
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


module.exports = {
    sendEmailOtp,
    registerUser,
    loginUser,
    checkEmail
}
