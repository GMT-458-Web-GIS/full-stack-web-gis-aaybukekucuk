[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/dxPbR2Gs)

# Cinemap: A Comprehensive Web-GIS Platform for Movie Production Analytics

Cinemap is a high-performance Web Geographic Information System (Web-GIS) designed to map, analyze, and manage movie filming locations globally. The project integrates real-time spatial data management with advanced server-side GIS rendering, providing a cinematic user experience for film industry analysts and movie enthusiasts.

## 1. UI/UX Design Philosophy

The user interface is designed with a "Cinematic Dark Mode" aesthetic, prioritizing map visibility and user focus.

- **Responsive Sidebar:** A dynamic 320px panel that adjusts to the screen size, containing all management tools and filters.
- **Interactive Map Layers:** Users can toggle between Marker Clustering, Heatmaps, and WMS layers to change their analytical perspective.
- **Visual Feedback:** High-contrast markers and glowing "REC" icons are used to represent spatial points, maintaining the cinematic theme.

**(IMAGE: Place a high-quality screenshot of the main map interface here. It should show the dark-themed sidebar on the left and the map on the right.)**

---

## 2. Technical Architecture

The system follows a modern decoupled architecture to ensure scalability and performance:

| Layer | Component | Implementation |
| :--- | :--- | :--- |
| **Client Side** | Frontend Framework | React.js with Functional Components & Hooks |
| **Spatial Engine** | Mapping Engine | Leaflet.js with React-Leaflet wrappers |
| **Server Side** | API Engine | Node.js with Express.js Middleware |
| **Storage** | NoSQL Database | MongoDB Atlas with GeoJSON support |
| **GIS Infrastructure** | Map Server | GeoServer 2.26.x (WMS Protocol) |
| **Quality Assurance** | Load Testing | Artillery.io Stress Testing Suite |

---

## 3. Role-Based Access Control (RBAC) (20%)

To ensure data security and integrity, the system implements a strict permission hierarchy:

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Admin** | Superuser | Full CRUD on all records, user ban/management, and system logs. |
| **Cinephile** | Contributor | Adding filming locations, uploading media (scenes), and editing own data. |
| **Ticket Holder** | Observer | Exploring the map, using spatial filters, and managing a personal watchlist. |

**(IMAGE: Place a screenshot of the Login screen and a view of the User Management table from the Admin panel here.)**

---

## 4. NoSQL Data Management (25%)

The project utilizes MongoDB to handle complex spatial and non-spatial datasets. The choice of NoSQL over traditional SQL was driven by:

- **GeoJSON Points:** Movie coordinates are stored in native GeoJSON format, allowing for high-speed spatial indexing (`2dsphere`).
- **Media Archiving:** Each movie record can store arrays of scene photos and video links without requiring complex table joins.
- **Performance:** NoSQL architecture allows for horizontal scaling, which is crucial for applications handling thousands of global map markers.

---

## 5. REST API and Swagger Documentation (25%)

The backend exposes a robust REST API for seamless communication between the map and the database. All endpoints follow standard HTTP methods:

- **GET /api/movies:** Returns a collection of filming locations with spatial properties.
- **POST /api/movies:** Allows authorized users to create new geographic features.
- **PUT /api/movies/:id:** Facilitates the modification of existing spatial data and attributes.
- **DELETE /api/movies/:id:** Provides safe removal of records by authorized personnel.

**(IMAGE: Place a screenshot of the Swagger UI documentation here, showing the expanded list of API endpoints.)**

---

## 6. Performance Analysis and Load Testing (25%)

To validate the system's reliability, a stress test was conducted using Artillery. The goal was to ensure the Node.js server could handle concurrent traffic during peak usage.

**Test Parameters:**
- **Requests Per Second (RPS):** 20
- **Total Requests:** 1500
- **Target Endpoint:** Movie Discovery API

**Results Summary:**
- **Success Rate:** 100% of requests returned HTTP 200 status.
- **Error Rate:** 0% (Zero ECONNREFUSED or Timeout errors).
- **Latency (p95):** 162.4ms (Ensuring a smooth experience for users).

**(IMAGE: Place a screenshot of the terminal showing the successful Artillery Summary Report with 0 failures.)**

---

## 7. GeoServer and WMS Implementation (25%)

The application integrates an industrial-grade GIS server (GeoServer) to provide advanced spatial layers via the WMS protocol.

- **Interoperability:** The system combines client-side rendered MongoDB points with server-side rendered GeoServer polygons.
- **Layer Details:** The integrated `topp:states` layer demonstrates the system's ability to handle complex vector data rendered as tiles for optimal performance.

**(IMAGE: Place a screenshot here showing the map with the colored GeoServer USA state boundaries layer visible over the base map.)**

---

## 8. Deployment Strategy & Technical Constraints

The Cinemap application is architected to be cloud-compatible; however, for the final presentation, the system is hosted on a **Local GIS Server Environment**. This decision was made based on several technical factors:

### Why Local Environment?

| Factor | Technical Reason |
| :--- | :--- |
| **GeoServer Resources** | GeoServer is a high-performance Java-based application that requires significant RAM and CPU. Free cloud hosting tiers are insufficient for stable GIS rendering. |
| **Spatial Synchronization** | To maintain 100% data integrity between the MongoDB NoSQL database and the GeoServer WMS layers, a low-latency local connection is required. |
| **Tunneling Limitations** | Standard tunneling services (like ngrok/localtunnel) restrict multiple concurrent ports (3000, 5000, and 8080). Forcing these through a single tunnel can cause "503 Tunnel Unavailable" errors during spatial queries. |
| **Presentation Stability** | Hosting the project locally ensures that the map rendering and movie filtering functions perform at maximum speed without dependency on external network speeds. |

### Conclusion
By utilizing a local GIS stack, the project demonstrates a fully functional "Professional GIS Workstation" setup, ensuring that all spatial operations (CRUD, WMS filtering, and Marker Clustering) remain stable and responsive during evaluation.

## Installation Guide

### Prerequisites
- Node.js Environment
- MongoDB Instance
- GeoServer Running on Port 8080

### Execution
1. **Database:** Ensure MongoDB is active and the connection string is configured.
2. **Server:** Navigate to `/server`, run `npm install`, then `node index.js`.
3. **Client:** Navigate to `/client`, run `npm install`, then `npm start`.
4. **GIS Server:** Start GeoServer and ensure the WMS service is enabled for the workspace.

---
**Course:** GMT 458 - Web Based Geographic Information Systems  
**Project Owner:** [Aybüke Küçük]