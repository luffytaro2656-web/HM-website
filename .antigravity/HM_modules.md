**HOSPITAL MANAGEMENT SYSTEM**

_Roles, Modules & Feature Access Document_

Multi-Hospital Platform | 20 Hospitals | Version 1.0 | June 2026

**Section 1 - System Roles Overview**

The HMS platform defines 10 distinct roles. Each role has a specific scope (system-wide or hospital-scoped) and a clearly bounded set of responsibilities to ensure data security and operational clarity.

| **#** | **Role**              | **Scope**         | **Primary Responsibility**                         |
| ----- | --------------------- | ----------------- | -------------------------------------------------- |
| 1     | **Super Admin**       | All 20 Hospitals  | Full system control, cross-hospital oversight      |
| 2     | **Hospital Admin**    | Single Hospital   | Manages all operations within their hospital       |
| 3     | **Hospital Manager**  | Single Hospital   | View-only oversight - reports, staff, metrics      |
| 4     | **Doctor**            | Assigned Patients | Consultations, prescriptions, lab orders           |
| 5     | **Nurse**             | Assigned Ward     | Patient vitals, ward tasks, bed management         |
| 6     | **Receptionist**      | Single Hospital   | Patient registration, appointment booking          |
| 7     | **Billing Executive** | Single Hospital   | Invoices, payments, financial reports              |
| 8     | **Pharmacy Staff**    | Single Hospital   | Medicine dispensing, stock management              |
| 9     | **Lab Technician**    | Single Hospital   | Test processing, result upload & release           |
| 10    | **Patient**           | Own Records Only  | Self-service portal - appointments, records, bills |

**Section 2 - Platform Modules Overview**

The platform is organised into 15 functional modules. Each module is independently access-controlled per role.

| **#** | **Module**                 | **Description**                                                            |
| ----- | -------------------------- | -------------------------------------------------------------------------- |
| 1     | **Dashboard**              | Role-specific metrics, KPIs, and quick-action shortcuts                    |
| 2     | **Hospital Management**    | Hospital profiles, departments, bed management                             |
| 3     | **Staff Management**       | Staff profiles, department assignment, shift scheduling, payroll summary   |
| 4     | **Doctor Management**      | Doctor profiles, schedules, patient assignments, leave                     |
| 5     | **Patient Management**     | Registration, UHID, medical history, consultation logs, billing history    |
| 6     | **Appointment Management** | Online booking, walk-in registration, calendar, status tracking            |
| 7     | **Admission & Discharge**  | Admission workflow, bed assignment, discharge trigger to billing           |
| 8     | **Pharmacy Management**    | Medicine stock, purchase/restock, prescription dispensing, alerts, reports |
| 9     | **Inventory Management**   | General supplies stock, low-stock alerts, expiry tracking                  |
| 10    | **Lab Management**         | Test orders, sample tracking, result upload and release, reports           |
| 11    | **Billing**                | Invoice management, payments, insurance, receipts, reports                 |
| 12    | **Attendance**             | Clock-in/out, leave management, schedule compliance reports                |
| 13    | **Reports & Analytics**    | Cross-module consolidated reports for Admin and Super Admin                |
| 14    | **Notifications**          | System alerts - low stock, appointments, lab results, leave status         |
| 15    | **Settings & Audit**       | Role config, system settings, audit logs (Super Admin only)                |

**Section 3 - Role × Module Access Matrix**

Quick reference for which role has what level of access to each module.

| **Legend / Access Levels** | | | |
| --- | | | | --- | --- | --- |
| **✅ Full** | Create, Read, Update, Delete | **👁 View** | Read-only access |
| **🏥 Scoped** | Own hospital data only | **⚡ Trigger** | Initiates an action only |
| **📋 Limited** | Partial field access | **❌ None** | No access |

