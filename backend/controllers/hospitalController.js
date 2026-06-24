import pool from '../config/db.js';
import { randomUUID } from 'crypto';

// 1. Get list of all hospitals
export const getHospitals = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'Super Admin';
    let query = 'SELECT * FROM hospitals';
    let params = [];

    if (!isSuperAdmin) {
      // Non-super admins only see their own hospital branch
      query += ' WHERE id = ?';
      params.push(req.user.hospitalId);
    }

    const [rows] = await pool.query(query, params);
    
    // Parse facilities column (JSON) for each row
    const hospitals = rows.map(row => {
      let facilities = [];
      if (row.facilities) {
        try {
          facilities = typeof row.facilities === 'string' ? JSON.parse(row.facilities) : row.facilities;
        } catch (e) {
          facilities = [];
        }
      }
      return {
        id: row.id,
        name: row.name,
        city: row.city,
        address: row.address,
        contact: row.contact,
        totalBeds: row.total_beds,
        occupiedBeds: row.occupied_beds,
        totalDoctors: row.total_doctors,
        totalPatients: row.total_patients,
        revenueThisMonth: parseFloat(row.revenue_this_month || 0),
        status: row.status,
        facilities,
        operatingHours: row.operating_hours,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    return res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Get single hospital details
export const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (!isSuperAdmin && req.user.hospitalId !== id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own hospital.' });
    }

    const [rows] = await pool.query('SELECT * FROM hospitals WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    const row = rows[0];
    let facilities = [];
    if (row.facilities) {
      try {
        facilities = typeof row.facilities === 'string' ? JSON.parse(row.facilities) : row.facilities;
      } catch (e) {
        facilities = [];
      }
    }

    const hospital = {
      id: row.id,
      name: row.name,
      city: row.city,
      address: row.address,
      contact: row.contact,
      totalBeds: row.total_beds,
      occupiedBeds: row.occupied_beds,
      totalDoctors: row.total_doctors,
      totalPatients: row.total_patients,
      revenueThisMonth: parseFloat(row.revenue_this_month || 0),
      status: row.status,
      facilities,
      operatingHours: row.operating_hours,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 3. Create a hospital and seed its selected departments
export const createHospital = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, city, address, contact, totalBeds, operatingHours, status, facilities, departments } = req.body;

    if (!name || !city || !address || !contact || !totalBeds) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    const hospitalId = randomUUID();

    await connection.beginTransaction();

    // Insert hospital branch
    await connection.query(
      'INSERT INTO hospitals (id, name, city, address, contact, total_beds, status, facilities, operating_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        hospitalId,
        name,
        city,
        address,
        contact,
        totalBeds,
        status || 'Active',
        JSON.stringify(facilities || []),
        operatingHours || '24/7 Fully Operational'
      ]
    );

    // Seed departments if any
    if (departments && Array.isArray(departments) && departments.length > 0) {
      const avgBedCount = Math.floor(totalBeds / departments.length);
      for (const deptName of departments) {
        const deptId = randomUUID();
        await connection.query(
          'INSERT INTO departments (id, hospital_id, name, bed_count) VALUES (?, ?, ?, ?)',
          [deptId, hospitalId, deptName, avgBedCount]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Hospital branch registered successfully.',
      hospital: {
        id: hospitalId,
        name,
        city,
        address,
        contact,
        totalBeds,
        status,
        facilities,
        operatingHours
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating hospital:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  } finally {
    connection.release();
  }
};

// 4. Update hospital profile
export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, address, contact, totalBeds, status, facilities, operatingHours } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (!isSuperAdmin && req.user.hospitalId !== id) {
      return res.status(403).json({ message: 'Access denied. You can only manage your own hospital branch.' });
    }

    const [existing] = await pool.query('SELECT id FROM hospitals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Hospital branch not found.' });
    }

    // Build dynamic UPDATE query
    let fields = [];
    let params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (city !== undefined) { fields.push('city = ?'); params.push(city); }
    if (address !== undefined) { fields.push('address = ?'); params.push(address); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (totalBeds !== undefined) { fields.push('total_beds = ?'); params.push(totalBeds); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (facilities !== undefined) { fields.push('facilities = ?'); params.push(JSON.stringify(facilities)); }
    if (operatingHours !== undefined) { fields.push('operating_hours = ?'); params.push(operatingHours); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }

    params.push(id);
    await pool.query(`UPDATE hospitals SET ${fields.join(', ')} WHERE id = ?`, params);

    return res.json({ message: 'Hospital profile updated successfully.' });
  } catch (error) {
    console.error('Error updating hospital:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 5. Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Access denied. Only Super Admin can delete hospital branches.' });
    }

    const [existing] = await pool.query('SELECT id FROM hospitals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Hospital branch not found.' });
    }

    await pool.query('DELETE FROM hospitals WHERE id = ?', [id]);

    return res.json({ message: 'Hospital branch deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 6. Get departments for a hospital
export const getDepartments = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied. You do not have permissions for this branch.' });
    }

    const [rows] = await pool.query(`
      SELECT d.*, 
             (SELECT COUNT(*) FROM beds b WHERE b.department_id = d.id) AS dynamic_bed_count
      FROM departments d 
      WHERE d.hospital_id = ?
    `, [hospitalId]);
    
    // Map to camelCase to match frontend's Department interface
    const departments = rows.map(row => ({
      id: row.id,
      hospitalId: row.hospital_id,
      name: row.name,
      headOfDepartment: row.head_of_department,
      staffCount: row.staff_count,
      bedCount: row.dynamic_bed_count,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 7. Create a department
export const createDepartment = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { name, headOfDepartment, staffCount, bedCount } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';

    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied. You cannot manage this branch.' });
    }

    if (!name || !headOfDepartment) {
      return res.status(400).json({ message: 'Department name and head of department are required.' });
    }

    const deptId = randomUUID();

    await pool.query(
      'INSERT INTO departments (id, hospital_id, name, head_of_department, staff_count, bed_count) VALUES (?, ?, ?, ?, ?, ?)',
      [deptId, hospitalId, name, headOfDepartment, staffCount || 0, bedCount || 0]
    );

    return res.status(201).json({
      message: 'Department created successfully.',
      department: {
        id: deptId,
        hospitalId,
        name,
        headOfDepartment,
        staffCount: staffCount || 0,
        bedCount: bedCount || 0,
        status: 'Active'
      }
    });
  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 8. Update a department
export const updateDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { name, headOfDepartment, staffCount, bedCount, status } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';

    // Verify department exists and get its hospital_id
    const [existing] = await pool.query('SELECT hospital_id, name FROM departments WHERE id = ?', [deptId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const hospitalId = existing[0].hospital_id;
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied. You cannot manage this branch.' });
    }

    // Build dynamic UPDATE query
    let fields = [];
    let params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (headOfDepartment !== undefined) { fields.push('head_of_department = ?'); params.push(headOfDepartment); }
    if (staffCount !== undefined) { fields.push('staff_count = ?'); params.push(staffCount); }
    if (bedCount !== undefined) { fields.push('bed_count = ?'); params.push(bedCount); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }

    params.push(deptId);
    await pool.query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, params);

    return res.json({ message: 'Department updated successfully.' });
  } catch (error) {
    console.error('Error updating department:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 9. Delete a department
export const deleteDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';

    const [existing] = await pool.query('SELECT hospital_id FROM departments WHERE id = ?', [deptId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const hospitalId = existing[0].hospital_id;
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [deptId]);

    return res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 10. Get all beds of a hospital branch
export const getBeds = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const [beds] = await pool.query('SELECT * FROM beds WHERE hospital_id = ?', [hospitalId]);
    
    const formatted = beds.map(b => ({
      id: b.id,
      hospitalId: b.hospital_id,
      departmentId: b.department_id,
      wardName: b.ward_name,
      category: b.category,
      status: b.status,
      notes: b.notes,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));
    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching beds:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 11. Create a new bed in a hospital branch
export const createBed = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { departmentId, wardName, category, status, notes } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!departmentId || !wardName) {
      return res.status(400).json({ message: 'Department and ward name are required.' });
    }

    // Generate unique bed ID (e.g. B-XXXX)
    const id = `B-${Math.floor(1000 + Math.random() * 9000)}`;

    await pool.query(
      'INSERT INTO beds (id, hospital_id, department_id, ward_name, category, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, hospitalId, departmentId, wardName, category || 'General', status || 'Available', notes || '']
    );

    return res.status(201).json({
      message: 'Bed created successfully.',
      bed: {
        id,
        hospitalId,
        departmentId,
        wardName,
        category: category || 'General',
        status: status || 'Available',
        notes: notes || ''
      }
    });
  } catch (error) {
    console.error('Error creating bed:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 12. Update an existing bed
export const updateBed = async (req, res) => {
  try {
    const { hospitalId, bedId } = req.params;
    const { departmentId, wardName, category, status, notes } = req.body;
    const isSuperAdmin = req.user.role === 'Super Admin';
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Build dynamic UPDATE query
    let fields = [];
    let params = [];

    if (departmentId !== undefined) { fields.push('department_id = ?'); params.push(departmentId); }
    if (wardName !== undefined) { fields.push('ward_name = ?'); params.push(wardName); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (notes !== undefined) { fields.push('notes = ?'); params.push(notes); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    params.push(bedId);
    params.push(hospitalId);

    const [result] = await pool.query(
      `UPDATE beds SET ${fields.join(', ')} WHERE id = ? AND hospital_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bed not found in this branch.' });
    }

    return res.json({ message: 'Bed updated successfully.' });
  } catch (error) {
    console.error('Error updating bed:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 13. Delete a bed
export const deleteBed = async (req, res) => {
  try {
    const { hospitalId, bedId } = req.params;
    const isSuperAdmin = req.user.role === 'Super Admin';
    if (!isSuperAdmin && req.user.hospitalId !== hospitalId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [result] = await pool.query('DELETE FROM beds WHERE id = ? AND hospital_id = ?', [bedId, hospitalId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bed not found.' });
    }

    return res.json({ message: 'Bed deleted successfully.' });
  } catch (error) {
    console.error('Error deleting bed:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
