import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

// Import schemas
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';
import OTP from './Schema/OTP.js';

// Import services
import { sendOTPEmail, sendWelcomeEmail } from './utils/emailService.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Trending score calculation function
const calculateTrendingScore = (blog) => {
    const { total_likes, total_comments, total_reads } = blog.activity;
    const publishedAt = new Date(blog.publishedAt);
    const now = new Date();

    // Calculate age in hours
    const ageInHours = (now - publishedAt) / (1000 * 60 * 60);

    // Engagement score: comments worth more than likes, reads worth less
    const engagementScore = (total_likes * 1) + (total_comments * 3) + (total_reads * 0.05);

    // Time decay with gravity = 1.8 (higher = older posts decay faster)
    const gravity = 1.8;
    const timeDecay = Math.pow(ageInHours + 2, gravity);

    // Final score
    const score = engagementScore / timeDecay;

    return score;
};

const server = express();
const PORT = process.env.PORT || 3000;

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple storage - all images in one folder
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const imagesDir = path.join(__dirname, 'uploads', 'images');
        
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + nanoid(10);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({ 
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Helper function to delete old avatar
const deleteOldAvatar = (oldImageUrl, userId) => {
    try {
        // Check if it's a local file (not a default dicebear avatar)
        if (oldImageUrl && oldImageUrl.includes('/uploads/images/')) {
            // Extract filename from URL
            const urlParts = oldImageUrl.split('/uploads/images/');
            if (urlParts.length > 1) {
                const filePath = path.join(__dirname, 'uploads', 'images', urlParts[1]);
                
                // Check if file exists and delete it
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('🗑️ Deleted old avatar:', filePath);
                }
            }
        }
    } catch (err) {
        console.log('⚠️ Error deleting old avatar:', err.message);
    }
};

// Middleware
server.use(express.json());
server.use(cors());
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})
.then(() => console.log('✅ Database connected successfully'))
.catch(err => console.log('❌ Database connection error:', err));

// ============= HELPER FUNCTIONS =============

// Email validation regex
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

// Format data to send to frontend
const formatDatatoSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
    
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

// Generate unique username
const generateUsername = async (email) => {
    let username = email.split("@")[0];
    
    let isUsernameExists = await User.exists({ "personal_info.username": username });
    
    if (isUsernameExists) {
        username += nanoid().substring(0, 5);
    }
    
    return username;
}

// Verify JWT middleware
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }
    
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" });
        }
        
        req.user = user.id;
        next();
    });
}

// ============= API ROUTES =============

// Test route
server.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Debug route - check drafts
server.get('/check-drafts', async (req, res) => {
    try {
        const drafts = await Blog.find({ draft: true }).select('title blog_id draft author');
        const published = await Blog.find({ draft: false }).select('title blog_id draft author');
        res.json({ 
            draftsCount: drafts.length,
            publishedCount: published.length,
            drafts: drafts,
            published: published
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SIGNUP route
server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;

    // Validating the data from frontend
    if (fullname.length < 3) {
        return res.status(403).json({ "error": "Fullname must be at least 3 letters long" });
    }
    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" });
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Email is invalid" });
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" });
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {

        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
        .catch(err => {
            
            if (err.code == 11000) {
                return res.status(500).json({ "error": "Email already exists" })
            }

            return res.status(500).json({ "error": err.message })
        })

    })

})

// SIGNIN route
server.post("/signin", (req, res) => {

    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
    .then((user) => {

        if (!user) {
            return res.status(403).json({ "error": "Email not found" });
        }

        if (!user.personal_info.password) {
            return res.status(403).json({ "error": "Account was created using google. Try logging in with google." });
        }

        bcrypt.compare(password, user.personal_info.password, (err, result) => {

            if (err) {
                return res.status(403).json({ "error": "Error occurred while login please try again" });
            }

            if (!result) {
                return res.status(403).json({ "error": "Incorrect password" })
            } else {
                return res.status(200).json(formatDatatoSend(user))
            }

        })

    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ "error": err.message })
    })

})

