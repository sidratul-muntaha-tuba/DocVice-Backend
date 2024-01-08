const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all queries
router.get("/", async (req, res) => {
	try {
		const queries = await prisma.query.findMany();
		res.json(queries);
	} catch (error) {
		res.status(500).json({ error: "Error fetching queries" });
	}
});

// Get queries of a specific patient
router.get("/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const patientQueries = await prisma.query.findMany({
      where: {
        patientId: parseInt(patientId),
      },
    });
    res.json(patientQueries);
  } catch (error) {
    res.status(500).json({ error: "Error fetching patient's queries" });
  }
});

// Get query by ID
router.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const query = await prisma.query.findUnique({
			where: {
				id: parseInt(id),
			},
		});
		res.json(query);
	} catch (error) {
		res.status(500).json({ error: "Error fetching query" });
	}
});

// Create a query
router.post("/", async (req, res) => {
  const { patientId, queryText } = req.body;
	try {
		const newQuery = await prisma.query.create({
			data: {
				patientId,
        queryText,
			},
    });
		res.status(201).json(newQuery);
  } catch (error) {
		res.status(500).json(error);
	}
});

// Update a query by ID
router.put("/:id", async (req, res) => {
	const { id } = req.params;
	const { patientId, queryText } = req.body;
	try {
		const updatedQuery = await prisma.query.update({
			where: {
				id: parseInt(id),
			},
			data: {
				patientId,
				queryText,
			},
		});
		res.json(updatedQuery);
	} catch (error) {
		res.status(500).json({ error: "Error updating query" });
	}
});

// Delete a query by ID
router.delete("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await prisma.query.delete({
			where: {
				id: parseInt(id),
			},
		});
		res.status(200).json({ message: "Query deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Error deleting query" });
	}
});

module.exports = router;
