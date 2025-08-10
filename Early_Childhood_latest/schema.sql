-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'parent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Templates Table 
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,  
    created_by INT,        
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Reports Table 
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL, 
    template_id INT NOT NULL, 
    content TEXT NOT NULL,   
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- 4. Feedback Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL, 
    teacher_id INT NOT NULL, 
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Insert Users
INSERT INTO users (name, email, password, role) VALUES
('Alice Smith', 'alice.smith@test.com', 'abc12', 'student'),
('Ben Johnson', 'ben.johnson@test.com', 'abc12', 'student'),
('Chloe Lee', 'chloe.lee@test.com', 'abc12', 'student'),
('David Wright', 'david.wright@test.com', 'abc12', 'student'),
('Emily Turner', 'emily.turner@test.com', 'abc12', 'student');

-- Insert Template
INSERT INTO templates (title, content, created_by) VALUES
('Observation Template 1', 'Template Content Here...', 2);

-- Student submits Report
INSERT INTO reports (student_id, template_id, content) VALUES
(1, 1, 'Today we observed children playing...');

-- Teacher gives Feedback
INSERT INTO feedbacks (report_id, teacher_id, comment) VALUES
(1, 2, 'Great observation! Try to add more about the learning outcome.');