// Google OAuth signin/signup
server.post("/google-auth", async (req, res) => {
    try {
        let { access_token } = req.body;

        console.log("Received Google auth request");
        console.log("Client ID from env:", process.env.GOOGLE_CLIENT_ID);
        
        if (!access_token) {
            return res.status(403).json({ error: "Access token is required" });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: access_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, email_verified } = payload;

        console.log("Google auth successful for email:", email);

        if (!email_verified) {
            return res.status(403).json({ error: "Google account is not verified" });
        }

        // Check if user exists
        let user = await User.findOne({ "personal_info.email": email })
            .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");

        if (user) {
            // User exists - sign in
            console.log("User found, signing in");
            if (!user.google_auth) {
                // Account exists with email/password but not linked to Google
                // We can allow linking by updating google_auth to true
                console.log("Linking Google account to existing email account");
                
                await User.findOneAndUpdate(
                    { "personal_info.email": email },
                    { 
                        google_auth: true,
                        "personal_info.profile_img": picture || user.personal_info.profile_img
                    }
                );
                
                // Refresh user data
                user = await User.findOne({ "personal_info.email": email })
                    .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");
            }
        } else {
            // Create new user
            console.log("Creating new user");
            let username = email.split("@")[0];
            
            // Make username unique
            username = await generateUsername(username);

            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    username,
                    profile_img: picture
                },
                google_auth: true
            });

            await user.save();
            console.log("New user created:", username);

            // Send welcome email (non-blocking)
            sendWelcomeEmail(email, name).catch(err => console.error("Welcome email error:", err));
        }

        return res.status(200).json(formatDatatoSend(user));

    } catch (error) {
        console.error("Google auth error details:", error.message);
        console.error("Full error:", error);
        return res.status(500).json({ error: "Authentication failed: " + error.message });
    }
});

// Request OTP for password reset
server.post("/forgot-password", async (req, res) => {
    try {
        let { email } = req.body;

        console.log("=== FORGOT PASSWORD REQUEST ===");
        console.log("Email received:", email);

        if (!email) {
            return res.status(403).json({ error: "Email is required" });
        }

        // Check if user exists
        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            console.log("User not found for email:", email);
            return res.status(404).json({ error: "Email not found" });
        }

        console.log("User found:", user.personal_info.username);

        if (user.google_auth) {
            return res.status(403).json({ error: "Account was created using Google. Password reset is not available." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp);

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Save new OTP
        const otpDoc = new OTP({ email, otp });
        await otpDoc.save();
        console.log("OTP saved to database");

        // Send OTP email
        console.log("Sending OTP email...");
        const emailResult = await sendOTPEmail(email, otp);
        console.log("Email result:", emailResult);

        if (!emailResult.success) {
            console.error("Failed to send email:", emailResult.error);
            return res.status(500).json({ error: "Failed to send OTP email. Please try again." });
        }

        console.log("OTP sent successfully");
        return res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ error: error.message });
    }
});

