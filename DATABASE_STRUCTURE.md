# 🗄️ DATABASE STRUCTURE GUIDE

## Overview
Your blogging website uses **MongoDB** - a NoSQL database that stores data as JSON-like documents.

**Database Name:** `blogging-website`

---

## 📦 Collections (Tables)

### 1️⃣ **users** Collection
Stores all user accounts (both Guest who signed up and logged-in Users)

```javascript
{
  _id: ObjectId("..."),                    // Auto-generated unique ID
  
  personal_info: {
    fullname: "John Doe",                  // User's full name
    email: "john@example.com",             // Unique email
    password: "$2b$10$hashed...",           // Bcrypt hashed password (SECURE!)
    username: "johndoe123",                // Unique username
    bio: "I love writing blogs",           // User bio (max 200 chars)
    profile_img: "https://api.dicebear..." // Auto-generated avatar
  },
  
  social_links: {
    youtube: "https://youtube.com/...",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: ""
  },
  
  account_info: {
    total_posts: 5,                        // Number of blogs published
    total_reads: 150                       // Total views on all blogs
  },
  
  google_auth: false,                      // True if signed up with Google
  blogs: [                                 // Array of blog IDs user created
    ObjectId("..."),
    ObjectId("...")
  ],
  
  joinedAt: "2025-12-23T12:30:00.000Z"    // Account creation date
}
```

---

### 2️⃣ **blogs** Collection
Stores all blog posts (both public and private drafts)

```javascript
{
  _id: ObjectId("..."),
  
  blog_id: "my-first-blog-abc123",         // URL-friendly unique ID
  title: "My First Blog Post",             // Blog title
  banner: "https://...image.jpg",          // Banner image URL
  des: "This is my first blog...",         // Description (max 200 chars)
  
  content: [                               // EditorJS blocks (rich content)
    {
      type: "paragraph",
      data: { text: "Hello world..." }
    },
    {
      type: "header",
      data: { text: "Introduction", level: 2 }
    },
    {
      type: "image",
      data: { url: "...", caption: "..." }
    }
  ],
  
  tags: ["technology", "javascript"],      // Blog tags (max 10)
  
  author: ObjectId("..."),                 // Reference to user who wrote it
  
  activity: {
    total_likes: 25,                       // Number of likes
    total_comments: 8,                     // Number of comments
    total_reads: 150,                      // Number of views
    total_parent_comments: 5               // Top-level comments (not replies)
  },
  
  comments: [                              // Array of comment IDs
    ObjectId("..."),
    ObjectId("...")
  ],
  
  draft: false,                            // false = published, true = draft
  
  publishedAt: "2025-12-23T14:00:00.000Z" // Publication date
}
```

---

### 3️⃣ **comments** Collection
Stores all comments and replies (nested structure)

```javascript
{
  _id: ObjectId("..."),
  
  blog_id: ObjectId("..."),                // Which blog this comment is on
  blog_author: ObjectId("..."),            // Blog's author (for notifications)
  
  comment: "Great article! Thanks!",       // The actual comment text
  
  commented_by: ObjectId("..."),           // Who wrote this comment
  
  isReply: false,                          // false = parent comment, true = reply
  
  parent: ObjectId("..."),                 // If reply, ID of parent comment
  
  children: [                              // If parent, IDs of all replies
    ObjectId("..."),
    ObjectId("...")
  ],
  
  commentedAt: "2025-12-23T15:00:00.000Z" // When comment was posted
}
```

**Comment Structure Example:**
```
Comment 1 (parent)
├── Reply 1.1
├── Reply 1.2
│   └── Reply 1.2.1 (nested reply)
└── Reply 1.3

Comment 2 (parent)
└── Reply 2.1
```

---

### 4️⃣ **notifications** Collection
Stores all user notifications (likes, comments, replies)

```javascript
{
  _id: ObjectId("..."),
  
  type: "like",                            // "like", "comment", or "reply"
  
  blog: ObjectId("..."),                   // Which blog the notification is about
  
  notification_for: ObjectId("..."),       // Who should receive this notification
  
  user: ObjectId("..."),                   // Who triggered the notification
  
  comment: ObjectId("..."),                // If comment/reply, the comment ID
  reply: ObjectId("..."),                  // If reply, the reply ID
  replied_on_comment: ObjectId("..."),     // Original comment that was replied to
  
  seen: false,                             // false = unread, true = read
  
  createdAt: "2025-12-23T16:00:00.000Z",
  updatedAt: "2025-12-23T16:05:00.000Z"
}
```