| **Module**          | **Super Admin** | **Hosp. Admin** | **Hosp. Mgr** | **Doctor** | **Nurse** | **Recep.** | **Billing Exec** | **Pharma Staff** | **Lab Tech** | **Patient** |
| ------------------- | --------------- | --------------- | ------------- | ---------- | --------- | ---------- | ---------------- | ---------------- | ------------ | ----------- |
| **Dashboard**       | ✅              | 🏥              | 🏥            | 📋         | 📋        | 📋         | 📋               | 📋               | 📋           | 📋          |
| **Hospital Mgmt**   | ✅              | 🏥              | 👁            | ❌         | ❌        | ❌         | ❌               | ❌               | ❌           | ❌          |
| **Staff Mgmt**      | ✅              | 🏥              | 👁            | ❌         | ❌        | ❌         | ❌               | ❌               | ❌           | ❌          |
| **Doctor Mgmt**     | ✅              | 🏥              | 👁            | 📋         | ❌        | ❌         | ❌               | ❌               | ❌           | ❌          |
| **Patient Mgmt**    | ✅              | ✅              | 👁            | 📋         | 👁        | 📋         | 📋               | 📋               | 📋           | 📋          |
| **Appointments**    | ✅              | ✅              | 👁            | 📋         | 👁        | ✅         | ❌               | ❌               | ❌           | 📋          |
| **Admission/Disc.** | ✅              | ✅              | 👁            | 👁         | 📋        | ⚡         | 👁               | ❌               | ❌           | ❌          |
| **Pharmacy**        | ✅              | ✅              | 👁            | ❌         | ❌        | ❌         | ❌               | ✅               | ❌           | ❌          |
| **Inventory**       | ✅              | ✅              | 👁            | ❌         | ❌        | ❌         | ❌               | ❌               | ❌           | ❌          |
| **Lab**             | ✅              | ✅              | 👁            | 📋         | 👁        | ❌         | ❌               | ❌               | ✅           | 👁          |
| **Billing**         | ✅              | ✅              | 👁            | ❌         | ❌        | ⚡         | ✅               | ⚡               | ❌           | 👁          |
| **Attendance**      | ✅              | ✅              | 👁            | 📋         | 📋        | 📋         | 📋               | 📋               | 📋           | ❌          |
| **Reports**         | ✅              | 🏥              | 🏥            | 📋         | ❌        | ❌         | 📋               | 📋               | 📋           | ❌          |
| **Notifications**   | ✅              | 🏥              | 🏥            | 🏥         | 🏥        | 🏥         | 🏥               | 🏥               | 🏥           | 🏥          |
| **Settings/Audit**  | ✅              | 📋              | ❌            | ❌         | ❌        | ❌         | ❌               | ❌               | ❌           | ❌          |

**Section 4 - Detailed Role Descriptions**

Each role's complete module access and feature permissions are described below.

**01\. Super Admin** - All 20 Hospitals

The highest-level user with unrestricted access across the entire platform. Responsible for system configuration, hospital onboarding, and cross-hospital oversight.

| **Module Access**       | **Features & Permissions**                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Dashboard**           | Cross-hospital KPI overview \| Live alerts across all hospitals \| Quick navigation to any hospital  |
| **Hospital Mgmt**       | Add / edit / deactivate hospitals \| Configure departments system-wide \| Bed category management    |
| **Staff Mgmt**          | View all staff across hospitals \| Override or reset any account \| Transfer staff between hospitals |
| **Doctor Mgmt**         | View and manage all doctors \| Transfer doctors between hospitals \| Override schedules and leave    |
| **Patient Mgmt**        | Full access to all patient records \| View cross-hospital patient history                            |
| **Appointments**        | View and override any appointment \| Cross-hospital appointment reports                              |
| **Admission/Discharge** | Full access to all admissions \| Override any admission or discharge                                 |
| **Pharmacy**            | View stock levels across all hospitals \| View dispensing summaries                                  |
| **Inventory**           | View and manage supplies all hospitals \| Cross-hospital stock comparison                            |
| **Lab**                 | View all test orders and results \| Monitor lab SLA across hospitals                                 |
| **Billing**             | Consolidated revenue view \| Outstanding payments network-wide \| Export financial summaries         |
| **Attendance**          | View attendance across all hospitals \| Approve leave overrides                                      |
| **Reports**             | All cross-hospital reports \| Export as PDF / Excel                                                  |
| **Notifications**       | Receive all system-level alerts                                                                      |
| **Settings / Audit**    | Role management \| System config \| Full audit logs - all users, all hospitals                       |

