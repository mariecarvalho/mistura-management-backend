import pool from '../config/database';

// ─── Toggle status ────────────────────────────────────────────
export const toggleFamilyStatus = async (id: string) => {
  const result = await pool.query(
    `UPDATE family
     SET benefit_status = CASE WHEN benefit_status = 'Ativo' THEN 'Inativo' ELSE 'Ativo' END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, representative_name, benefit_status`,
    [id]
  );
  return result.rows[0] || null;
};

// ─── Presença ─────────────────────────────────────────────────

export const markPresence = async (
  familyId: string,
  actionId: string,
  date: string,
  mealsTaken?: number
) => {
  // If mealsTaken not provided, default to the family's people_count
  const mealsValue = mealsTaken !== undefined
    ? mealsTaken
    : (await pool.query('SELECT people_count FROM family WHERE id = $1', [familyId])).rows[0]?.people_count ?? 0;

  const result = await pool.query(
    `INSERT INTO family_presence (family_id, action_id, date, meals_taken)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (family_id, action_id)
     DO UPDATE SET date = EXCLUDED.date, meals_taken = EXCLUDED.meals_taken
     RETURNING *`,
    [familyId, actionId, date, mealsValue]
  );
  return result.rows[0];
};

export const unmarkPresence = async (familyId: string, actionId: string) => {
  await pool.query(
    'DELETE FROM family_presence WHERE family_id = $1 AND action_id = $2',
    [familyId, actionId]
  );
};

// Lista todas as famílias para uma ação, com flag present e meals_taken
export const getPresenceByAction = async (actionId: string) => {
  const result = await pool.query(
    `SELECT
       f.id,
       f.representative_name,
       f.benefit_status,
       f.people_count,
       CASE WHEN fp.id IS NOT NULL THEN true ELSE false END AS present,
       COALESCE(fp.meals_taken, f.people_count)             AS meals_taken
     FROM family f
     LEFT JOIN family_presence fp ON fp.family_id = f.id AND fp.action_id = $1
     ORDER BY f.representative_name ASC`,
    [actionId]
  );
  return result.rows;
};

// Totais realizados de uma ação (calculados das presenças)
export const getActionPresenceSummary = async (actionId: string) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)            AS families_present,
       SUM(meals_taken)    AS meals_realized
     FROM family_presence
     WHERE action_id = $1`,
    [actionId]
  );
  return {
    families_present: Number(result.rows[0].families_present),
    meals_realized:   Number(result.rows[0].meals_realized ?? 0),
  };
};

export const getPresenceByFamily = async (familyId: string) => {
  const result = await pool.query(
    `SELECT
       fp.id,
       fp.date,
       fp.meals_taken,
       fp.action_id,
       a.title AS action_title,
       a.date  AS action_date
     FROM family_presence fp
     JOIN action a ON a.id = fp.action_id
     WHERE fp.family_id = $1
     ORDER BY a.date DESC`,
    [familyId]
  );
  return result.rows;
};

// Famílias sem aparecer nas últimas N ações concluídas
export const getAbsentFamilies = async (lastN: number = 3) => {
  const result = await pool.query(
    `WITH last_actions AS (
       SELECT id FROM action
       WHERE status = 'completed'
       ORDER BY date DESC
       LIMIT $1
     ),
     action_count AS (SELECT COUNT(*) AS total FROM last_actions),
     family_attendance AS (
       SELECT fp.family_id, COUNT(*) AS attended
       FROM family_presence fp
       WHERE fp.action_id IN (SELECT id FROM last_actions)
       GROUP BY fp.family_id
     )
     SELECT
       f.id,
       f.representative_name,
       f.benefit_status,
       COALESCE(fa.attended, 0)::int AS attended,
       ac.total::int                 AS out_of,
       (ac.total - COALESCE(fa.attended, 0))::int AS missed
     FROM family f
     CROSS JOIN action_count ac
     LEFT JOIN family_attendance fa ON fa.family_id = f.id
     WHERE f.benefit_status = 'Ativo'
       AND COALESCE(fa.attended, 0) = 0
       AND ac.total >= $1
     ORDER BY f.representative_name ASC`,
    [lastN]
  );
  return result.rows;
};

// Estatísticas de presença de uma família (últimas 10 ações)
export const getFamilyPresenceStats = async (familyId: string) => {
  const result = await pool.query(
    `WITH last_actions AS (
       SELECT id FROM action WHERE status = 'completed' ORDER BY date DESC LIMIT 10
     )
     SELECT
       COUNT(la.id)                                                   AS total_actions,
       COUNT(fp.id)                                                   AS attended,
       COUNT(la.id) - COUNT(fp.id)                                    AS missed,
       ROUND(COUNT(fp.id)::numeric / NULLIF(COUNT(la.id),0) * 100)   AS attendance_pct,
       COALESCE(SUM(fp.meals_taken), 0)                               AS total_meals_taken,
       MAX(a.date)                                                    AS last_presence
     FROM last_actions la
     JOIN action a ON a.id = la.id
     LEFT JOIN family_presence fp ON fp.action_id = la.id AND fp.family_id = $1`,
    [familyId]
  );
  return result.rows[0];
};
