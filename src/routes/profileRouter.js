const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/:userId", async (req, res) => {
	const { userId } = req.params;

	try {
		const userProfile = await prisma.user.findUnique({
			where: { id: parseInt(userId) },
			include: {
				Doctor: true,
				Patient: {
					include: {
            Query: {
              include: {
                Suggestions: true
              }
            },
					},
				},
				Intern: true,
				Appointments: true,
			},
		});

		res.json({ userProfile });
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ error: "Error fetching user profile" });
	}
});

module.exports = router;