const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all health tips
router.get("/", async (req, res) => {
	try {
		const healthTips = await prisma.healthTip.findMany();
		res.json(healthTips);
	} catch (error) {
		res.status(500).json({ error: "Error fetching health tips" });
	}
});

// Add a new health tip
router.post("/", async (req, res) => {
	const { title, content } = req.body;
	try {
		const newHealthTip = await prisma.healthTip.create({
			data: {
				title,
				content,
			},
		});
		res.status(201).json(newHealthTip);
	} catch (error) {
		res.status(500).json({ error: "Error adding health tip" });
	}
});

// Update a health tip by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const updatedHealthTip = await prisma.healthTip.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        content,
      },
    });
    res.status(200).json(updatedHealthTip);
  } catch (error) {
    res.status(500).json({ error: "Error updating health tip" });
  }
});


// Delete a health tip by ID
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await prisma.healthTip.delete({
			where: {
				id: parseInt(id),
			},
		});
		res.status(200).json({ message: "Health tip deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Error deleting health tip" });
	}
});

module.exports = router;
