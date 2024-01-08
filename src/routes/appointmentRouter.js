const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
	try {
		const { patientIdPassed, doctorIdPassed, date, status } = req.body;

		const patientId = parseInt(patientIdPassed);
		const doctorId = parseInt(doctorIdPassed);

		if (!patientId || !doctorId || !status) {
			return res.status(400).json({ error: "Bad Request..." });
		}

		const todaysDay = new Date().getDay();

		const doctor = await prisma.doctor.findUnique({
			where: {
				id: doctorId,
			},
			include: {
				DoctorSchedule: true,
			},
		});

		if (!doctor) {
			return res.status(404).json({ error: "Doctor not found..." });
		}

		let appointmentDuration = doctor.DoctorSchedule?.onePatientVisitingTime;

		let isSlotAvailable = false;
		let totalTimeAllocatedInMins = 0;

		for (const slot of doctor?.DoctorSchedule?.activeHours[todaysDay]) {
			const time1 = slot.startTime;
			const time2 = slot.endTime;

			const [hours1, minutes1] = time1.split(":").map(Number);
			const [hours2, minutes2] = time2.split(":").map(Number);

			const date1 = new Date();
			date1.setHours(hours1, minutes1, 0, 0);

			const date2 = new Date();
			date2.setHours(hours2, minutes2, 0, 0);

			const timeDiffInMs = Math.abs(date2.getTime() - date1.getTime());
			const minutesDiff = Math.floor(timeDiffInMs / (1000 * 60));

			totalTimeAllocatedInMins += minutesDiff;
		}

		const todaysDate = new Date();
		const appointmentsOnDateForTheDoctor = await prisma.appointment.findMany({
			where: {
				date: {
					gte: new Date(
						todaysDate.getFullYear(),
						todaysDate.getMonth(),
						todaysDate.getDate()
					),
					lt: new Date(
						todaysDate.getFullYear(),
						todaysDate.getMonth(),
						todaysDate.getDate() + 1
					),
				},
				doctorId: doctorId,
			},
		});

		let isThePatientAlreadyAttendingTodayForThatDoctor = false;

		const countAppointmentsOnDateForTheDoctor =
			appointmentsOnDateForTheDoctor.length;

		let lastPatientAppointmentTime = new Date();
		lastPatientAppointmentTime.setDate(
			lastPatientAppointmentTime.getDate() - 10
		);

		let hasLastAppointmentBeenSet = false;

		if (!appointmentDuration) {
			appointmentDuration = 5;
		}

		for (let i = 0; i < countAppointmentsOnDateForTheDoctor; i++) {
			if (appointmentsOnDateForTheDoctor[i].patientId === patientId) {
				isThePatientAlreadyAttendingTodayForThatDoctor = true;
			}
			const currentIteratingTime = new Date(
				appointmentsOnDateForTheDoctor[i].date
			);
			if (currentIteratingTime >= lastPatientAppointmentTime) {
				lastPatientAppointmentTime = currentIteratingTime;
				hasLastAppointmentBeenSet = true;
			}
		}

		if (hasLastAppointmentBeenSet) {
			lastPatientAppointmentTime = new Date(
				lastPatientAppointmentTime.getTime() + appointmentDuration * 60000
			);
		}

		if (isThePatientAlreadyAttendingTodayForThatDoctor) {
			return res.status(400).json({
				error:
					"You are already having one appointment. On patient one appointment please...",
			});
		}

		totalTimeAllocatedInMins -=
			countAppointmentsOnDateForTheDoctor * appointmentDuration;

		isSlotAvailable =
			totalTimeAllocatedInMins >= appointmentDuration ? true : false;

		if (!isSlotAvailable) {
			return res
				.status(400)
				.json({ error: "Doctor's slot not available for this duration..." });
		}

		let isAnotherPatientTimeSuitableForToday = false;

		let appointmentEndingTime = null;

		for (const slot of doctor?.DoctorSchedule?.activeHours[todaysDay]) {
			const today = new Date();

			const [startingHours, startingMinutes] = slot.startTime
				.split(":")
				.map(Number);
			const startingTime = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				startingHours,
				startingMinutes
			);

			const [endingHours, endingMinutes] = slot.endTime.split(":").map(Number);
			const endingTime = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				endingHours,
				endingMinutes
			);

			if (!(startingTime && endingTime)) {
				break;
			}

			if (!hasLastAppointmentBeenSet) {
				lastPatientAppointmentTime = startingTime;
			} else {
				if (lastPatientAppointmentTime >= endingTime) {
					continue;
				}
			}

			appointmentEndingTime = new Date(
				lastPatientAppointmentTime.getTime() + appointmentDuration * 60000
			);
			if (
				appointmentEndingTime <= endingTime
			) {
				isAnotherPatientTimeSuitableForToday = true;
				break;
			}

			hasLastAppointmentBeenSet = false;
		}

		if (!isAnotherPatientTimeSuitableForToday) {
			return res.status(400).json({
				error:
					"All slots been booked for today. But we cannot manage you an appointment. You can try again on the next visiting day...",
			});
		}

		const newAppointment = await prisma.appointment.create({
			data: {
				patientId,
				doctorId,
				date: lastPatientAppointmentTime,
				status,
				userId: patientId,
			},
		});

		res.json(newAppointment);
	} catch (error) {
		res.status(500).json({ error: "Error creating Appointment..." });
	}
});