**02\. Hospital Admin** - Single Assigned Hospital

Manages all operations within their assigned hospital. Has full control within their hospital but cannot view or modify any other hospital's data.

| **Module Access**       | **Features & Permissions**                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**           | Hospital KPIs \| Staff online status \| Today's appointments and admissions                                                              |
| **Hospital Mgmt**       | Edit hospital profile \| Manage departments \| Bed management - add, edit, track                                                         |
| **Staff Mgmt**          | Add / edit / deactivate staff \| Assign departments and shifts \| Approve / reject leave \| View attendance logs \| View payroll summary |
| **Doctor Mgmt**         | Add / edit doctor profiles \| Set schedules and availability \| Manage patient assignments \| Approve leave requests                     |
| **Patient Mgmt**        | Full access to all patient records \| View consultation and billing history                                                              |
| **Appointments**        | View and manage all appointments \| Override or cancel any slot                                                                          |
| **Admission/Discharge** | Full admission and discharge management \| Bed assignment oversight                                                                      |
| **Pharmacy**            | Full pharmacy stock access \| View dispensing reports \| Approve medicine returns                                                        |
| **Inventory**           | Full inventory access \| Set reorder levels \| Approve purchase entries                                                                  |
| **Lab**                 | View all test orders and results \| Monitor lab turnaround times                                                                         |
| **Billing**             | View all invoices \| View payment status \| Revenue reports \| Export financial data                                                     |
| **Attendance**          | View and manage all staff attendance \| Approve leave requests                                                                           |
| **Reports**             | All hospital-level reports - patient, staff, financial, pharmacy, inventory                                                              |
| **Settings**            | Department config \| Alert thresholds \| Shift templates                                                                                 |

**03\. Hospital Manager** - Single Hospital - View Only

An operational oversight role for GMs or department heads who need monitoring access without the ability to make changes.

| **Module Access** | **Features & Permissions**                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Full hospital dashboard - view only                                                                                                                       |
| **All Modules**   | Read-only view across patient, staff, billing, pharmacy, lab, and inventory data \| Cannot add, edit, or delete any record \| Cannot manage user accounts |
| **Reports**       | View and export all hospital-level reports                                                                                                                |
| **Notifications** | Receive operational alerts                                                                                                                                |

**04\. Doctor** - Assigned Patients Only

Clinical role focused on patient care. Doctors can only access their assigned patients and have no visibility into billing, pharmacy stock, or staff management.

| **Module Access** | **Features & Permissions**                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Dashboard**     | Today's appointment list \| Pending lab results \| Patient summary cards                                                       |
| **Doctor Mgmt**   | View and update own profile \| Manage own schedule and availability \| Apply for leave                                         |
| **Patient Mgmt**  | View full medical records (assigned patients only) \| Add consultation notes and diagnosis \| View medical and allergy history |
| **Prescriptions** | Create new prescriptions for assigned patients \| View own prescription history \| Cannot edit after pharmacy dispenses        |
| **Appointments**  | View own appointment calendar \| Mark as Completed / No-show \| View patient details per appointment                           |
| **Lab**           | Create lab test orders for assigned patients \| View uploaded lab results                                                      |
| **Attendance**    | View own attendance \| Apply for leave                                                                                         |

**05\. Nurse** - Assigned Ward

Clinical support role for ward-level patient care. Can record vitals and manage nursing tasks but cannot write prescriptions or access billing.

