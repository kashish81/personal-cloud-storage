# AI-Powered Personal Cloud Storage System

A modern, full-stack web application that revolutionizes file storage with intelligent AI-powered organization. Upload, manage, and search your files with automatic content analysis, smart tagging, and a beautiful responsive interface.

## ✨ Features

### 🚀 Core Functionality
- **Intelligent File Upload** - Drag & drop or click to upload with real-time progress tracking
- **AI-Powered Analysis** - Automatic content recognition and smart categorization
- **Smart Tagging System** - AI-generated tags for easy organization and discovery
- **Advanced Search** - Search across filenames, tags, content, and file types
- **File Management** - Download, share, and delete files with ease
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

### 🎨 User Experience
- **Modern UI/UX** - Clean, intuitive interface inspired by Google Drive
- **Real-time Updates** - Instant feedback on file operations
- **File Preview** - Quick file details and metadata viewing
- **User Authentication** - Secure login and registration system
- **Storage Analytics** - Visual breakdown of storage usage by file type

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern component-based architecture
- **JavaScript ES6+** - Latest language features
- **Lucide React** - Beautiful, consistent icon system
- **Custom Hooks** - Responsive design with useMediaQuery
- **Context API** - Efficient state management

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **PostgreSQL** - Robust relational database
- **Multer** - Efficient file upload handling
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing and security

### AI & Intelligence
- **Pattern-based Analysis** - Smart content recognition
- **Auto-categorization** - Context-aware file organization
- **Tag Generation** - Intelligent metadata extraction

## 📁 Project Structure

```
personal-cloud-storage/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── FileDetail.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useMediaQuery.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/
│   ├── uploads/
│   ├── server.js
│   ├── db.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kashish81/personal-cloud-storage.git
cd personal-cloud-storage
```

2. **Set up PostgreSQL Database**

Open PostgreSQL and create a new database:
```sql
CREATE DATABASE cloud_storage;
```

Create the required tables:
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(500) NOT NULL,
    stored_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    tags TEXT[],
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=cloud_storage
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:
```bash
npm start
```

4. **Frontend Setup**

Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Usage

### Getting Started
1. **Register** - Create a new account with username, email, and password
2. **Login** - Sign in with your credentials
3. **Upload Files** - Click the "New" button or drag & drop files
4. **Organize** - AI automatically tags and categorizes your files
5. **Search** - Find files quickly using the search bar
6. **Manage** - Download, share, or delete files as needed

### Key Features

#### File Upload
- Drag and drop files anywhere in the upload area
- Click to browse and select files
- Real-time progress tracking
- Automatic AI analysis and tagging

#### Search & Filter
- Search by filename
- Filter by file type
- Search through AI-generated tags
- View recent files

#### File Details
- Click any file to view detailed information
- See AI-generated tags
- View file metadata (size, type, date)
- Quick actions (Download, Share, Delete)

#### Storage Management
- View storage usage by category
- Visual breakdown (Documents, Images, Videos, Audio, Others)
- Track total storage used

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1920px and above) - Full featured experience
- **Laptop** (1024px - 1919px) - Optimized layout
- **Tablet** (641px - 1024px) - Touch-friendly interface
- **Mobile** (640px and below) - Compact, efficient design

## 🔒 Security Features

- **Password Hashing** - bcrypt encryption for user passwords
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Server-side authorization checks
- **CORS Protection** - Controlled cross-origin requests
- **SQL Injection Prevention** - Parameterized queries

## 🎨 UI/UX Highlights

- **Modern Design** - Clean, professional interface
- **Intuitive Navigation** - Easy-to-use sidebar and header
- **Smooth Animations** - Polished transitions and interactions
- **Loading States** - Clear feedback during operations
- **Error Handling** - User-friendly error messages
- **Dark Mode Ready** - Prepared for theme switching

## 🚧 Roadmap

- [ ] Advanced file sharing with permissions
- [ ] Folder organization system
- [ ] Collaborative features
- [ ] Enhanced AI capabilities
- [ ] Cloud storage integration
- [ ] Mobile apps (iOS/Android)
- [ ] Dark mode implementation
- [ ] Bulk operations
- [ ] File versioning
- [ ] Trash/Recycle bin functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👩‍💻 Author

**Kashish Rajan**
- GitHub: [@kashish81](https://github.com/kashish81)
- Project Link: [https://github.com/kashish81/personal-cloud-storage](https://github.com/kashish81/personal-cloud-storage)

## 🙏 Acknowledgments

- Lucide React for beautiful icons
- PostgreSQL for robust database
- React community for excellent documentation
- All contributors and supporters

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

⭐ **Star this repository if you find it helpful!** ⭐

Made with ❤️ by Kashish Rajan and Divyanshi Verma
## Contact
[Kashish Rajan]
[kashishrajan96@gmail.com]
[Divyanshi Verma]
[divyanshiss19@gmail.com]