router.get("/", async (req, res) => {
	try {
		const appointments = await prisma.appointment.findMany();
		res.json(appointments);
	} catch (error) {
		res.status(500).json({ error: "Error fetching Appointments" });
	}
});

router.get("/patient/:patientId", async (req, res) => {
	try {
		const patientId = parseInt(req.params.patientId);
		const appointments = await prisma.appointment.findMany({
			where: {
				patientId: patientId,
			},
			orderBy: {
				date: "desc",
			},
			include: {
				Doctor: {
					include: {
						User: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});
		res.json(appointments);
	} catch (error) {
		res.status(500).json({ error: "Error fetching Appointment" });
	}
});

router.get("/today/:patientId", async (req, res) => {
	try {
		const patientId = parseInt(req.params.patientId);
		const today = new Date().toISOString().split("T")[0];
		const appointmentsToday = await prisma.appointment.findMany({
			where: {
				patientId: patientId,
				date: {
					gte: new Date(today),
					lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
				},
			},
			orderBy: {
				date: "desc",
			},
			include: {
				Doctor: {
					include: {
						User: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});
		res.json(appointmentsToday);
	} catch (error) {
		res.status(500).json({ error: "Error fetching Appointments for the day" });
	}
});

router.get("/:appointmentId", async (req, res) => {
	try {
		const appointmentId = parseInt(req.params.appointmentId);

		const appointment = await prisma.appointment.findFirst({
			where: {
				id: appointmentId,
			},
			include: {
				Doctor: {
					include: {
						User: {
							select: {
								name: true,
								email: true,
							},
						},
					}
				},
				Patient: {
					include: {
						User: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		res.json(appointment);
	} catch (error) {
		res.status(500).json({ error: "Error updating Appointment" });
	}
});

router.put("/:appointmentId", async (req, res) => {
	try {
		const appointmentId = parseInt(req.params.appointmentId);
		const { patientId, doctorId, date, status, userId } = req.body;

		const updatedAppointment = await prisma.appointment.update({
			where: {
				id: appointmentId,
			},
			data: {
				patientId,
				doctorId,
				date,
				status,
				userId,
			},
		});

		res.json(updatedAppointment);
	} catch (error) {
		res.status(500).json({ error: "Error updating Appointment" });
	}
});

router.delete("/:appointmentId", async (req, res) => {
	try {
		const appointmentId = parseInt(req.params.appointmentId);

		await prisma.appointment.delete({
			where: {
				id: appointmentId,
			},
		});

		res.json({ message: "Appointment deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Error deleting Appointment" });
	}
});

module.exports = router;