// Verify OTP
server.post("/verify-otp", async (req, res) => {
    try {
        let { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(403).json({ error: "Email and OTP are required" });
        }

        // Find OTP
        const otpDoc = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(403).json({ error: "Invalid or expired OTP" });
        }

        // OTP is valid
        // Delete OTP after verification
        await OTP.deleteOne({ _id: otpDoc._id });

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Reset password
server.post("/reset-password", async (req, res) => {
    try {
        let { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(403).json({ error: "Email and new password are required" });
        }

        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" });
        }

        // Find user
        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(404).json({ error: "Email not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.findOneAndUpdate(
            { "personal_info.email": email },
            { "personal_info.password": hashedPassword }
        );

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

})

// Get latest blogs (PUBLIC - for both Guest and User)
server.post("/latest-blogs", (req, res) => {
    
    let { page, sort_by, dateFrom, dateTo } = req.body;
    
    let maxLimit = 5;
    
    // Build query
    let query = { draft: false };
    
    // Add date range filter if provided
    if (dateFrom && dateTo) {
        query.publishedAt = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo + 'T23:59:59.999Z') // Include entire end date
        };
    }
    
    // Determine sort order
    let sortQuery = {};
    if (sort_by === 'likes') {
        sortQuery = { "activity.total_likes": -1 };
    } else if (sort_by === 'comments') {
        sortQuery = { "activity.total_comments": -1 };
    } else {
        sortQuery = { "publishedAt": -1 }; // default: latest
    }
    
    Blog.find(query)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort(sortQuery)
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Get all blogs count
server.post("/all-latest-blogs-count", (req, res) => {
    
    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
    
})

// Get trending blogs
server.get("/trending-blogs", (req, res) => {

    Blog.aggregate([
        // Match only published blogs
        { $match: { draft: false } },

        // Add calculated trending score field
        {
            $addFields: {
                calculated_trending_score: {
                    $divide: [
                        // Engagement score
                        {
                            $add: [
                                { $multiply: ["$activity.total_likes", 1] },
                                { $multiply: ["$activity.total_comments", 3] },
                                { $multiply: ["$activity.total_reads", 0.05] }
                            ]
                        },
                        // Time decay
                        {
                            $pow: [
                                {
                                    $add: [
                                        {
                                            $divide: [
                                                { $subtract: [new Date(), "$publishedAt"] },
                                                3600000  // Convert to hours
                                            ]
                                        },
                                        2
                                    ]
                                },
                                1.8  // Gravity
                            ]
                        }
                    ]
                }
            }
        },

        // Sort by trending score
        { $sort: { calculated_trending_score: -1 } },

        // Limit to top 5
        { $limit: 5 },

        // Lookup author information
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        },

        // Unwind author array
        { $unwind: "$author" },

        // Select only needed fields
        {
            $project: {
                _id: 0,
                blog_id: 1,
                title: 1,
                publishedAt: 1,
                "author.personal_info.profile_img": 1,
                "author.personal_info.username": 1,
                "author.personal_info.fullname": 1
            }
        }
    ])
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.message })
    })

})

// Search blogs by multiple tags (OR condition - matches ANY tag)
server.post("/search-blogs-by-tags", (req, res) => {
    let { tags, page, sort_by, dateFrom, dateTo } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ error: "Tags array is required" });
    }
    
    let maxLimit = 5;
    
    // Build query
    let query = { 
        tags: { $in: tags }, 
        draft: false 
    };
    
    // Add date range filter if provided
    if (dateFrom && dateTo) {
        query.publishedAt = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo + 'T23:59:59.999Z')
        };
    }
    
    // Determine sort order
    let sortQuery = {};
    if (sort_by === 'likes') {
        sortQuery = { "activity.total_likes": -1 };
    } else if (sort_by === 'comments') {
        sortQuery = { "activity.total_comments": -1 };
    } else {
        sortQuery = { "publishedAt": -1 }; // default: latest
    }
    
    // Find blogs that have ANY of the specified tags
    Blog.find(query)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort(sortQuery)
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    });
});

// Count blogs by multiple tags
server.post("/search-blogs-by-tags-count", (req, res) => {
    let { tags } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ error: "Tags array is required" });
    }
    
    Blog.countDocuments({ 
        tags: { $in: tags }, 
        draft: false 
    })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    });
});

// Get all unique tags
server.get("/all-tags", (req, res) => {
    Blog.aggregate([
        // Match only published blogs
        { $match: { draft: false } },
        
        // Unwind tags array to get individual tags
        { $unwind: "$tags" },
        
        // Group by tag and count occurrences
        {
            $group: {
                _id: "$tags",
                count: { $sum: 1 }
            }
        },
        
        // Sort by count (most used first)
        { $sort: { count: -1 } },
        
        // Limit to top 50 tags (you can adjust this)
        { $limit: 50 },
        
        // Project to simpler format
        {
            $project: {
                _id: 0,
                tag: "$_id",
                count: 1
            }
        }
    ])
    .then(tags => {
        return res.status(200).json({ tags })
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.message })
    })
})