| **Module Access**       | **Features & Permissions**                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**           | Ward occupancy at a glance \| Nursing task list for the day                                                                                                                                         |
| **Patient Mgmt**        | View patient profile and medical history (read-only) \| Record and update vitals (BP, temp, pulse, SPO2) \| Add nursing notes to patient records \| View prescriptions and doctor notes (read-only) |
| **Admission/Discharge** | Update bed/ward assignment notes \| Mark bed as occupied / vacant / maintenance                                                                                                                     |
| **Appointments**        | View ward appointment schedule (read-only)                                                                                                                                                          |
| **Lab**                 | View test orders for ward patients (read-only)                                                                                                                                                      |
| **Attendance**          | View own attendance \| Apply for leave                                                                                                                                                              |

**06\. Receptionist** - Single Hospital - Patient-Facing

First point of contact. Handles patient registration, appointments, and walk-ins. Cannot view medical records or billing amounts.

| **Module Access**       | **Features & Permissions**                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**           | Today's appointment schedule \| Walk-in queue status                                                                                                                       |
| **Patient Mgmt**        | Register new patients \| Auto-generate UHID \| Edit basic patient demographics (not medical records)                                                                       |
| **Appointments**        | Book, reschedule, and cancel appointments \| Walk-in registration and queue management \| View doctor availability and slots \| Trigger appointment confirmation SMS/email |
| **Admission/Discharge** | Initiate admission process (links bed + doctor) \| Initiate discharge (triggers billing team) \| Print admission/discharge summary                                         |
| **Attendance**          | View own attendance \| Apply for leave                                                                                                                                     |

**07\. Billing Executive** - Single Hospital - Finance

Handles all financial operations for the hospital. Has no access to clinical medical records - only patient identification details needed to link to invoices.

| **Module Access** | **Features & Permissions**                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Daily collection summary \| Pending payments count \| Outstanding balance alerts                                                                                                                                                                                                                                                                                                      |
| **Billing**       | View and generate patient invoices \| Auto-populate charges from consultations, lab, and pharmacy \| Add manual charges (room, procedure fees) \| Edit and finalise invoices \| Record payments (cash, card, UPI, insurance) \| Mark as Paid / Partially Paid / Pending \| Generate and print receipts \| Handle refunds and adjustments \| Manage insurance details and claim status |
| **Reports**       | Daily collection report \| Outstanding payment report \| Revenue by department and service \| Export as PDF / Excel                                                                                                                                                                                                                                                                   |
| **Attendance**    | View own attendance \| Apply for leave                                                                                                                                                                                                                                                                                                                                                |

**08\. Pharmacy Staff** - Single Hospital - Pharmacy

Manages medicine dispensing tied directly to doctor prescriptions. Cannot create prescriptions, view full patient records, or access billing invoices.

| **Module Access** | **Features & Permissions**                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Pending prescriptions to dispense \| Low stock alerts \| Expiry alerts                                                                                                                                                                                                  |
| **Pharmacy**      | View doctor prescriptions for inpatients and outpatients \| Mark medicines as dispensed (full or partial) \| Handle medicine returns with stock adjustment \| Add purchase/restock entries \| Record batch numbers and expiry dates \| View low stock and expiry alerts |
| **Reports**       | Daily dispensing log \| Stock consumption report \| Expiry report                                                                                                                                                                                                       |
| **Attendance**    | View own attendance \| Apply for leave                                                                                                                                                                                                                                  |

**09\. Lab Technician** - Single Hospital - Laboratory

Processes lab test orders raised by doctors. Can upload and release results but cannot create test orders, view full patient records, or access billing.

| **Module Access** | **Features & Permissions**                                                                                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Pending test orders \| Samples in progress \| Results ready for release                                                                                                                                                                                                           |
| **Lab**           | View lab test orders raised by doctors \| Log sample collection with timestamp \| Mark test status: In Progress / Completed \| Upload test result PDF or structured values \| Re-upload corrected results with admin note \| Release results to patient portal after verification |
| **Reports**       | Daily test completion log \| Pending tests report \| Turnaround time report                                                                                                                                                                                                       |
| **Attendance**    | View own attendance \| Apply for leave                                                                                                                                                                                                                                            |

**10\. Patient** - Own Records Only - Self-Service Portal

Patients access only their own data through a dedicated self-service portal. They have no visibility into any other patient's records or any operational module.

