import pool from '../config/database';
import { PoolClient } from 'pg';
import { Family, FamilyOutput } from '../types/family';

export const getAllFamilies = async (): Promise<FamilyOutput[]> => {
  const result = await pool.query('SELECT * FROM family ORDER BY id DESC');
  return result.rows;
};

export const getFamilyById = async (id: string): Promise<FamilyOutput | null> => {
  const result = await pool.query('SELECT * FROM family WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createFamily = async (client: PoolClient, familyData: Partial<Family>): Promise<Family> => {
  const last_presence_date = new Date();
  const {
    representative_name,
    representative_birth_date,
    representative_gender,
    people_count,
    children_count,
    current_benefit,
    benefit_status,
    presence_status,
    is_single_mother,
  } = familyData;

  const result = await client.query(
    `INSERT INTO family
      (representative_name, representative_birth_date, representative_gender, people_count, children_count, current_benefit, benefit_status, last_presence_date, presence_status, is_single_mother)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      representative_name,
      representative_birth_date,
      representative_gender,
      people_count,
      children_count,
      current_benefit,
      benefit_status,
      last_presence_date,
      presence_status,
      is_single_mother ?? (representative_gender === 'Feminino' && (children_count ?? 0) >= 1),
    ]
  );

  return result.rows[0];
};


export const updateFamily = async (
  client: PoolClient,
  id: string,
  familyData: Partial<Family>
): Promise<Family | null> => {
  const {
    representative_name,
    representative_birth_date,
    representative_gender,
    people_count,
    children_count,
    current_benefit,
    benefit_status,
    last_presence_date,
    presence_status,
    is_single_mother,
  } = familyData;

  // is_single_mother é booleano — não usa COALESCE (false seria ignorado)
  // passa o valor diretamente; se undefined, usa expressão condicional
  const singleMotherVal = is_single_mother !== undefined
    ? is_single_mother
    : null; // null → UPDATE ignora via CASE abaixo

  const result = await client.query(
    `UPDATE family SET
      representative_name = COALESCE($1, representative_name),
      representative_birth_date = COALESCE($2, representative_birth_date),
      representative_gender = COALESCE($3, representative_gender),
      people_count = COALESCE($4, people_count),
      children_count = COALESCE($5, children_count),
      current_benefit = COALESCE($6, current_benefit),
      benefit_status = COALESCE($7, benefit_status),
      last_presence_date = COALESCE($8, last_presence_date),
      presence_status = COALESCE($9, presence_status),
      is_single_mother = CASE WHEN $10::boolean IS NOT NULL THEN $10::boolean ELSE is_single_mother END,
      updated_at = NOW()
    WHERE id = $11
    RETURNING *`,
    [
      representative_name,
      representative_birth_date,
      representative_gender,
      people_count,
      children_count,
      current_benefit,
      benefit_status,
      last_presence_date,
      presence_status,
      singleMotherVal,
      id,
    ]
  );

  return result.rows[0] || null;
};

export const deleteFamily = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM family WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
};
