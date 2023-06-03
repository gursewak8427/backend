const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendOtpEmail = async (email, otp, baseUrl) => {
    // send email
    console.log(process.env.EMAIL)
    console.log(process.env.EMAIL_PASSWORD)
    const transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, '/src/helpers/html/otpEmail.html');
    const logoPath = baseUrl + "/uploads/agent/logo3.png";
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        otp,
        logo: logoPath
    };
    const htmlToSend = template(replacements);

    console.log("Im here")

    transport.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "MyLocker Verification Code ",
        html: htmlToSend,
    }).catch(err => console.log(err));
};

module.exports = { sendOtpEmail }
