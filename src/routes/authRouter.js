// routers/authRouter.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

const createDefaultAdmin = async () => {
	try {
		const existingAdmin = await prisma.user.findFirst({
			where: {
				role: "ADMIN",
			},
		});

		const adminName = process.env.DEFAULT_ADMIN_NAME;
		const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
		const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
		const adminPicture = process.env.DEFAULT_ADMIN_PICTURE;

		if (
			!existingAdmin &&
			adminName &&
			adminEmail &&
			adminPassword &&
			adminPicture
		) {
			const hashedPassword = await bcrypt.hash(adminPassword, 10);

			await prisma.user.create({
				data: {
					name: adminName,
					email: adminEmail,
					password: hashedPassword,
					role: "ADMIN",
					approved: true,
					picture: adminPicture,
				},
			});
			console.log("Admin user created successfully.");
		} else {
			console.log("Admin user already exists or missing default values.");
		}
	} catch (error) {
		console.error("Error creating admin user:", error);
	}
};

const createDefaultPatient = async () => {
	try {
		const existingPatient = await prisma.patient.findFirst();

		const defaultPatientName = process.env.DEFAULT_PATIENT_NAME;
		const defaultPatientEmail = process.env.DEFAULT_PATIENT_EMAIL;
		const defaultPatientPassword = process.env.DEFAULT_PATIENT_PASSWORD;
		const defaultPatientPicture = process.env.DEFAULT_PATIENT_PICTURE;
		const defaultPatientHealthRecord =
			process.env.DEFAULT_PATIENT_HEALTH_RECORD;

		if (
			!existingPatient &&
			defaultPatientName &&
			defaultPatientEmail &&
			defaultPatientPassword &&
			defaultPatientPicture &&
			defaultPatientHealthRecord
		) {
			const hashedPassword = await bcrypt.hash(defaultPatientPassword, 10);

			await prisma.patient.create({
				data: {
					healthRecord: defaultPatientHealthRecord,
					User: {
						create: {
							role: "PATIENT",
							name: defaultPatientName,
							email: defaultPatientEmail,
							password: hashedPassword,
							approved: true,
							picture: defaultPatientPicture,
						},
					},
				},
			});
			console.log("Default Patient created successfully.");
		} else {
			console.log("Default Patient already exists or missing default values.");
		}
	} catch (error) {
		console.error("Error creating default Patient:", error);
	}
};

const createDefaultDoctor = async () => {
	try {
		const existingDoctor = await prisma.doctor.findFirst();

		const defaultDoctorName = process.env.DEFAULT_DOCTOR_NAME;
		const defaultDoctorEmail = process.env.DEFAULT_DOCTOR_EMAIL;
		const defaultDoctorPassword = process.env.DEFAULT_DOCTOR_PASSWORD;
		const defaultDoctorPicture = process.env.DEFAULT_DOCTOR_PICTURE;
		const defaultDoctorSpecialization =
			process.env.DEFAULT_DOCTOR_SPECIALIZATION;
		const defaultDoctorContactNumber =
			process.env.DEFAULT_DOCTOR_CONTACT_NUMBER;

		if (
			!existingDoctor &&
			defaultDoctorName &&
			defaultDoctorEmail &&
			defaultDoctorPassword &&
			defaultDoctorPicture &&
			defaultDoctorSpecialization &&
			defaultDoctorContactNumber
		) {
			const hashedPassword = await bcrypt.hash(defaultDoctorPassword, 10);

			await prisma.doctor.create({
				data: {
					specialization: defaultDoctorSpecialization,
					contactNumber: defaultDoctorContactNumber,
					User: {
						create: {
							role: "DOCTOR",
							name: defaultDoctorName,
							email: defaultDoctorEmail,
							password: hashedPassword,
							approved: true,
							picture: defaultDoctorPicture,
						},
					},
				},
			});
			console.log("Default Doctor created successfully.");
		} else {
			console.log("Default Doctor already exists or missing default values.");
		}
	} catch (error) {
		console.error("Error creating default Doctor:", error);
	}
};

