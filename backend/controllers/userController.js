import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// 1. Get List of Users
export const getUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'Super Admin';
    let query = 'SELECT id, name, email, role, hospital_id, status, created_at FROM users';
    let params = [];

    if (!isSuperAdmin) {
      // Non-super admins only see users in their own hospital branch
      query += ' WHERE hospital_id = ?';
      params.push(req.user.hospitalId);
    }

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Create User account
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    // Role escalation guards
    if (!isSuperAdmin) {
      if (role === 'Super Admin' || role === 'Hospital Admin') {
        return res.status(403).json({ message: 'You are not authorized to create administrative roles.' });
      }
    }

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email address is already in use.' });
    }

    // Determine status: Super Admin creations are Active instantly; Hospital Admin creations require Super Admin approval.
    const status = isSuperAdmin ? 'Active' : 'Pending Approval';
    const assignedHospitalId = isSuperAdmin ? (role === 'Super Admin' ? null : hospitalId) : req.user.hospitalId;

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, hospital_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, assignedHospitalId, status]
    );

    return res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: result.insertId,
        name,
        email,
        role,
        hospitalId: assignedHospitalId,
        status
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 3. Approve User
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve user details first to check
    const [users] = await pool.query('SELECT id, status FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (users[0].status === 'Active') {
      return res.status(400).json({ message: 'User is already active.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', ['Active', id]);
    return res.json({ message: 'User approved successfully.' });
  } catch (error) {
    console.error('Error approving user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 4. Update Status (Active/Inactive)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const [users] = await pool.query('SELECT id, hospital_id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = users[0];
    if (!isSuperAdmin && targetUser.hospital_id !== req.user.hospitalId) {
      return res.status(403).json({ message: 'Access denied. You can only manage users in your own branch.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return res.json({ message: 'User status updated successfully.' });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 5. Delete / Reject User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';

    const [users] = await pool.query('SELECT id, hospital_id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = users[0];
    if (!isSuperAdmin && targetUser.hospital_id !== req.user.hospitalId) {
      return res.status(403).json({ message: 'Access denied. You can only manage users in your own branch.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'User account removed successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
