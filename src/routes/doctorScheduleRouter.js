const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
	try {
		const { doctorId, offDays, activeHours, onePatientVisitingTime } = req.body;
		const newSchedule = await prisma.doctorSchedule.create({
			data: {
				offDays,
				activeHours,
				onePatientVisitingTime,
				doctor: {
					connect: {
						id: doctorId,
					},
				},
			},
		});

		res.json(newSchedule);
	} catch (error) {
		res.status(500).json({ error: "Error creating DoctorSchedule" });
	}
});

router.get("/:doctorId", async (req, res) => {
	try {
		const doctorId = parseInt(req.params.doctorId);

		const schedule = await prisma.doctorSchedule.findFirst({
			where: {
				doctor: {
					id: doctorId,
				},
			},
			include: {
				doctor: true
			}
		});

		res.json(schedule);
	} catch (error) {
		res.status(500).json({ error: "Error fetching DoctorSchedule" });
	}
});

router.put("/", async (req, res) => {
	try {
		const { offDays, activeHours, doctorId, onePatientVisitingTime } = req.body;
		
		// to manually remove any date from offDay
		// const filteredOffDays = offDays.filter((day) => day !== "2023-12-31");

		// const newActiveHours = [...activeHours];
		// newActiveHours[6] = [
		// 	{ startTime: "01:10", endTime: "03:10" },
		// 	{ startTime: "06:10", endTime: "07:00" },
		// ];
		
		if (doctorId) {
			const schedule = await prisma.doctorSchedule.findFirst({
				where: {
					doctor: {
						id: doctorId,
					},
				},
			});
			if (schedule) {
				const updatedSchedule = await prisma.doctorSchedule.update({
					where: {
						id: schedule?.id,
					},
					data: {
						offDays,
						// activeHours: newActiveHours,
						activeHours,
						onePatientVisitingTime,
					},
				});
				res.json(updatedSchedule);	
			}

		}
	} catch (error) {
		res.status(500).json({ error: "Error updating DoctorSchedule" });
	}
});

router.delete("/:doctorId", async (req, res) => {
	try {
		const doctorId = parseInt(req.params.doctorId);

		await prisma.doctorSchedule.deleteMany({
			where: {
				doctor: {
					id: doctorId,
				},
			},
		});

		res.json({ message: "DoctorSchedule deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Error deleting DoctorSchedule" });
	}
});

module.exports = router;
