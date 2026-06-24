import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// 1. Authenticate Access Token (Stateless validation + Blacklist lookup)
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expected header: Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Access token missing.' });
    }

    // Verify token signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired access token.' });
    }

    // Verify if the token has been blacklisted (revoked on logout)
    const [blacklisted] = await pool.query('SELECT jti FROM invalidated_tokens WHERE jti = ?', [decoded.jti]);
    if (blacklisted.length > 0) {
      return res.status(403).json({ message: 'Access token has been revoked.' });
    }

    // Bind decoded payload (userId, email, role, hospitalId, jti, exp) to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Enforce Role Requirements
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Insufficient permissions. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// 3. Enforce Branch/Hospital Scope Limits
export const requireHospitalAccess = (req, res, next) => {
  // Super Admin bypasses single-hospital scoping
  if (req.user.role === 'Super Admin') {
    return next();
  }

  // Extract requested hospitalId from URL path parameters or request body
  const hospitalId = req.params.hospitalId || req.body.hospitalId;

  if (!hospitalId) {
    return res.status(400).json({ message: 'Hospital ID scope is missing from the request.' });
  }

  // Verify user's hospital matches requested branch
  if (req.user.hospitalId !== hospitalId) {
    return res.status(403).json({ 
      message: 'Access denied. You do not have permissions to access resources for this hospital branch.' 
    });
  }

  next();
};
