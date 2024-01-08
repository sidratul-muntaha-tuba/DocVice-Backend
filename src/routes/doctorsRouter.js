const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        User: {
          approved: true
        }
      },
			include: {
				User: true,
			},
		});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Error fetching doctors" });
  }
});

router.get("/available-today", async (req, res) => {
	try {
    const today = new Date();
		const todayDay = today.getDay(); 
		const todayDateString = today.toISOString().split('T')[0];

		const allDoctors = await prisma.doctor.findMany({
      include: {
        User: true,
				DoctorSchedule: true,
				Appointments: {
					where: {
						date: {
							gte: today,
							lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), 
						},
					},
				},
			},
    });

		const doctorsAvailable = allDoctors.filter((doctor) => {
      if (
				doctor &&
				doctor.DoctorSchedule &&
				doctor.DoctorSchedule.activeHours
      ) {
				const isTodayOff =
          doctor.DoctorSchedule.offDays.includes(todayDateString);

				const activeHoursToday = doctor.DoctorSchedule.activeHours.find(
          (activeHour, i) => {
            if (activeHour) {
              return (i === todayDay && activeHour.length);
            }
          } 
        );

				if (!isTodayOff && activeHoursToday) {
					const startTime = new Date();
					startTime.setHours(0, 0, 0, 0); 

					const endTime = new Date();
					endTime.setHours(23, 59, 59, 999);

					const appointmentsToday = doctor.Appointments.filter(
            (appointment) => {
							return (
								appointment.date >= startTime &&
								appointment.date <= endTime &&
								appointment.date.getDay() === todayDay
							);
						}
          );

					return (
						appointmentsToday.length <
						(24 * 60) / doctor.DoctorSchedule.onePatientVisitingTime
					);
				}
			}

			return false;
    });

		res.json(doctorsAvailable);
	} catch (error) {
		console.error("Error fetching doctors available today:", error);
		res.status(500).json({ error: "Error fetching doctors available today" });
	}
});

router.get("/available-today-for/:patientId", async (req, res) => {
  try {
    
    const { patientId } = req.params;

		const today = new Date();
		const todayDay = today.getDay();
		const todayDateString = today.toISOString().split("T")[0];

		const allDoctors = await prisma.doctor.findMany({
			include: {
				User: true,
				DoctorSchedule: true,
				Appointments: {
					where: {
						date: {
							gte: today,
							lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
						},
					},
				},
			},
		});

		const doctorsAvailable = allDoctors.filter((doctor) => {
			if (
				doctor &&
				doctor.DoctorSchedule &&
				doctor.DoctorSchedule.activeHours
			) {
				const isTodayOff =
					doctor.DoctorSchedule.offDays.includes(todayDateString);

				const activeHoursToday = doctor.DoctorSchedule.activeHours.find(
					(activeHour, i) => {
						if (activeHour) {
							return i === todayDay && activeHour.length;
						}
					}
				);

				if (!isTodayOff && activeHoursToday) {
					const startTime = new Date();
					startTime.setHours(0, 0, 0, 0);

					const endTime = new Date();
					endTime.setHours(23, 59, 59, 999);

					const appointmentsToday = doctor.Appointments.filter(
						(appointment) => {
							return (
								appointment.date >= startTime &&
								appointment.date <= endTime &&
								appointment.date.getDay() === todayDay
							);
						}
					);

					return (
						appointmentsToday.length <
						(24 * 60) / doctor.DoctorSchedule.onePatientVisitingTime
					);
				}
			}

			return false;
    });
    
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
				patientId: parseInt(patientId),
			},
    });
    
    const doctorIdsWithAppointments = new Set(
			appointmentsOnDateForTheDoctor.map((appointment) => appointment.doctorId)
		);
		const filteredDoctors = doctorsAvailable.filter(
			(doctor) => !doctorIdsWithAppointments.has(doctor.id)
		);

		res.json(filteredDoctors);
	} catch (error) {
		console.error("Error fetching doctors available today:", error);
		res.status(500).json({ error: "Error fetching doctors available today" });
	}
});

// Get doctor by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctor.findUnique({
			where: {
				id: parseInt(id),
			},
			include: {
				User: true,
			},
		});
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Error fetching doctor" });
  }
});

// Create a doctor
router.post("/", async (req, res) => {
  const { specialization, contactNumber, userId } = req.body;
  try {
    const newDoctor = await prisma.doctor.create({
      data: {
        specialization,
        contactNumber,
        User: {
          connect: {
            id: parseInt(userId),
          },
        },
      },
    });
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: "Error creating doctor" });
  }
});

// Update a doctor by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { specialization, contactNumber } = req.body;
  try {
    const updatedDoctor = await prisma.doctor.update({
      where: {
        id: parseInt(id),
      },
      data: {
        specialization,
        contactNumber,
      },
    });
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: "Error updating doctor" });
  }
});

// Delete a doctor by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.doctor.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting doctor" });
  }
});

module.exports = router;