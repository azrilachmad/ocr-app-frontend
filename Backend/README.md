# Synchro Scan Backend

Express.js backend API for Synchro Scan OCR Application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

3. **Create MySQL database:**
   ```sql
   CREATE DATABASE synchro_scan_db;
   ```

4. **Run the server:**
   ```bash
   # Development (with nodemon)
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Documents
- `GET /api/documents` - Get all documents (with filters)
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/save` - Mark as saved

### OCR
- `POST /api/ocr/process` - Upload & process document
- `POST /api/ocr/submit` - Save processed data

### Statistics
- `GET /api/stats/overview` - Dashboard stats
- `GET /api/stats/chart` - Chart data
- `GET /api/stats/by-type` - Document distribution
- `GET /api/stats/recent` - Recent scans

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/document-types` - Get document types
- `POST /api/settings/document-types` - Create document type
- `PUT /api/settings/document-types/:id` - Update document type
- `DELETE /api/settings/document-types/:id` - Delete document type

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── settingsController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Document.js
│   │   ├── DocumentType.js
│   │   ├── Settings.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   ├── ocr.js
│   │   ├── settings.js
│   │   └── stats.js
│   └── app.js
├── uploads/
├── .env.example
├── package.json
├── README.md
└── server.js
```
