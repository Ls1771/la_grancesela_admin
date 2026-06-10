const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./db");
const verifyAdmin = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

function isAllowed(value, allowedValues) {
  return allowedValues.includes(value);
}

async function logStatusChange(recordType, recordId, oldStatus, newStatus, adminId, note) {
  await db.query(
    `INSERT INTO status_change_log
     (record_type, record_id, old_status, new_status, changed_by_admin_id, change_note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [recordType, recordId, oldStatus || null, newStatus, adminId || null, note || "Updated from admin UI"]
  );
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "online", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "offline", error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [admins] = await db.query(
      `SELECT admin_id, full_name, email, password_hash, role
       FROM admins
       WHERE email = ? AND is_active = TRUE`,
      [email]
    );

    if (!admins.length) return res.status(401).json({ message: "Invalid login" });

    const admin = admins[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid login" });

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        admin_id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
});

app.get("/api/dashboard/summary", verifyAdmin, async (req, res) => {
  try {
    const [[bookings]] = await db.query(
      `SELECT COUNT(*) AS total_bookings,
              SUM(booking_status = 'Pending') AS pending_bookings,
              SUM(booking_status = 'Booked') AS booked_bookings,
              SUM(booking_status = 'Cancelled') AS cancelled_bookings
       FROM booking_requests`
    );
    const [[events]] = await db.query(
      `SELECT COUNT(*) AS total_events,
              SUM(inquiry_status = 'Pending') AS pending_events,
              SUM(inquiry_status = 'Booked') AS booked_events
       FROM event_inquiries`
    );
    const [[tickets]] = await db.query(
      `SELECT COUNT(*) AS total_tickets,
              SUM(ticket_status IN ('Open', 'In Progress')) AS open_tickets,
              SUM(ticket_status = 'Resolved') AS resolved_tickets,
              SUM(ticket_status = 'Closed') AS closed_tickets
       FROM ticket_requests`
    );
    const [[rooms]] = await db.query(
      `SELECT COUNT(*) AS total_rooms,
              SUM(room_status = 'Available') AS available_rooms,
              SUM(room_status = 'Booked') AS booked_rooms
       FROM rooms`
    );

    res.json({ ...bookings, ...events, ...tickets, ...rooms });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
});

app.get("/api/business-profile", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM business_profile ORDER BY profile_id DESC LIMIT 1");
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Business profile query error", error: error.message });
  }
});

app.patch("/api/business-profile/:id", verifyAdmin, async (req, res) => {
  try {
    const { business_name, address, phone, email } = req.body;
    await db.query(
      `UPDATE business_profile
       SET business_name = ?, address = ?, phone = ?, email = ?
       WHERE profile_id = ?`,
      [business_name, address, phone, email, req.params.id]
    );
    res.json({ message: "Business profile updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Business profile update error", error: error.message });
  }
});

app.get("/api/rooms", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM rooms ORDER BY room_name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Rooms query error", error: error.message });
  }
});

app.post("/api/rooms", verifyAdmin, async (req, res) => {
  try {
    const { room_name, room_type, max_guests, nightly_rate, room_status, notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!room_name || !max_guests) return res.status(400).json({ message: "Room name and max guests are required." });
    if (Number(max_guests) <= 0) return res.status(400).json({ message: "Max guests must be greater than zero." });
    if (room_status && !isAllowed(room_status, allowedStatuses)) return res.status(400).json({ message: "Invalid room status." });

    await db.query(
      `INSERT INTO rooms (room_name, room_type, max_guests, nightly_rate, room_status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [room_name, room_type || null, max_guests, nightly_rate || null, room_status || "Available", notes || null]
    );

    res.status(201).json({ message: "Room created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Room creation error", error: error.message });
  }
});