| **Module Access** | **Features & Permissions**                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Upcoming appointments \| Recent bills \| Latest lab results                                                                                               |
| **Patient Mgmt**  | View own profile and demographics                                                                                                                         |
| **Appointments**  | Book new appointments (if self-booking is enabled) \| Cancel or reschedule own appointments \| View appointment history                                   |
| **Medical**       | View own medical records and doctor notes (configurable by hospital) \| View prescription history \| View and download lab results (after release by lab) |
| **Billing**       | View own invoices and outstanding balance \| Download receipts and statements                                                                             |

**Section 5 - Detailed Module Descriptions**

Each module's sub-features, details, and role access are described below.

**Module 01: Dashboard**

Each role sees a personalised dashboard showing only the metrics and quick actions relevant to their responsibilities. No role sees another role's dashboard data.

| **Sub-Feature**              | **Details**                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin Dashboard**    | All-hospital KPI tiles (patient count, revenue, bed occupancy, staff online), alerts across all 20 hospitals, quick-jump to any hospital |
| **Hospital Admin Dashboard** | Hospital-level KPIs, today's appointments, bed availability, staff attendance summary, low stock alerts                                  |
| **Doctor Dashboard**         | Today's patient appointment list, pending lab results, recent consultation summary                                                       |
| **Nurse Dashboard**          | Ward task list, bed occupancy for assigned ward, patients needing vitals update                                                          |
| **Receptionist Dashboard**   | Today's appointment schedule, walk-in queue count, upcoming slots available                                                              |
| **Billing Dashboard**        | Daily collection total, pending invoices count, outstanding payment alerts                                                               |
| **Pharmacy Dashboard**       | Pending prescriptions to dispense, low stock alerts, medicines expiring within 30 days                                                   |
| **Lab Dashboard**            | Pending test orders, samples in progress, results ready for release                                                                      |
| **Patient Dashboard**        | Next appointment, latest bill summary, recent lab results status                                                                         |
| **Who Can Access**           | All roles - each sees their own version only                                                                                             |

**Module 02: Hospital Management**

Central module for managing hospital profiles, internal structure, and physical resources across all 20 hospitals.

| **Sub-Feature**           | **Details**                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Hospital Profiles**     | Add and edit hospital name, location, contact details, facilities, and operating hours                                    |
| **Department Management** | Create and manage departments (OPD, ICU, Surgery, Pharmacy, Lab, etc.) per hospital                                       |
| **Bed Management**        | Add wards and beds, track bed status (Available, Occupied, Maintenance), configure bed categories (General, ICU, Private) |
| **Branch Overview**       | Super Admin view showing all 20 hospitals with live status indicators                                                     |
| **Who Can Access**        | Super Admin (full), Hospital Admin (own hospital), Hospital Manager (view only)                                           |

**Module 03: Staff Management**

Manages all non-doctor hospital personnel including nurses, receptionists, billing executives, pharmacy staff, and lab technicians.

| **Sub-Feature**           | **Details**                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Staff Profiles**        | Create and manage profiles with role, department, contact, qualifications, and employment details    |
| **Department Assignment** | Assign staff to one or more departments; manage reassignments                                        |
| **Shift Scheduling**      | Create shift rosters, assign staff to shifts, detect scheduling conflicts, publish shift calendar    |
| **Payroll Summary**       | View basic salary, deductions, and payment records per employee. Edit access for Hospital Admin only |
| **Account Management**    | Create login credentials for staff, assign roles, deactivate accounts                                |
| **Who Can Access**        | Super Admin (full, all hospitals), Hospital Admin (own hospital), Hospital Manager (view only)       |

**Module 04: Doctor Management**

Dedicated module for doctor-specific operations separate from general staff management, due to clinical authority and scheduling complexity.

