DROP DATABASE IF EXISTS la_grancesela_db;
CREATE DATABASE la_grancesela_db;
USE la_grancesela_db;

CREATE TABLE admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Owner', 'Admin', 'Staff') NOT NULL DEFAULT 'Staff',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE business_profile (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL,
  room_type VARCHAR(100),
  max_guests INT NOT NULL,
  nightly_rate DECIMAL(10,2),
  room_status ENUM('Available', 'Booked', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (max_guests > 0)
);

CREATE TABLE booking_requests (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NULL,
  guest_name VARCHAR(120) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(30),
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  booking_status ENUM('Available', 'Booked', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
  special_notes TEXT,
  assigned_admin_id INT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL,
  CONSTRAINT fk_booking_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL,
  CHECK (departure_date > arrival_date),
  CHECK (number_of_guests > 0)
);

CREATE TABLE event_inquiries (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  requested_event_date DATE NOT NULL,
  venue_preference VARCHAR(150),
  estimated_guest_count INT NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(30),
  inquiry_message TEXT,
  inquiry_status ENUM('Available', 'Booked', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
  assigned_admin_id INT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL,
  CHECK (estimated_guest_count > 0)
);

CREATE TABLE calendar_availability (
  availability_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NULL,
  calendar_date DATE NOT NULL,
  availability_status ENUM('Available', 'Booked', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Available',
  availability_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_availability_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_date (room_id, calendar_date)
);

CREATE TABLE ticket_requests (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  requester_name VARCHAR(120) NULL,
  requester_email VARCHAR(150) NULL,
  requester_phone VARCHAR(30) NULL,
  related_booking_id INT NULL,
  related_event_id INT NULL,
  ticket_title VARCHAR(150) NOT NULL,
  ticket_description TEXT NOT NULL,
  ticket_priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  ticket_status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  created_by_admin_id INT NULL,
  assigned_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_booking FOREIGN KEY (related_booking_id) REFERENCES booking_requests(booking_id) ON DELETE SET NULL,
  CONSTRAINT fk_ticket_event FOREIGN KEY (related_event_id) REFERENCES event_inquiries(event_id) ON DELETE SET NULL,
  CONSTRAINT fk_ticket_created_by FOREIGN KEY (created_by_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL,
  CONSTRAINT fk_ticket_assigned_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);

CREATE TABLE admin_notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NULL,
  event_id INT NULL,
  ticket_id INT NULL,
  admin_id INT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_note_booking FOREIGN KEY (booking_id) REFERENCES booking_requests(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_note_event FOREIGN KEY (event_id) REFERENCES event_inquiries(event_id) ON DELETE CASCADE,
  CONSTRAINT fk_note_ticket FOREIGN KEY (ticket_id) REFERENCES ticket_requests(ticket_id) ON DELETE CASCADE,
  CONSTRAINT fk_note_admin FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);

CREATE TABLE status_change_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  record_type ENUM('Booking', 'EventInquiry', 'CalendarAvailability', 'Ticket') NOT NULL,
  record_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_admin_id INT NULL,
  change_note TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_changed_by FOREIGN KEY (changed_by_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);
