const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all patients
router.get("/patients", async (req, res) => {
  try {
    const patients = await prisma.patient.findMany();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Error fetching patients" });
  }
});

// Get patient by ID
router.get("/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Error fetching patient" });
  }
});

// Create a patient
router.post("/patients", async (req, res) => {
  const { healthRecord, userId } = req.body;
  try {
    const newPatient = await prisma.patient.create({
      data: {
        healthRecord,
        User: {
          connect: {
            id: parseInt(userId),
          },
        },
      },
    });
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: "Error creating patient" });
  }
});

// Update a patient by ID
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { healthRecord } = req.body;
	try {
		const updatedPatient = await prisma.patient.update({
			where: {
				id: parseInt(id),
			},
			data: {
				healthRecord,
			},
		});
		res.json(updatedPatient);
	} catch (error) {
		res.status(500).json({ error: "Error updating patient" });
	}
});

// Delete a patient by ID
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await prisma.patient.delete({
			where: {
				id: parseInt(id),
			},
		});
		res.status(200).json({ message: "Patient deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Error deleting patient" });
	}
});

module.exports = router;