| **Sub-Feature**             | **Details**                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Doctor Profiles**         | Full profiles: specialisation, qualifications, registration number, assigned hospital, contact                            |
| **Schedule & Availability** | Set working days, hours, and available appointment slots; mark days off                                                   |
| **Patient Assignment**      | Assign and track patients under each doctor; view current patient load                                                    |
| **Consultation History**    | Log of all consultations and doctor notes per doctor                                                                      |
| **Leave Management**        | Doctors apply for leave; Hospital Admin approves or rejects; calendar updated automatically                               |
| **Who Can Access**          | Super Admin (full), Hospital Admin (full - own hospital), Doctor (own profile and schedule), Hospital Manager (view only) |

**Module 05: Patient Management**

Core module for all patient data from initial registration through ongoing care. Acts as the central record linked to by Appointments, Lab, Pharmacy, and Billing.

| **Sub-Feature**          | **Details**                                                                                                                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Patient Registration** | Register new patients with demographics, contact, emergency contact, and insurance info                                                                                                                                                                                    |
| **UHID Generation**      | Auto-generate a Unique Hospital ID per patient, usable across all 20 hospitals                                                                                                                                                                                             |
| **Medical History**      | Record diagnoses, allergies, chronic conditions, past surgeries, current medications                                                                                                                                                                                       |
| **Consultation Logs**    | View all past consultation notes and doctor observations linked to this patient                                                                                                                                                                                            |
| **Billing History**      | View all invoices and payment records for this patient                                                                                                                                                                                                                     |
| **Emergency Records**    | Quick-entry form for emergency admissions - minimal required fields to speed up intake                                                                                                                                                                                     |
| **Who Can Access**       | Super Admin / Hospital Admin (full), Doctor (assigned patients - clinical fields), Nurse (view + vitals), Receptionist (demographics only), Billing (name + ID only), Pharmacy (name + active prescription only), Lab (name + test order only), Patient (own records only) |

**Module 06: Appointment Management**

Handles all appointment scheduling across online booking, walk-ins, and the doctor's calendar view.

| **Sub-Feature**                | **Details**                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Online Appointment Booking** | Book appointments by selecting hospital, department, doctor, and available slot                                                                                        |
| **Walk-in Registration**       | Register walk-in patients directly into the queue; auto-assign next available slot                                                                                     |
| **Appointment Calendar**       | Visual calendar showing booked, available, and blocked slots per doctor                                                                                                |
| **Appointment Status**         | Track statuses: Scheduled, Confirmed, In Progress, Completed, Cancelled, No-show                                                                                       |
| **Notifications**              | Auto-send confirmation and reminder notifications to patient via SMS or email                                                                                          |
| **Who Can Access**             | Super Admin / Hospital Admin (full), Receptionist (full booking + walk-in), Doctor (own calendar - mark completed/no-show), Patient (book and manage own appointments) |

**Module 07: Admission & Discharge**

Workflow module that coordinates patient admissions and discharges across Patient Management, Bed Management, Doctor assignment, and Billing.

| **Sub-Feature**        | **Details**                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admission Workflow** | Link patient to bed, doctor, department, and admission date; capture reason for admission                                                                                                                             |
| **Bed Assignment**     | Select and assign available bed at time of admission; auto-mark bed as Occupied                                                                                                                                       |
| **Inpatient Tracking** | Track active admissions - current ward, assigned doctor, days admitted, outstanding tasks                                                                                                                             |
| **Discharge Process**  | Mark patient as discharged, auto-free the bed, trigger billing to generate final invoice                                                                                                                              |
| **Admission Summary**  | Printable admission and discharge summary documents for patient records                                                                                                                                               |
| **Who Can Access**     | Super Admin / Hospital Admin (full), Receptionist (initiate admission and discharge - triggers only), Nurse (update ward notes), Doctor (view admission status), Billing (view discharge trigger - generates invoice) |

**Module 08: Pharmacy Management**

Separate from general inventory. Handles medicine-specific operations including prescription-linked dispensing and direct integration with the billing module.

