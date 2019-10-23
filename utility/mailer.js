require("dotenv").config();
const nodemailer = require("nodemailer");

let transport = nodemailer.createTransport({
	host: process.env.MAILTRAP_HOST,
	port: process.env.MAILTRAP_PORT,
	auth: {
		user: process.env.MAILTRAP_USERNAME,
		pass: process.env.MAILTRAP_PASSWORD
	}
});

class Mailer {

	static async sendPasswordResetLink(email) {
		const link = `${process.env.APP_URL}/api/v1/users/reset-password?${email}`;
		const message = {
			from: process.env.APP_EMAIL,
			to: email,
			subject: "Reset Your Password",
			html: `Please click <a href=${link}>Here</a> to reset your password`
		};
		await transport.sendMail(message);
	}
}

module.exports = Mailer;