// Search blogs
server.post("/search-blogs", (req, res) => {
    
    let { tag, query, author, page, limit, eliminate_blog, sort_by } = req.body;
    
    let findQuery;
    
    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { 
            draft: false, 
            $or: [
                { title: new RegExp(query, 'i') },
                { des: new RegExp(query, 'i') },
                { tags: new RegExp(query, 'i') }
            ]
        }
    } else if (author) {
        findQuery = { author, draft: false }
    }
    
    let maxLimit = limit ? limit : 5;
    
    // Determine sort order
    let sortQuery = {};
    if (sort_by === 'likes') {
        sortQuery = { "activity.total_likes": -1 };
    } else if (sort_by === 'comments') {
        sortQuery = { "activity.total_comments": -1 };
    } else {
        sortQuery = { "publishedAt": -1 }; // default: latest
    }
    
    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort(sortQuery)
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Search users (bloggers)
server.post("/search-users", (req, res) => {
    
    let { query, page } = req.body;
    let maxLimit = 50;
    
    User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(maxLimit)
    .skip((page - 1) * maxLimit)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({ users })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Get trending tags
server.get("/trending-tags", (req, res) => {
    
    Blog.aggregate([
        { $match: { draft: false } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ])
    .then(tags => {
        return res.status(200).json({ tags })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Search blogs count
server.post("/search-blogs-count", (req, res) => {
    
    let { tag, query, author } = req.body;
    
    let findQuery;
    
    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { 
            draft: false, 
            $or: [
                { title: new RegExp(query, 'i') },
                { des: new RegExp(query, 'i') },
                { tags: new RegExp(query, 'i') }
            ]
        }
    } else if (author) {
        findQuery = { author, draft: false }
    }
    
    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
    
})

// Search users
server.post("/search-users", (req, res) => {
    
    let { query } = req.body;
    
    User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({ users })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Get user profile
server.post("/get-profile", (req, res) => {
    
    let { username } = req.body;
    
    User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
        return res.status(200).json(user)
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.message })
    })
    
})

// Create blog (USER only)
server.post('/create-blog', verifyJWT, (req, res) => {
    
    let authorId = req.user;
    
    let { title, des, banner, tags, content, draft, id } = req.body;
    
    console.log('📝 Create blog request received:');
    console.log('Tags received:', tags);
    console.log('Tags type:', typeof tags, 'Is array:', Array.isArray(tags));
    
    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title" });
    }
    
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog description under 200 characters" });
        }
        
        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it" });
        }
        
        if (!content.blocks.length) {
            return res.status(403).json({ error: "There must be some blog content to publish it" });
        }
        
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10" });
        }
    }
    
    tags = tags.map(tag => tag.toLowerCase());
    console.log('Tags after lowercase:', tags);
    
    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();
    
    if (id) {
        
        Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
        .then(blog => {
            
            if (blog.draft && !draft) {
                User.findOneAndUpdate({ _id: authorId }, { $inc : { "account_info.total_posts" : 1 } })
                .then(user => console.log('total posts incremented'))
                .catch(err => console.log(err.message));
            } else if (!blog.draft && draft) {
                User.findOneAndUpdate({ _id: authorId }, { $inc : { "account_info.total_posts" : -1 } })
                .then(user => console.log('total posts decremented'))
                .catch(err => console.log(err.message));
            }
            
            return res.status(200).json({ id: blog_id });
        })
        .catch(err => {
            return res.status(500).json({ error: "Failed to update blog" });
        })
        
    } else {
        
        let blog = new Blog({
            title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
        })
        
        blog.save().then(blog => {
            
            let incrementVal = draft ? 0 : 1;
            
            User.findOneAndUpdate({ _id: authorId }, { $inc : { "account_info.total_posts" : incrementVal }, $push : { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id })
            })
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total posts number" })
            })
            
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
        
    }
    
})

// Get blog
server.post("/get-blog", (req, res) => {
    
    let { blog_id, draft, mode } = req.body;
    
    let incrementVal = mode != 'edit' ? 1 : 0;
    
    Blog.findOneAndUpdate({ blog_id }, { $inc : { "activity.total_reads": incrementVal } })
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog => {
        
        console.log('📖 Get blog - Content type:', typeof blog.content, 'Is array:', Array.isArray(blog.content));
        if (blog.content && blog.content.length > 0) {
            console.log('Content sample:', JSON.stringify(blog.content).substring(0, 200));
        }
        
        User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, {
            $inc : { "account_info.total_reads": incrementVal }
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
        
        if (blog.draft && !draft) {
            return res.status(500).json({ error: 'You can not access draft blogs' })
        }
        
        return res.status(200).json({ blog });
        
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })
    
})