| **Sub-Feature**             | **Details**                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Medicine Master List**    | Manage medicines with generic name, category, unit, HSN/SAC code, and supplier info                         |
| **Stock Management**        | Track stock per hospital by batch number, quantity, and location                                            |
| **Purchase / Restock**      | Log purchase entries with supplier invoice, received quantity, batch, and expiry date                       |
| **Expiry Tracking**         | Flag medicines expiring in 30/60/90 days (configurable); alerts sent to Pharmacy Staff and Hospital Admin   |
| **Low Stock Alerts**        | Set reorder level per medicine; alerts triggered when stock falls below threshold                           |
| **Prescription Dispensing** | Open a doctor's active prescription and mark medicines as dispensed; supports partial dispensing            |
| **Medicine Returns**        | Process unused medicine returns; auto-adjust stock quantities                                               |
| **Billing Integration**     | Dispensed medicines automatically pushed as line items to the patient's invoice                             |
| **Reports**                 | Daily dispensing log, stock consumption report, expiry report, purchase history                             |
| **Who Can Access**          | Super Admin / Hospital Admin (full), Pharmacy Staff (full dispensing + stock), Hospital Manager (view only) |

**Module 09: Inventory Management**

Manages general hospital supplies - surgical items, consumables, linen, equipment - completely separate from the Pharmacy module.

| **Sub-Feature**        | **Details**                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Supplies Catalogue** | Maintain a list of all non-medicine items with category, unit, and supplier details |
| **Stock Tracking**     | Track quantity per item per hospital; log usage and adjustments                     |
| **Low Stock Alerts**   | Set reorder levels per item; alert Hospital Admin when stock falls below threshold  |
| **Expiry Tracking**    | Flag consumables and sterile items nearing expiry dates                             |
| **Purchase Entries**   | Log incoming stock with supplier invoice reference, quantity received, and date     |
| **Who Can Access**     | Super Admin / Hospital Admin (full), Hospital Manager (view only)                   |

**Module 10: Lab Management**

Manages the full cycle of lab test requests - from doctor order through sample collection to result upload and patient release.

| **Sub-Feature**          | **Details**                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Orders**          | Doctors raise test orders linked to patient and prescription; order includes test type, urgency, notes                                                                                                                 |
| **Sample Management**    | Log sample collection with timestamp, sample type, and collector name; track sample through processing                                                                                                                 |
| **Test Status Tracking** | Status flow: Order Received → Sample Collected → In Processing → Resulted → Released                                                                                                                                   |
| **Result Upload**        | Lab technician uploads result as PDF or enters structured values per test parameter                                                                                                                                    |
| **Result Release**       | Results are released to doctor and patient portal only after tech verification - prevents premature access                                                                                                             |
| **Reports**              | Daily completion log, pending tests, turnaround time reports                                                                                                                                                           |
| **Who Can Access**       | Super Admin / Hospital Admin (full), Doctor (create orders + view own patient results), Lab Technician (sample + result upload + release), Nurse (view results for ward patients), Patient (own released results only) |

**Module 11: Billing**

Handles all financial transactions from invoice generation to payment recording. Auto-populated from consultations, lab orders, and pharmacy dispensing.

| **Sub-Feature**          | **Details**                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Invoice Generation**   | Auto-generate invoices from: consultation fees, room charges, lab tests, dispensed medicines, procedures                                                                                                           |
| **Manual Charges**       | Billing Executive can add ad-hoc charges (special procedures, equipment use, etc.)                                                                                                                                 |
| **Payment Processing**   | Record payments by mode (cash, card, UPI, insurance); mark invoice as Paid / Partial / Pending                                                                                                                     |
| **Receipts**             | Generate and print payment receipts and full account statements                                                                                                                                                    |
| **Insurance Management** | Attach insurance provider details to patient, track insurance claim status per invoice                                                                                                                             |
| **Refunds**              | Process refunds and billing adjustments with reason log                                                                                                                                                            |
| **Reports**              | Daily collection, outstanding payments, revenue by department/service, insurance claim status                                                                                                                      |
| **Who Can Access**       | Super Admin / Hospital Admin (full), Billing Executive (full - own hospital), Receptionist (initiate discharge trigger only), Pharmacy Staff (push dispensed items only), Patient (view own invoices and receipts) |

