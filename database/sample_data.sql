USE la_grancesela_db;

INSERT INTO business_profile (business_name, address, phone, email)
VALUES ('La Grancesela', 'Via Grancelsa snc, Carinola, Italy, 81030', '+39 351 159 0852', 'agriturismolagrancelsa@gmail.com');

INSERT INTO rooms (room_name, room_type, max_guests, nightly_rate, room_status, notes) VALUES
('Oceanview Suite', 'Suite', 4, 249.99, 'Available', 'Premium room with scenic view.'),
('Garden Villa', 'Villa', 6, 329.99, 'Available', 'Private villa near garden area.'),
('Standard Double', 'Standard', 2, 149.99, 'Available', 'Standard double room.');

INSERT INTO booking_requests (room_id, guest_name, guest_email, guest_phone, arrival_date, departure_date, number_of_guests, booking_status, special_notes)
VALUES (1, 'Jane Smith', 'jane.smith@email.com', '555-222-1111', '2026-07-10', '2026-07-14', 2, 'Pending', 'Guest requested early check-in.');

INSERT INTO event_inquiries (event_type, requested_event_date, venue_preference, estimated_guest_count, contact_name, contact_email, contact_phone, inquiry_message, inquiry_status)
VALUES ('Wedding Reception', '2026-08-22', 'Outdoor Garden Area', 85, 'Daniel Carter', 'daniel.carter@email.com', '555-391-7742', 'Interested in booking the property for an evening wedding reception.', 'Pending');

INSERT INTO calendar_availability (room_id, calendar_date, availability_status, availability_notes) VALUES
(1, '2026-07-10', 'Pending', 'Held for Jane Smith booking request.'),
(1, '2026-07-11', 'Pending', 'Held for Jane Smith booking request.'),
(2, '2026-07-10', 'Available', 'Open for booking.'),
(3, '2026-07-10', 'Available', 'Open for booking.');

INSERT INTO ticket_requests (requester_name, requester_email, requester_phone, related_booking_id, ticket_title, ticket_description, ticket_priority, ticket_status)
VALUES ('Jane Smith', 'jane.smith@email.com', '555-222-1111', 1, 'Early check-in request', 'Guest requested early check-in for upcoming stay.', 'Medium', 'Open');
