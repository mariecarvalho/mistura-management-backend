import pool from '../config/database';

export const getAllDonations = async () => {
  const result = await pool.query('SELECT * FROM donation ORDER BY date DESC');
  return result.rows;
};

export const getDonationById = async (id: string) => {
  const result = await pool.query('SELECT * FROM donation WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createDonation = async (data: any) => {
  const result = await pool.query(
    `INSERT INTO donation (type, amount, description, date, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.type, data.amount, data.description, data.date, data.status ?? 'Recebido']
  );
  return result.rows[0];
};

export const updateDonation = async (id: string, data: any) => {
  const result = await pool.query(
    `UPDATE donation SET
       type        = COALESCE($1, type),
       amount      = COALESCE($2, amount),
       description = COALESCE($3, description),
       date        = COALESCE($4, date),
       status      = COALESCE($5, status),
       updated_at  = NOW()
     WHERE id = $6 RETURNING *`,
    [data.type, data.amount, data.description, data.date, data.status, id]
  );
  return result.rows[0] || null;
};

export const deleteDonation = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM donation WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
};

export const getDonationTotals = async () => {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status = 'Recebido'), 0) AS total_received,
      COALESCE(SUM(amount) FILTER (WHERE status = 'Pendente'),  0) AS total_pending,
      COUNT(*)                                                      AS total_count
    FROM donation
  `);
  return result.rows[0];
};