---

## 🔗 **How Collections are Related**

```
USER
  │
  ├─── creates ──→ BLOG
  │                  │
  │                  ├─── has ──→ COMMENTS
  │                  │              │
  │                  │              └─── has replies ──→ COMMENTS (nested)
  │                  │
  │                  └─── generates ──→ NOTIFICATIONS
  │
  └─── receives ──→ NOTIFICATIONS
```

---

## 🔍 **How to View Your Database**

### Option 1: MongoDB Compass (GUI - Recommended for Beginners)

1. Download: https://www.mongodb.com/try/download/compass
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. Select database: `blogging-website`
5. Click each collection to see your data!

### Option 2: MongoDB Shell (Command Line)

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use blogging-website

# View all collections
show collections

# View all users
db.users.find().pretty()

# View all blogs
db.blogs.find().pretty()

# Count documents
db.users.countDocuments()

# Find specific user by email
db.users.findOne({ "personal_info.email": "test@example.com" })

# Find all published blogs (not drafts)
db.blogs.find({ draft: false }).pretty()

# Find blogs by specific author
db.blogs.find({ author: ObjectId("...your_user_id...") })
```

### Option 3: VS Code Extension

1. Install: "MongoDB for VS Code"
2. Connect to `mongodb://localhost:27017`
3. Browse collections visually in VS Code!

---

## 🔐 **Security Features**

1. **Passwords:** Never stored as plain text! Hashed with bcrypt
   - Original: `"MyPassword123"`
   - Stored: `"$2b$10$xyz...encrypted..."`

2. **JWT Tokens:** Used for authentication
   - Generated when you login
   - Stored in sessionStorage (browser)
   - Sent with every API request to verify identity

3. **Validation:** 
   - Email must be unique
   - Username must be unique
   - Password must be 6-20 chars with uppercase, lowercase, and number

---

## 📊 **Example: What Happens When You Sign Up**

1. **You submit:** 
   ```json
   {
     "fullname": "John Doe",
     "email": "john@test.com",
     "password": "Test123"
   }
   ```

2. **Backend creates:**
   ```javascript
   // Password is hashed
   const hashedPassword = await bcrypt.hash("Test123", 10);
   // Result: "$2b$10$randomsalt..."
   
   // Username generated from email
   const username = "johntest" + nanoid(5); // "johntest_ab3f2"
   
   // User document saved to database
   {
     personal_info: {
       fullname: "John Doe",
       email: "john@test.com",
       password: "$2b$10$randomsalt...",
       username: "johntest_ab3f2",
       bio: "",
       profile_img: "https://api.dicebear.com/..."
     },
     social_links: { /* all empty */ },
     account_info: {
       total_posts: 0,
       total_reads: 0
     },
     google_auth: false,
     blogs: [],
     joinedAt: new Date()
   }
   ```

3. **You receive:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "profile_img": "https://api.dicebear.com/...",
     "username": "johntest_ab3f2",
     "fullname": "John Doe"
   }
   ```

4. **Frontend stores token in sessionStorage**
5. **You're now logged in!**

---

## 🎯 **Guest vs User - What's the Difference?**

**IMPORTANT:** There's no separate "guest" collection!

- **Guest** = Anyone NOT logged in (no token)
  - Can READ public blogs
  - Can SEARCH blogs
  - Cannot CREATE, LIKE, or COMMENT

- **User** = Logged in (has JWT token)
  - Can do EVERYTHING Guest can do
  - Plus: CREATE blogs, LIKE, COMMENT, manage profile

**The difference is NOT in the database, but in the JWT token!**

---

## 💡 **Quick Tips**

- Each document gets a unique `_id` automatically
- ObjectId references link collections together
- Arrays can hold multiple references (one user → many blogs)
- Timestamps track when data was created/updated
- Indexes on `email` and `username` make searches faster

---

Need help viewing your actual data? Let me know!