app.patch("/api/rooms/:id", verifyAdmin, async (req, res) => {
  try {
    const { room_name, room_type, max_guests, nightly_rate, room_status, notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!room_name || !max_guests) return res.status(400).json({ message: "Room name and max guests are required." });
    if (Number(max_guests) <= 0) return res.status(400).json({ message: "Max guests must be greater than zero." });
    if (!isAllowed(room_status, allowedStatuses)) return res.status(400).json({ message: "Invalid room status." });

    await db.query(
      `UPDATE rooms
       SET room_name = ?, room_type = ?, max_guests = ?, nightly_rate = ?, room_status = ?, notes = ?
       WHERE room_id = ?`,
      [room_name, room_type || null, max_guests, nightly_rate || null, room_status, notes || null, req.params.id]
    );

    res.json({ message: "Room updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Room update error", error: error.message });
  }
});

app.delete("/api/rooms/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM rooms WHERE room_id = ?", [req.params.id]);
    res.json({ message: "Room deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Room delete error", error: error.message });
  }
});

app.get("/api/bookings", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, r.room_name, r.room_type
       FROM booking_requests b
       LEFT JOIN rooms r ON b.room_id = r.room_id
       ORDER BY b.submitted_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Bookings query error", error: error.message });
  }
});

app.patch("/api/bookings/:id", verifyAdmin, async (req, res) => {
  try {
    const { room_id, guest_name, guest_email, guest_phone, arrival_date, departure_date, number_of_guests, booking_status, special_notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!guest_name || !guest_email || !arrival_date || !departure_date || !number_of_guests) return res.status(400).json({ message: "Guest name, email, dates, and guest count are required." });
    if (new Date(departure_date) <= new Date(arrival_date)) return res.status(400).json({ message: "Departure date must be after arrival date." });
    if (Number(number_of_guests) <= 0) return res.status(400).json({ message: "Number of guests must be greater than zero." });
    if (!isAllowed(booking_status, allowedStatuses)) return res.status(400).json({ message: "Invalid booking status." });

    const [[oldRow]] = await db.query("SELECT booking_status FROM booking_requests WHERE booking_id = ?", [req.params.id]);

    await db.query(
      `UPDATE booking_requests
       SET room_id = ?, guest_name = ?, guest_email = ?, guest_phone = ?, arrival_date = ?, departure_date = ?, number_of_guests = ?, booking_status = ?, special_notes = ?, assigned_admin_id = ?
       WHERE booking_id = ?`,
      [room_id || null, guest_name, guest_email, guest_phone || null, arrival_date, departure_date, number_of_guests, booking_status, special_notes || null, req.admin.admin_id, req.params.id]
    );

    if (oldRow && oldRow.booking_status !== booking_status) {
      await logStatusChange("Booking", req.params.id, oldRow.booking_status, booking_status, req.admin.admin_id, "Booking edited from admin UI");
    }

    res.json({ message: "Booking updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Booking update error", error: error.message });
  }
});

app.get("/api/event-inquiries", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM event_inquiries ORDER BY submitted_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Event query error", error: error.message });
  }
});

app.patch("/api/event-inquiries/:id", verifyAdmin, async (req, res) => {
  try {
    const { event_type, requested_event_date, venue_preference, estimated_guest_count, contact_name, contact_email, contact_phone, inquiry_message, inquiry_status } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!event_type || !requested_event_date || !estimated_guest_count || !contact_name || !contact_email) return res.status(400).json({ message: "Event type, date, guest count, contact name, and email are required." });
    if (Number(estimated_guest_count) <= 0) return res.status(400).json({ message: "Guest count must be greater than zero." });
    if (!isAllowed(inquiry_status, allowedStatuses)) return res.status(400).json({ message: "Invalid event inquiry status." });

    const [[oldRow]] = await db.query("SELECT inquiry_status FROM event_inquiries WHERE event_id = ?", [req.params.id]);

    await db.query(
      `UPDATE event_inquiries
       SET event_type = ?, requested_event_date = ?, venue_preference = ?, estimated_guest_count = ?, contact_name = ?, contact_email = ?, contact_phone = ?, inquiry_message = ?, inquiry_status = ?, assigned_admin_id = ?
       WHERE event_id = ?`,
      [event_type, requested_event_date, venue_preference || null, estimated_guest_count, contact_name, contact_email, contact_phone || null, inquiry_message || null, inquiry_status, req.admin.admin_id, req.params.id]
    );

    if (oldRow && oldRow.inquiry_status !== inquiry_status) {
      await logStatusChange("EventInquiry", req.params.id, oldRow.inquiry_status, inquiry_status, req.admin.admin_id, "Event inquiry edited from admin UI");
    }

    res.json({ message: "Event inquiry updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Event inquiry update error", error: error.message });
  }
});

