# Star Vision Cable & Broadband - Operations Portal

This document provides a technical overview of the Star Vision Cable & Broadband Operations Portal, detailing its architecture and core functionalities.

---

## 🏛️ High-Level Architecture

This application is built on a serverless architecture, leveraging powerful third-party services to handle the backend, which keeps the frontend lightweight and secure.

* **Frontend (Client-Side):**
    * A single-page application built with **HTML, CSS, and vanilla JavaScript**.
    * **Tailwind CSS** is used for modern, responsive styling.
    * Hosted on **Netlify**, which provides continuous deployment directly from a GitHub repository.

* **Backend Services (Server-Side):**
    * **Firebase:** Acts as the core backend.
        * **Authentication:** Manages user logins and distinguishes between 'Admin' and 'Staff' roles.
        * **Firestore:** A real-time NoSQL database that stores all job log data. The frontend communicates directly with Firestore to read and write data.
    * **Cloudinary:**
        * Handles all image hosting. Staff-uploaded photos are sent directly to Cloudinary, which returns a URL that is then stored in the Firestore job log.

* **APIs & External Services:**
    * **Google Maps API:** Integrated on the frontend for interactive maps and location services.
    * **jsPDF & SheetJS:** Client-side libraries used for generating PDF and Excel reports.

---

## ✨ Core Functionalities

The application is divided into two main roles with distinct functionalities:

### Staff Functionalities

* **Secure Login:** Staff log in with their credentials.
* **Job Data Entry:** Submit new job logs with details such as job type, service area, landmark, and notes.
* **Location Tagging:** Pinpoint job locations using an interactive map or the device's GPS.
* **Image Upload:** Attach multiple photos to a job log by either uploading from the device or using the camera.
* **Language Selection:** Switch the interface between English and Hindi.

### Admin Functionalities

* **Secure Login:** The admin has a unique user ID for access.
* **Real-time Dashboard:** View all submitted job logs as they come in.
* **Data Visualization:**
    * **Table View:** See all jobs in a sortable and filterable table.
    * **Map View:** See all jobs plotted as pins on an interactive map.
* **Data Analysis:** An analytics page provides a summary of job types completed in each service area.
* **Reporting:** Export filtered data into two formats:
    * **Excel:** A spreadsheet with all job details, including links to images and maps.
    * **PDF:** A detailed, multi-page report with one page per job, featuring larger, embedded images and clickable map links.
* **Data Management:** Securely delete job records from the database.
