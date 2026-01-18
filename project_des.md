# DentyHub - Dental Clinic Management Platform

DentyHub is our graduation project: a full-stack platform for managing dental clinic workflows for patients, doctors, and supervisors. We built it to replace manual scheduling, approval, and communication with a clean, role-based system that feels like a real product. This README is written to be human and report-ready so you can reuse it in the university report.

## What the project does (short version)
It lets patients find and reserve doctor appointments, doctors publish availability and manage appointment requests, and supervisors approve accounts and monitor activity. The system also includes notifications, profile management (including avatar), and a structured performance/reporting flow.

## Key features (complete list)

### Authentication and roles
- Role-based accounts: Patient, Doctor, Supervisor, Admin.
- Registration and login with username and phone; email is optional for patients.
- Doctor registration requires a college ID number.
- Doctor and supervisor accounts require approval; patients can use the platform immediately.
- Password hashing with bcrypt and server-side validation.

### Supervisor features
- Review and approve/reject doctor and supervisor requests.
- Re-approve rejected requests and block/unblock users.
- Delete user accounts with cleanup of related data.
- View and manage doctor lists and approvals.

### Doctor features
- Availability planner with day, month, and year selection.
- Fixed one-hour slots between working hours.
- Multi-case selection per slot (cleaning, check-up, general, etc.).
- Batch creation of slots and removal of slots (single or whole day).
- Appointment request approval/rejection workflow.
- Rejection includes a note that the patient can read.
- Appointment status tracking (pending, approved, rejected, cancelled).
- "No show" handling and report submission flow for completed visits.
- Performance counters for weekly completed, rejected, cancelled, and no-show events.

### Patient features
- Appointment reservation view with a calendar-based flow.
- Slot listing shows doctor name, avatar, day/time, and cases.
- Reservation requests are sent to the doctor for approval.
- Cancel reservation with confirmation; slot becomes available again.
- Upcoming appointments list with status badges.
- Ticket-style details panel for booked appointments.

### Notifications
- Notifications for major actions: approvals, rejections, cancellations, profile changes, and appointment events.
- Unread indicators and "mark all read" and delete actions.
- Notification records are stored in the database and persisted across sessions.

### Chat system (direct and global)
- Direct chat between any users (doctor/patient/supervisor).
- Search by name, phone, or doctor ID.
- Unread counts per conversation.
- Global chat room for all users.
- Optional image attachments in chat messages.

### Profile management
- Editable profile fields: name, phone, password.
- Optional email for patients (can be added later).
- Avatar upload and persistence.
- Role and status shown where appropriate.

### UI/UX
- Custom dashboard layouts per role.
- Sidebar navigation and contextual panels.
- Consistent theme using Tailwind CSS.
- Responsive layout for desktop and mobile.

## Tech stack
- Frontend: Next.js (App Router), React 19, Tailwind CSS
- Backend: NestJS, Prisma ORM
- Database: PostgreSQL
- Package manager: pnpm
- Auth: bcryptjs
- File uploads: multer

## Architecture (high level)
- **Frontend** (Next.js): role-based dashboards, interactive planners, chat, and notifications.
- **Backend** (NestJS): REST API with modules for auth, supervisor, appointments, notifications, and chat.
- **Database** (PostgreSQL + Prisma): persistent storage for users, slots, appointments, notifications, and messages.

## Database model overview (Prisma)
Key entities include:
- User (roles, profile, approval statuses, avatar, doctor ID)
- AvailabilitySlot (doctor slots)
- Appointment (booking records)
- AppointmentEvent (performance tracking)
- Notification
- Conversation, ConversationParticipant, Message (chat)

## Local setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm
- PostgreSQL

### Backend
```
cd backend
pnpm install
pnpm prisma migrate dev
pnpm run start:dev
```

### Frontend
```
cd frontend
pnpm install
pnpm run dev -- --port 3001
```

### Environment variables
Create files using these keys (do not commit secrets):

Backend: `backend/.env`
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
PORT=3000
SUPERVISOR_EMAIL="supervisor@example.com"
```

Frontend: `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts (summary)
- Backend: `pnpm run start:dev`, `pnpm run build`, `pnpm run test`
- Frontend: `pnpm run dev`, `pnpm run build`, `pnpm run start`

## Testing
- Backend uses Jest for unit tests and e2e tests.
- Manual UI testing for scheduling, approvals, and chat flows.

## Troubleshooting
- If Prisma types are missing, run `pnpm prisma generate` in `backend`.
- If the frontend fails on Turbopack, the dev script disables it via `NEXT_DISABLE_TURBOPACK=1`.
- Ensure backend is running on port 3000 and frontend points to it.

---

# Report Materials (copy-ready)
This section is written in a report-friendly style for direct reuse.

## Undertaking
The project undertook the full design and implementation of a dental clinic management platform that connects patients, doctors, and supervisors in a single system. The work covered requirement analysis, UX planning, database modeling, backend API development, frontend dashboards, and end-to-end flows for appointments, approvals, notifications, and communication.

## Abstract
This project presents DentyHub, a full-stack dental clinic management system designed to streamline appointment scheduling and professional oversight. The platform provides distinct interfaces for patients, doctors, and supervisors. Patients can discover and request appointments, doctors can publish and manage availability, and supervisors can approve accounts and monitor activity. The solution is built with Next.js, NestJS, PostgreSQL, and Prisma, and includes core features such as role-based authentication, calendar-based scheduling, notifications, and a built-in chat system. The outcome is a practical, scalable system that replaces manual processes with a structured, auditable workflow.

