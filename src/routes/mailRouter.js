const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
	try {

		const {
			nameOfReciever,
			mailOfReciever,
			mailSubject,
			mailBodyIntro,
			mailBodyOutro
		} = req.body;

		let config = {
			service: "gmail",
			auth: {
				user: process.env.MAIL_OF_SENDER_CONFIGURED,
				pass: process.env.PASSWORD_OF_SENDER_MAIL_CONFIGURED,
			},
		};

		let mailInfoForPatient = {
			body: {
				name: nameOfReciever,
				intro: mailBodyIntro,
				outro: mailBodyOutro,
			},
		};

		let MailGenerator = new Mailgen({
			theme: "default",
			product: {
				name: "Mailgen",
				link: "https://mailgen.js/",
			},
		});

		let mail = MailGenerator.generate(mailInfoForPatient);
		let message = {
			from: process.env.MAIL_OF_SENDER_CONFIGURED,
			to: mailOfReciever,
			subject: mailSubject,
			html: mail,
		};

		let transporter = nodemailer.createTransport(config);

		transporter
			.sendMail(message)
			.then(() => {
				res.status(201).json({
					message: "Email sent successfully.",
				});
			})
			.catch((error) => {
				console.log(error.message);
				res.status(500).json({
					error: "Email could not be sent. Please try again later.",
				});
			});
	} catch (error) {
		res.status(500).json({ error: "Error fetching pending users" });
	}
});

module.exports = router;
