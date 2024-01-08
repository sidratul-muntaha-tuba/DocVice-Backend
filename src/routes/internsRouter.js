const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all interns
router.get("/interns", async (req, res) => {
  try {
    const interns = await prisma.intern.findMany();
    res.json(interns);
  } catch (error) {
    res.status(500).json({ error: "Error fetching interns" });
  }
});

// Get intern by ID
router.get("/interns/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const intern = await prisma.intern.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(intern);
  } catch (error) {
    res.status(500).json({ error: "Error fetching intern" });
  }
});

// Create an intern
router.post("/interns", async (req, res) => {
  const { userId } = req.body;
  try {
    const newIntern = await prisma.intern.create({
      data: {
        User: {
          connect: {
            id: parseInt(userId),
          },
        },
      },
    });
    res.status(201).json(newIntern);
  } catch (error) {
    res.status(500).json({ error: "Error creating intern" });
  }
});

// Delete an intern by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.intern.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Intern deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting intern" });
  }
});

module.exports = router;