app.get("/api/tickets", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ticket_requests ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Ticket query error", error: error.message });
  }
});

app.patch("/api/tickets/:id", verifyAdmin, async (req, res) => {
  try {
    const { requester_name, requester_email, requester_phone, related_booking_id, related_event_id, ticket_title, ticket_description, ticket_priority, ticket_status } = req.body;
    const allowedPriorities = ["Low", "Medium", "High", "Urgent"];
    const allowedStatuses = ["Open", "In Progress", "Resolved", "Closed"];

    if (!ticket_title || !ticket_description) return res.status(400).json({ message: "Ticket title and description are required." });
    if (!isAllowed(ticket_priority, allowedPriorities)) return res.status(400).json({ message: "Invalid ticket priority." });
    if (!isAllowed(ticket_status, allowedStatuses)) return res.status(400).json({ message: "Invalid ticket status." });

    const [[oldRow]] = await db.query("SELECT ticket_status FROM ticket_requests WHERE ticket_id = ?", [req.params.id]);

    await db.query(
      `UPDATE ticket_requests
       SET requester_name = ?, requester_email = ?, requester_phone = ?, related_booking_id = ?, related_event_id = ?, ticket_title = ?, ticket_description = ?, ticket_priority = ?, ticket_status = ?, assigned_admin_id = ?
       WHERE ticket_id = ?`,
      [requester_name || null, requester_email || null, requester_phone || null, related_booking_id || null, related_event_id || null, ticket_title, ticket_description, ticket_priority, ticket_status, req.admin.admin_id, req.params.id]
    );

    if (oldRow && oldRow.ticket_status !== ticket_status) {
      await logStatusChange("Ticket", req.params.id, oldRow.ticket_status, ticket_status, req.admin.admin_id, "Ticket edited from admin UI");
    }

    res.json({ message: "Ticket updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Ticket update error", error: error.message });
  }
});

