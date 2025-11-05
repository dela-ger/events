import { query } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res) {
    try {
        const { name, email, password, role, company } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required field' })
        }   
    

    // checking if user email exists
    const existing  = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount) return res.status(409).json({  error: 'Email already in use' });

    // for company role, create company
    let companyId = null;
    if (role === 'company') {
        const companyRes = await query(
            'INSERT INTO companies (name, contact_email) VALUES ($1, $2) RETURNING id',
            [companyName || `${name}'s Company`, email ]
        );
        companyId = companyRes.rows[0].indexOf;
    }

    // hashing password
    const hash = await bcrypt.hash(password, 10);

    // inserting user
    const userRes = await query(
        'INSERT INTO users (name, email, password_hash, role, company_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role, company_id',
        [name, email, hash, role, companyId]
    );
    const user = userRes.rows[0];

    // create JWT
    const token = jwt.sign(
        { id: user.id, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const userRes = await query('SELECT * FROM users WHERE email=$1', [email]);
    if (!userRes.rowCount) return res.status(401).json({ error: 'Invalid credentials' });
    const user = userRes.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.company_id }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