const createDefaultIntern = async () => {
	try {
		const existingIntern = await prisma.intern.findFirst();

		const defaultInternName = process.env.DEFAULT_INTERN_NAME;
		const defaultInternEmail = process.env.DEFAULT_INTERN_EMAIL;
		const defaultInternPassword = process.env.DEFAULT_INTERN_PASSWORD;
		const defaultInternPicture = process.env.DEFAULT_INTERN_PICTURE;

		if (
			!existingIntern &&
			defaultInternName &&
			defaultInternEmail &&
			defaultInternPassword &&
			defaultInternPicture
		) {
			const hashedPassword = await bcrypt.hash(defaultInternPassword, 10);

			await prisma.intern.create({
				data: {
					User: {
						create: {
							role: "INTERN",
							name: defaultInternName,
							email: defaultInternEmail,
							password: hashedPassword,
							approved: true,
							picture: defaultInternPicture,
						},
					},
				},
			});
			console.log("Default Intern created successfully.");
		} else {
			console.log("Default Intern already exists or missing default values.");
		}
	} catch (error) {
		console.error("Error creating default Intern:", error);
	}
};

const createDefaultUsers = async () => {
	const defaultPersonsInfo = [
		{
			email: process.env.DEFAULT_ADMIN_EMAIL,
			role: "ADMIN",
		},
		{
			email: process.env.DEFAULT_PATIENT_EMAIL,
			role: "PATIENT",
		},
		{
			email: process.env.DEFAULT_DOCTOR_EMAIL,
			role: "DOCTOR",
		},
		{
			email: process.env.DEFAULT_INTERN_EMAIL,
			role: "INTERN",
		},
	];

	try {
		defaultPersonsInfo.forEach(async (person) => {
			const defaultPersonEmail = person.email;
			const defaultPersonRole = person.role;

			if (
				defaultPersonEmail &&
				["ADMIN", "DOCTOR", "PATIENT", "INTERN"].includes(defaultPersonRole)
			) {
				const defaultUser = await prisma.user.findUnique({
					where: {
						email: defaultPersonEmail,
						role: defaultPersonRole,
					},
				});
				if (!defaultUser) {
					if (defaultPersonRole === "ADMIN") {
						await createDefaultAdmin();
					}
					if (defaultPersonRole === "DOCTOR") {
						await createDefaultDoctor();
					}
					if (defaultPersonRole === "PATIENT") {
						await createDefaultPatient();
					}
					if (defaultPersonRole === "INTERN") {
						await createDefaultIntern();
					}
				}
			}
		});
	} catch {
		console.log("Issue making default users");
	}
};

router.post("/register", async (req, res) => {
	createDefaultUsers();

	let {
		role,
		name,
		email,
		password,
		specialization,
		contactNumber,
		healthRecord,
		picture,
	} = req.body;

	try {
		let roleSpecificDetails;

		const hashedPassword = await bcrypt.hash(password, 10);
		const approved = role === "PATIENT" ? true : false;

		picture = picture ? picture : process.env.DEFAULT_USER_PICTURE;

		if (role === "DOCTOR") {
			roleSpecificDetails = await prisma.doctor.create({
				data: {
					specialization,
					contactNumber,
					User: {
						create: {
							role,
							name,
							email,
							password: hashedPassword,
							approved,
							picture,
						},
					},
				},
			});
		} else if (role === "PATIENT") {
			roleSpecificDetails = await prisma.patient.create({
				data: {
					healthRecord,
					User: {
						create: {
							role,
							name,
							email,
							password: hashedPassword,
							approved,
							picture,
						},
					},
				},
			});
		} else if (role === "INTERN") {
			roleSpecificDetails = await prisma.intern.create({
				data: {
					// Add intern-specific data here
					User: {
						create: {
							role,
							name,
							email,
							password: hashedPassword,
							approved,
							picture,
						},
					},
				},
			});
		} else {
			return res.status(400).json({ error: "Invalid role" });
		}

		res.status(201).json(roleSpecificDetails);
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			error: "Error creating user and associated instance",
			details: error.message,
		});
	}
});

// Login route
router.post("/login", async (req, res) => {
	createDefaultUsers();

	const { email, password } = req.body;

	try {
		// Check if user exists
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).send("Invalid credentials.");
		}

		// Create token
		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		// res.json({ token });
		res.status(201).json({ user, token });
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// update user info
router.patch("/updateUserInfo", async (req, res) => {
	const { userId, updates } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Update user properties based on 'updates' object received
		const updatedUser = await prisma.user.update({
			where: {
				id: userId,
			},
			data: updates,
		});

		res.status(200).json(updatedUser);
	} catch (error) {
		console.error("Error updating user info:", error);
		res.status(500).json({
			error: "Error updating user information",
			details: error.message,
		});
	}
});

module.exports = router;
