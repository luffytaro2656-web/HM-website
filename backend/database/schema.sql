-- 1. Create the hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    contact VARCHAR(50) NOT NULL,
    total_beds INT NOT NULL DEFAULT 150,
    occupied_beds INT NOT NULL DEFAULT 0,
    total_doctors INT NOT NULL DEFAULT 0,
    total_patients INT NOT NULL DEFAULT 0,
    revenue_this_month DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    facilities JSON NULL,
    operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7 Fully Operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create the departments table (one-to-many relationship with hospitals)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    head_of_department VARCHAR(100) NOT NULL DEFAULT 'TBD',
    staff_count INT NOT NULL DEFAULT 0,
    bed_count INT NOT NULL DEFAULT 0,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- 3. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM(
        'Super Admin',
        'Hospital Admin',
        'Hospital Manager',
        'Doctor',
        'Nurse',
        'Receptionist',
        'Billing Executive',
        'Pharmacy Staff',
        'Lab Technician',
        'Patient'
    ) NOT NULL,
    hospital_id VARCHAR(50) NULL,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

-- 4. Create the invalidated_tokens table for JWT blacklist (logout / revocation support)
CREATE TABLE IF NOT EXISTS invalidated_tokens (
    jti VARCHAR(255) PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create the role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY unique_role_module_action (role, module, action)
);

-- 6. Create the beds table
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    category ENUM('General', 'ICU', 'Private') NOT NULL DEFAULT 'General',
    status ENUM('Available', 'Occupied', 'Maintenance') NOT NULL DEFAULT 'Available',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