// Like blog (USER only)
server.post("/like-blog", verifyJWT, (req, res) => {

    let user_id = req.user;

    let { _id, islikedByUser } = req.body;

    let incrementVal = !islikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc : { "activity.total_likes": incrementVal } })
    .then(blog => {

        if (!islikedByUser) {
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            })

            like.save().then(notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        } else {

            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
            .then(data => {
                return res.status(200).json({ liked_by_user: false })
            })
            .catch(err => {
                return res.status(500).json({ error: err.message })
            })

        }

    })

})

// Check if user liked blog (USER only)
server.post("/isliked-by-user", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    let { _id } = req.body;
    
    Notification.exists({ user: user_id, type: 'like', blog: _id })
    .then(result => {
        return res.status(200).json({ result })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Add comment (USER only)
server.post("/add-comment", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    let { _id, comment, blog_author, replying_to, notification_id } = req.body;
    
    if (!comment.length) {
        return res.status(403).json({ error: 'Write something to leave a comment' });
    }
    
    let commentObj = {
        blog_id: _id, blog_author, comment, commented_by: user_id,
    }
    
    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }
    
    new Comment(commentObj).save().then(async commentFile => {

        let { comment, commentedAt, children } = commentFile;

        Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc : { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 } })
        .then(blog => { console.log('New comment created') });

        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        }

        if (replying_to) {

            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })
            .then(replyingToCommentDoc => { notificationObj.notification_for = replyingToCommentDoc.commented_by })

            if (notification_id) {
                Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
                .then(notification => console.log('notification updated'))
            }

        }

        // Only create notification if the user is not notifying themselves
        if (notificationObj.notification_for.toString() !== user_id.toString()) {
            new Notification(notificationObj).save().then(notification => console.log('new notification created'));
        }

        return res.status(200).json({
            comment, commentedAt, _id: commentFile._id, user_id, children
        })

    })
    
})

// Get blog comments
server.post("/get-blog-comments", (req, res) => {

    let { blog_id, skip } = req.body;

    console.log('get-blog-comments API called with blog_id:', blog_id, 'skip:', skip);

    let maxLimit = 10;

    // Find parent comments (where isReply is NOT true)
    // Use $ne: true to match both false and undefined/null
    Comment.find({ blog_id, isReply: { $ne: true } })
    .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
        'commentedAt': -1
    })
    .then(comments => {
        console.log('Found parent comments:', comments.length);
        return res.status(200).json(comments);
    })
    .catch(err => {
        console.log('Error in get-blog-comments:', err.message);
        return res.status(500).json({ error: err.message })
    })

})

