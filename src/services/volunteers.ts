import pool from '../config/database';

export const getAllVolunteers = async () => {
  const result = await pool.query('SELECT * FROM volunteer ORDER BY name ASC');
  return result.rows;
};

export const getVolunteerById = async (id: string) => {
  const result = await pool.query('SELECT * FROM volunteer WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createVolunteer = async (data: any) => {
  const result = await pool.query(
    `INSERT INTO volunteer (name, email, phone, skills, availability, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.name, data.email, data.phone, data.skills, data.availability, data.isActive ?? true]
  );
  return result.rows[0];
};

export const updateVolunteer = async (id: string, data: any) => {
  const result = await pool.query(
    `UPDATE volunteer SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       phone = COALESCE($3, phone),
       skills = COALESCE($4, skills),
       availability = COALESCE($5, availability),
       is_active = COALESCE($6, is_active),
       updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [data.name, data.email, data.phone, data.skills, data.availability, data.isActive, id]
  );
  return result.rows[0] || null;
};

export const deleteVolunteer = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM volunteer WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
};
