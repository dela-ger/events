CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location TEXT,
    banner_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);