**Module 12: Attendance**

Tracks staff working hours and manages leave. Attendance is linked to fingerprint biometric login for automatic clock-in/out.

| **Sub-Feature**          | **Details**                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Clock-In / Clock-Out** | Biometric fingerprint auto-logs attendance timestamps; manual override by Hospital Admin                                |
| **Attendance Records**   | View daily, weekly, and monthly attendance per staff member                                                             |
| **Leave Application**    | Staff apply for leave with type (sick, casual, earned), dates, and reason                                               |
| **Leave Approval**       | Hospital Admin approves or rejects leave requests; doctor schedules auto-updated                                        |
| **Leave Balance**        | Track remaining leave quota per employee per leave type                                                                 |
| **Shift Compliance**     | Compare scheduled shifts vs actual attendance; flag absent or late arrivals                                             |
| **Reports**              | Monthly attendance summary, leave report, shift compliance report per department                                        |
| **Who Can Access**       | Super Admin / Hospital Admin (full), Hospital Manager (view), All Staff Roles (own attendance + leave application only) |

**Module 13: Reports & Analytics**

Consolidated reporting module for management-level users. Individual modules have their own sub-reports; this module pulls cross-module summaries.

| **Sub-Feature**              | **Details**                                                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hospital Overview Report** | Patient volume, bed occupancy, revenue, staff headcount - all in one view per hospital                                                                                                                    |
| **Patient Statistics**       | Daily/monthly admissions, OPD counts, top diagnoses, discharge rates                                                                                                                                      |
| **Financial Summary**        | Revenue, collections, outstanding, insurance claims - hospital-wise and department-wise                                                                                                                   |
| **Staff Performance Report** | Attendance compliance, leave usage, shift adherence per department                                                                                                                                        |
| **Inventory & Pharmacy**     | Stock levels, consumption rates, expiry summary, top dispensed medicines                                                                                                                                  |
| **Export Options**           | All reports exportable as PDF or Excel for management presentations                                                                                                                                       |
| **Who Can Access**           | Super Admin (all hospitals), Hospital Admin / Hospital Manager (own hospital only), Billing Executive (financial reports only), Pharmacy Staff (pharmacy reports only), Lab Technician (lab reports only) |

**Module 14: Notifications**

Centralised alert system that aggregates notifications from all modules and delivers them to the relevant role. No separate UI management needed - alerts are auto-triggered.

| **Sub-Feature**           | **Details**                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Stock Alerts**          | Triggered when medicine or supply stock falls below reorder level                                                                  |
| **Expiry Alerts**         | Triggered 30/60/90 days before medicine or supply expiry (configurable)                                                            |
| **Appointment Reminders** | Auto-sent to patients 24 hours and 1 hour before appointment via SMS or email                                                      |
| **Lab Result Ready**      | Notifies doctor when lab results are uploaded and released                                                                         |
| **Leave Status Update**   | Notifies staff when their leave application is approved or rejected                                                                |
| **Discharge Alert**       | Notifies Billing Executive when a patient discharge is initiated                                                                   |
| **Who Can Access**        | All roles receive notifications relevant to their responsibilities. Super Admin and Hospital Admin receive system-critical alerts. |

**Module 15: Settings & Audit**

System configuration and security oversight. Most settings are Super Admin only; Hospital Admin has limited department-level config access.

| **Sub-Feature**      | **Details**                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Role Management**  | Super Admin can view and configure role-permission mappings (read-only in initial release; editable in v2)         |
| **Hospital Config**  | Hospital Admin can configure department alert thresholds, shift templates, appointment slot duration               |
| **System Settings**  | Super Admin: session timeout, notification delivery settings, system-wide toggles                                  |
| **Audit Logs**       | Full log of who logged in, what records were created/edited/deleted, timestamps, and IP address - Super Admin only |
| **Account Security** | Failed login lockout policy, WebAuthn biometric device management, fallback OTP config                             |
| **Who Can Access**   | Super Admin (full), Hospital Admin (limited - own hospital config only)                                            |