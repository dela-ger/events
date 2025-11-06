import { query } from '../../config/db.js';

export async function createCompany(req, res) {
  const { name, logo_url, description, contact_email } = req.body;

  try {
    const result = await query(
      `INSERT INTO companies (name, logo_url, description, contact_email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, logo_url, description, contact_email]
    );

    console.log('Company created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
}


export async function getCompanies(req, res) {
  try {
    const result = await query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get companies error:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
}

export async function getCompanyById(req, res) {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
}

export async function updateCompany(req, res) {
  const { id } = req.params;
  const { name, logo_url, description, contact_email } = req.body;

  try {
    const result = await query(
      `UPDATE companies
       SET name = $1, logo_url = $2, description = $3, contact_email = $4
       WHERE id = $5
       RETURNING *`,
      [name, logo_url, description, contact_email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
}

export async function deleteCompany(req, res) {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM companies WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted', company: result.rows[0] });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
}