// Get replies
server.post("/get-replies", (req, res) => {
    
    let { _id, skip } = req.body;
    
    let maxLimit = 5;
    
    Comment.findOne({ _id })
    .populate({
        path: "children",
        options: {
            limit: maxLimit,
            skip: skip,
            sort: { 'commentedAt': -1 }
        },
        populate: {
            path: 'commented_by',
            select: "personal_info.profile_img personal_info.fullname personal_info.username"
        },
        select: "-blog_id -updatedAt"
    })
    .select("children")
    .then(doc => {
        return res.status(200).json({ replies: doc.children })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Soft delete comment (USER only - own comments)
server.post("/delete-comment", verifyJWT, (req, res) => {

    let user_id = req.user;

    let { _id } = req.body;

    Comment.findOne({ _id })
    .then(comment => {

        if ( user_id == comment.commented_by || user_id == comment.blog_author ) {

            // Soft delete: chỉ đánh dấu isDeleted = true, không xóa khỏi database
            Comment.findOneAndUpdate({ _id }, {
                isDeleted: true,
                comment: "Comment này đã bị xóa"
            })
            .then(() => {
                console.log('Comment soft deleted');
                return res.status(200).json({ status: 'done' });
            })
            .catch(err => {
                return res.status(500).json({ error: err.message });
            })

        } else {
            return res.status(403).json({ error: "You can not delete this comment" })
        }

    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

})

// Get user written blogs (USER only - own blogs including drafts)
server.post("/user-written-blogs", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    let { page, draft, query, deletedDocCount } = req.body;
    
    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;
    
    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }
    
    Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" title banner publishedAt blog_id activity des draft -_id ")
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Get user written blogs count
server.post("/user-written-blogs-count", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    let { draft, query } = req.body;
    
    Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
    
})

// Delete blog (USER only - own blogs)
server.post("/delete-blog", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    let { blog_id } = req.body;
    
    Blog.findOneAndDelete({ blog_id })
    .then(blog => {
        
        Notification.deleteMany({ blog: blog._id }).then(data => console.log('notifications deleted'));
        
        Comment.deleteMany({ blog_id: blog._id }).then(data => console.log('comments deleted'));
        
        User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })
        .then(user => console.log('Blog Deleted'));
        
        return res.status(200).json({ status: 'done' })
        
    })
    .catch(err => {
        return res.status(500).json({ error: err.message })
    })
    
})

// Upload profile image (USER only)
server.post("/upload-profile-image", verifyJWT, upload.single('profileImage'), async (req, res) => {
    
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
        // Get user's old profile image to delete it
        const user = await User.findById(req.user).select('personal_info.profile_img personal_info.username');
        
        if (user && user.personal_info.profile_img) {
            // Delete old avatar
            deleteOldAvatar(user.personal_info.profile_img, user.personal_info.username);
        }
        
        // Build new image URL with correct path
        const username = user.personal_info.username;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${username}/avatar/${req.file.filename}`;
        
        return res.status(200).json({ 
            profile_img: imageUrl,
            message: "Image uploaded successfully" 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    
});

// Update profile (USER only)
server.post("/update-profile", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    let { fullname, username, bio, social_links, profile_img } = req.body;
    
    // Validate fullname
    if (fullname && fullname.length < 3) {
        return res.status(403).json({ error: "Fullname must be at least 3 characters long" });
    }
    
    // Validate bio length
    if (bio && bio.length > 200) {
        return res.status(403).json({ error: "Bio should not be more than 200 characters" });
    }
    
    // Validate username if provided
    if (username && username.length < 3) {
        return res.status(403).json({ error: "Username must be at least 3 characters long" });
    }
    
    // Prepare update object
    let updateObj = {};
    
    if (fullname) updateObj["personal_info.fullname"] = fullname;
    if (username) updateObj["personal_info.username"] = username;
    if (bio !== undefined) updateObj["personal_info.bio"] = bio;
    if (profile_img) updateObj["personal_info.profile_img"] = profile_img;
    if (social_links) updateObj["social_links"] = social_links;
    
    User.findOneAndUpdate({ _id: user_id }, updateObj, { 
        new: true,
        runValidators: true 
    })
    .then(user => {
        return res.status(200).json({
            fullname: user.personal_info.fullname,
            username: user.personal_info.username,
            bio: user.personal_info.bio,
            profile_img: user.personal_info.profile_img,
            social_links: user.social_links
        });
    })
    .catch(err => {
        if (err.code == 11000) {
            return res.status(500).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: err.message });
    });
    
});

// Get current user profile (USER only - own profile with all data)
server.get("/get-user-profile", verifyJWT, (req, res) => {
    
    let user_id = req.user;
    
    User.findById(user_id)
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
        return res.status(200).json(user);
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    });
    
});

// Change password (USER only)
server.post("/change-password", verifyJWT, async (req, res) => {
    
    let user_id = req.user;
    let { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
        return res.status(403).json({ error: "Please provide current and new password" });
    }
    
    if (!passwordRegex.test(newPassword)) {
        return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" });
    }
    
    try {
        // Get user with password
        const user = await User.findById(user_id).select('personal_info.password google_auth');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Check if user signed up with Google (no password)
        if (user.google_auth) {
            return res.status(403).json({ error: "You can't change password for Google authenticated account" });
        }
        
        if (!user.personal_info.password) {
            return res.status(403).json({ error: "No password set for this account" });
        }
        
        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.personal_info.password);
        
        if (!isPasswordCorrect) {
            return res.status(403).json({ error: "Current password is incorrect" });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await User.findByIdAndUpdate(user_id, { 
            "personal_info.password": hashedPassword 
        });
        
        return res.status(200).json({ message: "Password changed successfully" });
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    
});

// Get notifications (USER only)
server.post("/notifications", verifyJWT, (req, res) => {

    let user_id = req.user;
    let { page, filter, deletedDocCount } = req.body;

    let maxLimit = 10;
    let findQuery = { notification_for: user_id };
    let skipDocs = (page - 1) * maxLimit;

    if (filter != 'all') {
        findQuery.type = filter;
    }

    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id author")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .populate({
        path: "blog",
        populate: {
            path: "author",
            select: "personal_info.username"
        }
    })
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply comment replied_on_comment")
    .then(notifications => {

        // Mark fetched notifications as seen
        let notificationIds = notifications.map(notification => notification._id);

        Notification.updateMany({ _id: { $in: notificationIds } }, { seen: true })
        .then(() => console.log('notifications marked as seen'));

        return res.status(200).json({ notifications });
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })

});

// Get notification count (USER only)
server.post("/all-notifications-count", verifyJWT, (req, res) => {

    let user_id = req.user;
    let { filter } = req.body;

    let findQuery = { notification_for: user_id };

    if (filter != 'all') {
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    })

});

// Get unread notification count (USER only)
server.get("/new-notification", verifyJWT, async (req, res) => {

    let user_id = req.user;

    try {
        // Get user's notification settings
        const user = await User.findById(user_id).select('notification_settings');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Build enabled types based on settings (ignore 'all', only check individual settings)
        let enabledTypes = [];
        if (user.notification_settings.likes) enabledTypes.push("like");
        if (user.notification_settings.comments) enabledTypes.push("comment");
        if (user.notification_settings.replies) enabledTypes.push("reply");

        // If no types are enabled, return false
        if (enabledTypes.length === 0) {
            return res.status(200).json({ new_notification_available: false });
        }

        // Check for new notifications of enabled types
        const result = await Notification.exists({
            notification_for: user_id,
            seen: false,
            user: { $ne: user_id },
            type: { $in: enabledTypes }
        });

        if (result) {
            return res.status(200).json({ new_notification_available: true });
        } else {
            return res.status(200).json({ new_notification_available: false });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

});

// Get unread notification count number (USER only)
server.get("/unread-notification-count", verifyJWT, async (req, res) => {

    let user_id = req.user;

    try {
        // Get user's notification settings
        const user = await User.findById(user_id).select('notification_settings');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Build query based on notification settings
        let query = { notification_for: user_id, seen: false };

        // Filter by enabled notification types (ignore 'all', only check individual settings)
        let enabledTypes = [];
        if (user.notification_settings.likes) enabledTypes.push("like");
        if (user.notification_settings.comments) enabledTypes.push("comment");
        if (user.notification_settings.replies) enabledTypes.push("reply");

        // If no specific types are enabled, return 0
        if (enabledTypes.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        // Add type filter to query
        query.type = { $in: enabledTypes };

        const count = await Notification.countDocuments(query);
        return res.status(200).json({ count });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

});

// Update notification settings (USER only)
server.post("/update-notification-settings", verifyJWT, (req, res) => {

    let user_id = req.user;
    let { all, comments, likes, replies } = req.body;

    // Prepare update object
    let updateObj = {};

    if (all !== undefined) updateObj["notification_settings.all"] = all;
    if (comments !== undefined) updateObj["notification_settings.comments"] = comments;
    if (likes !== undefined) updateObj["notification_settings.likes"] = likes;
    if (replies !== undefined) updateObj["notification_settings.replies"] = replies;

    User.findByIdAndUpdate(user_id, updateObj, { new: true })
    .select("notification_settings")
    .then(user => {
        return res.status(200).json({
            notification_settings: user.notification_settings,
            message: "Notification settings updated successfully"
        });
    })
    .catch(err => {
        return res.status(500).json({ error: err.message });
    });

});

// ============= BLOG API ROUTES =============

// Upload blog banner (USER only)
server.post("/upload-blog-banner", verifyJWT, upload.single('banner'), async (req, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
        
        return res.status(200).json({ 
            url: imageUrl,
            message: "Banner uploaded successfully" 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    
});

// Upload blog content image (USER only)
server.post("/upload-blog-image", verifyJWT, upload.single('image'), async (req, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
        
        console.log('📸 Image uploaded:', imageUrl);
        
        return res.status(200).json({ 
            success: 1,
            file: {
                url: imageUrl
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    
});

// Create blog endpoint is at line 394

// Get blog for editing (USER only - own blogs)
// Get blog endpoint is at line 480

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
