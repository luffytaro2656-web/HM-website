import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';

// Helper to generate access and refresh tokens
const generateTokens = (user) => {
  const jti = crypto.randomUUID();
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    hospitalId: user.hospital_id,
    jti
  };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });

  const refreshToken = jwt.sign(
    { userId: user.id, jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken, jti };
};

// 1. User Registration (Signup)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields. Name, email, password, and role are required.' 
      });
    }

    // Verify if email is already registered
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Securely hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save the new user record to the database
    const assignedHospitalId = (role === 'Super Admin') ? null : (hospitalId || null);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, hospital_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, assignedHospitalId, 'Active']
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: result.insertId,
        name,
        email,
        role,
        hospitalId: assignedHospitalId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. User Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Query user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password matches using bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Validate active status
    if (user.status === 'Pending Approval') {
      return res.status(403).json({ message: 'Your account is pending administrator approval.' });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matching token expiry)
    });

    return res.json({
      message: 'Login successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospital_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 3. Silent Token Refresh
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    // Verify validity of the refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    const { jti, userId } = decoded;

    // Check if the refresh token's JTI is blacklisted
    const [blacklisted] = await pool.query('SELECT jti FROM invalidated_tokens WHERE jti = ?', [jti]);
    if (blacklisted.length > 0) {
      return res.status(403).json({ message: 'Refresh token has been revoked.' });
    }

    // Retrieve user and verify they are still active
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(403).json({ message: 'User not found.' });
    }

    const user = users[0];
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'User account is inactive.' });
    }

    // Generate a fresh Access Token with a new unique JTI
    const newJti = crypto.randomUUID();
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospital_id,
      jti: newJti
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });

    return res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 4. Logout / Token Revocation
export const logout = async (req, res) => {
  try {
    // req.user holds the decoded Access Token attributes from the authentication middleware
    const { jti, exp } = req.user;

    // Blacklist the Access Token so it can't be used again
    if (jti) {
      const expiresAt = new Date(exp * 1000);
      await pool.query('INSERT IGNORE INTO invalidated_tokens (jti, expires_at) VALUES (?, ?)', [jti, expiresAt]);
    }

    // Blacklist the Refresh Token if it exists in request cookies
    const refreshTok = req.cookies.refreshToken;
    if (refreshTok) {
      try {
        const decodedRefresh = jwt.verify(refreshTok, process.env.JWT_REFRESH_SECRET);
        if (decodedRefresh.jti) {
          const expiresAt = new Date(decodedRefresh.exp * 1000);
          await pool.query('INSERT IGNORE INTO invalidated_tokens (jti, expires_at) VALUES (?, ?)', [decodedRefresh.jti, expiresAt]);
        }
      } catch (e) {
        // Suppress invalid refresh token errors
      }
    }

    // Clear the HTTP-only cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
