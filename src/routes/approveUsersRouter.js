// routes/approveUsers.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get pending user registrations (assuming you have a 'approved' field in the User model)
router.get("/", async (req, res) => {
	try {
		const pendingUsers = await prisma.user.findMany({
			where: {
				approved: false, // Filter pending users
			},
			select: {
				id: true,
				name: true,
        email: true,
        role: true
				// Include other relevant fields
			},
		});
		res.json(pendingUsers);
	} catch (error) {
		res.status(500).json({ error: "Error fetching pending users" });
	}
});

// Approve a user by ID
router.put("/:id/approve", async (req, res) => {
	const { id } = req.params;
	try {
		const updatedUser = await prisma.user.update({
			where: {
				id: parseInt(id),
			},
			data: {
				approved: true, // Mark user as approved
			},
		});
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ error: "Error approving user" });
	}
});

// Decline a user by ID
router.put("/:id/decline", async (req, res) => {
	const { id } = req.params;
	try {
		const updatedUser = await prisma.user.update({
			where: {
				id: parseInt(id),
			},
			data: {
				role: "PATIENT", // Set role to PATIENT
				approved: true, // Mark user as declined but true for patient
			},
		});
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({ error: "Error declining user" });
	}
});

module.exports = router;
