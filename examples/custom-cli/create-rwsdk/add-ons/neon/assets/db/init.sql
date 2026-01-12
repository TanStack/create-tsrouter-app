-- Schema for a simple to-do list
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data for the to-do list
INSERT INTO todos (title, description, is_completed) VALUES
('Buy groceries', 'Milk, Bread, Eggs, and Butter', FALSE),
('Read a book', 'Finish reading "The Great Gatsby"', FALSE),
('Workout', 'Go for a 30-minute run', FALSE);
