const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "CHANGE_THIS_SECRET_32_CHAR_MINIMUM";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// -----------------------------
// REGISTER
// -----------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// -----------------------------
// LOGIN
// -----------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: "User account disabled" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Optional: update streak if supported
    if (typeof user.updateStreak === "function") {
      user.updateStreak();
    }

    await user.save();

    const token = generateToken(user._id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// -----------------------------
// GET CURRENT USER (AFTER AUTH MIDDLEWARE)
// -----------------------------
exports.getMe = async (req, res) => {
  try {
    const user = req.user; // PROVIDED BY auth.js MIDDLEWARE

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        stats: user.stats,
        achievements: user.achievements,
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Unable to fetch user" });
  }
};