app.post("/api/public/tickets", async (req, res) => {
  try {
    const { requester_name, requester_email, requester_phone, related_booking_id, related_event_id, ticket_title, ticket_description, ticket_priority } = req.body;

    if (!requester_name || !requester_email || !ticket_title || !ticket_description) return res.status(400).json({ message: "Name, email, ticket title, and description are required." });

    await db.query(
      `INSERT INTO ticket_requests
       (requester_name, requester_email, requester_phone, related_booking_id, related_event_id, ticket_title, ticket_description, ticket_priority, ticket_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [requester_name, requester_email, requester_phone || null, related_booking_id || null, related_event_id || null, ticket_title, ticket_description, ticket_priority || "Medium", "Open"]
    );

    res.status(201).json({ message: "Ticket submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error while submitting ticket.", error: error.message });
  }
});

app.get("/api/calendar-availability", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ca.*, r.room_name
       FROM calendar_availability ca
       LEFT JOIN rooms r ON ca.room_id = r.room_id
       ORDER BY ca.calendar_date ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Availability query error", error: error.message });
  }
});

app.post("/api/calendar-availability", verifyAdmin, async (req, res) => {
  try {
    const { room_id, calendar_date, availability_status, availability_notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!calendar_date || !availability_status) return res.status(400).json({ message: "Calendar date and status are required." });
    if (!isAllowed(availability_status, allowedStatuses)) return res.status(400).json({ message: "Invalid availability status." });

    await db.query(
      `INSERT INTO calendar_availability (room_id, calendar_date, availability_status, availability_notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         availability_status = VALUES(availability_status),
         availability_notes = VALUES(availability_notes),
         updated_at = CURRENT_TIMESTAMP`,
      [room_id || null, calendar_date, availability_status, availability_notes || null]
    );

    res.status(201).json({ message: "Calendar availability created or updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Availability creation error", error: error.message });
  }
});

app.post("/api/calendar-availability/range", verifyAdmin, async (req, res) => {
  try {
    const { room_id, start_date, end_date, availability_status, availability_notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!start_date || !end_date || !availability_status) return res.status(400).json({ message: "Start date, end date, and availability status are required." });
    if (!isAllowed(availability_status, allowedStatuses)) return res.status(400).json({ message: "Invalid availability status." });

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) return res.status(400).json({ message: "End date must be the same as or after start date." });

    const updatedDates = [];
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split("T")[0];

      await db.query(
        `INSERT INTO calendar_availability (room_id, calendar_date, availability_status, availability_notes)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           availability_status = VALUES(availability_status),
           availability_notes = VALUES(availability_notes),
           updated_at = CURRENT_TIMESTAMP`,
        [room_id || null, dateKey, availability_status, availability_notes || null]
      );

      updatedDates.push(dateKey);
      current.setDate(current.getDate() + 1);
    }

    await logStatusChange(
      "CalendarAvailability",
      0,
      null,
      availability_status,
      req.admin.admin_id,
      `Date range availability updated from ${start_date} to ${end_date}`
    );

    res.status(201).json({ message: "Date range availability updated successfully.", total_days: updatedDates.length, dates: updatedDates });
  } catch (error) {
    res.status(500).json({ message: "Date range availability error", error: error.message });
  }
});

app.patch("/api/calendar-availability/:id", verifyAdmin, async (req, res) => {
  try {
    const { room_id, calendar_date, availability_status, availability_notes } = req.body;
    const allowedStatuses = ["Available", "Booked", "Pending", "Cancelled"];

    if (!calendar_date || !availability_status) return res.status(400).json({ message: "Calendar date and status are required." });
    if (!isAllowed(availability_status, allowedStatuses)) return res.status(400).json({ message: "Invalid availability status." });

    const [[oldRow]] = await db.query("SELECT availability_status FROM calendar_availability WHERE availability_id = ?", [req.params.id]);

    await db.query(
      `UPDATE calendar_availability
       SET room_id = ?, calendar_date = ?, availability_status = ?, availability_notes = ?
       WHERE availability_id = ?`,
      [room_id || null, calendar_date, availability_status, availability_notes || null, req.params.id]
    );

    if (oldRow && oldRow.availability_status !== availability_status) {
      await logStatusChange("CalendarAvailability", req.params.id, oldRow.availability_status, availability_status, req.admin.admin_id, "Calendar availability edited from admin UI");
    }

    res.json({ message: "Calendar availability updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Availability update error", error: error.message });
  }
});

app.delete("/api/calendar-availability/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM calendar_availability WHERE availability_id = ?", [req.params.id]);
    res.json({ message: "Calendar availability deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Availability delete error", error: error.message });
  }
});

app.get("/api/admin-notes/:recordType/:recordId", verifyAdmin, async (req, res) => {
  try {
    const { recordType, recordId } = req.params;
    let condition = "";

    if (recordType === "booking") condition = "booking_id = ?";
    else if (recordType === "event") condition = "event_id = ?";
    else if (recordType === "ticket") condition = "ticket_id = ?";
    else return res.status(400).json({ message: "Invalid note record type." });

    const [rows] = await db.query(
      `SELECT n.*, a.full_name AS admin_name
       FROM admin_notes n
       LEFT JOIN admins a ON n.admin_id = a.admin_id
       WHERE ${condition}
       ORDER BY n.created_at DESC`,
      [recordId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Admin notes query error", error: error.message });
  }
});

app.post("/api/admin-notes", verifyAdmin, async (req, res) => {
  try {
    const { booking_id, event_id, ticket_id, note_text } = req.body;
    if (!note_text) return res.status(400).json({ message: "Note text is required." });

    await db.query(
      `INSERT INTO admin_notes (booking_id, event_id, ticket_id, admin_id, note_text)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id || null, event_id || null, ticket_id || null, req.admin.admin_id, note_text]
    );

    res.status(201).json({ message: "Admin note added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Admin note creation error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`La Grancesela API running on http://localhost:${PORT}`);
});