## Acknowledgment
We would like to thank our instructors and supervisors for their guidance, our peers for feedback during development, and the open-source community whose tools and libraries made this project possible.

## CHAPTER 1: Project Overview, Vision, and Planning

### 1.1 Problem Statement
Dental clinics commonly face scheduling conflicts, slow manual approvals, and fragmented communication between staff and patients. Existing workflows often rely on phone calls or spreadsheets, leading to delays, double booking, and lack of accountability. Our system addresses these gaps with a role-based, centralized platform.

### 1.2 Related Products
General-purpose scheduling tools (e.g., calendar apps) and appointment systems exist, but they lack role-specific approvals, integrated performance tracking, and domain-specific flows for doctor availability and patient requests. DentyHub focuses on the dental clinic context with supervision and structured appointment logic.

### 1.3 Product Vision
Our vision is to deliver a unified, clinic-ready platform that allows patients to find care easily, doctors to manage time efficiently, and supervisors to ensure quality and accountability. The system is designed to be scalable and extensible for future modules such as analytics, billing, and clinical records.

### 1.4 Project Objectives and Milestones
Key objectives:
- Build a multi-role system with secure authentication and approval workflows.
- Implement doctor availability and patient reservation flows.
- Add notifications and chat for real-time coordination.
- Provide reporting and performance tracking for supervisors.

Milestones achieved:
- Database schema and Prisma models
- Core authentication and approval flows
- Appointment scheduling and slot management
- Notification system with persistence
- Chat system (direct + global)
- UI dashboards for all roles

### 1.5 Risk Assessment and Mitigation
Risks included complex scheduling logic, account approval dependencies, and data consistency between frontend and backend. These were mitigated by:
- Centralized status tracking in the database.
- Prisma constraints and indexes to avoid duplicates.
- Validation and guard logic on backend endpoints.
- Incremental UI testing and modular development.

## CHAPTER 2: Product Features and Requirements

### 2.1 Functional Features
Functional features implemented include:
- Role-based authentication and account approval.
- Doctor availability planner with batch slot creation.
- Patient reservation requests with doctor approval workflow.
- Notifications for requests, approvals, cancellations, and profile changes.
- Profile editing with avatar upload and password updates.
- Chat between any users and a global chat room.
- Performance metrics and report submission for doctors.

### 2.2 Feature-to-Requirement Mapping
| Requirement | Implemented Feature |
| --- | --- |
| Secure access by role | Auth + role-based dashboards |
| Supervisor oversight | Approval, block/unblock, delete |
| Appointment scheduling | Availability slots + reservation flow |
| Patient feedback loop | Notifications + status updates |
| Communication | Direct chat + global chat |
| Performance tracking | AppointmentEvent tracking + counters |

## CHAPTER 3: System Design and Deployment Overview

### 3.1 System Architecture
The system uses a client-server architecture. The frontend is built with Next.js and communicates with a NestJS backend via REST APIs. PostgreSQL is used as the primary datastore, managed through Prisma ORM.

### 3.2 Detailed Design (UML Models Based on Implementation)
Core domain models include User, AvailabilitySlot, Appointment, Notification, and Chat entities. Relationships were designed to support approvals, role-specific access, and message participation.

### 3.3 Software Deployment
The project runs locally with pnpm-based scripts and can be deployed to any Node.js hosting platform. Environment variables are used for configuration, and Prisma migrations ensure schema consistency.

## CHAPTER 4: System Development and Implementation

### 4.1 Core Implementation Progress
The system was built incrementally, starting from authentication and database schema, then adding scheduling, approvals, notifications, and chat. Each module was tested separately before integration into the dashboards.

### 4.2 Implemented and Planned Features
Implemented:
- Authentication, role-based access
- Approval workflows
- Scheduling and reservation
- Notifications and persistence
- Chat system
- Performance counters and report flow

Planned:
- Advanced analytics dashboards
- Supervisor report review
- Clinical documentation export
- Multi-clinic support

### 4.3 Screenshots Evidence
Screenshots should include:
- Login/Register flow
- Doctor availability planner
- Patient reservation flow
- Supervisor approval panel
- Notifications and chat panels

## CHAPTER 5: Testing

### 5.1 Testing Overview
Testing included manual UI verification for all critical flows and automated backend tests using Jest.

### 5.2 Sample Test Cases
- Doctor creates slots -> Patient can see slots.
- Patient sends request -> Doctor receives notification.
- Doctor approves -> Patient sees approved status.
- Patient cancels -> Slot reopens.
- Supervisor approves doctor -> Doctor can access dashboard.

### 5.3 Test Reports
Test reports are generated via Jest for backend APIs. Manual test logs were recorded during UI validation sessions.

## References
- Next.js documentation
- NestJS documentation
- Prisma documentation
- PostgreSQL documentation

## Evaluation Criteria (mapped)
- **Functionality**: All core workflows implemented end-to-end.
- **Design**: Cohesive UI theme and role-based dashboards.
- **Data management**: Structured schema with Prisma and constraints.
- **Usability**: Simple reservation flow and clear status feedback.
- **Scalability**: Modular backend and extensible data model.
