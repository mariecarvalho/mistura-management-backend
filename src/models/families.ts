import pool from '../config/database';
import { PoolClient } from 'pg';
import { Family } from '../types/family';

export const getAllFamilies = async (): Promise<Family[]> => {
  const result = await pool.query('SELECT * FROM family ORDER BY id DESC');
  return result.rows;
};

export const getFamilyById = async (id: number): Promise<Family | null> => {
  const result = await pool.query('SELECT * FROM family WHERE id = $1', [id]);
  return result.rows[0] || null;
};

// Aqui o ajuste: agora recebe client!
export const createFamily = async (client: PoolClient, familyData: Partial<Family>): Promise<Family> => {
  const {
    representative_name,
    people_count,
    children_count,
    current_benefit,
    benefit_status,
    last_presence_date,
    presence_status
  } = familyData;

  const result = await client.query(
    `INSERT INTO family
      (representative_name, people_count, children_count, current_benefit, benefit_status, last_presence_date, presence_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      representative_name,
      people_count,
      children_count,
      current_benefit,
      benefit_status,
      last_presence_date,
      presence_status
    ]
  );

  return result.rows[0];
};

export const updateFamily = async (id: number, familyData: Partial<Family>): Promise<Family | null> => {
  const {
    representative_name,
    people_count,
    children_count,
    current_benefit,
    benefit_status,
    last_presence_date,
    presence_status
  } = familyData;

  const result = await pool.query(
    `UPDATE family SET
      representative_name = $1,
      people_count = $2,
      children_count = $3,
      current_benefit = $4,
      benefit_status = $5,
      last_presence_date = $6,
      presence_status = $7,
      updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      representative_name,
      people_count,
      children_count,
      current_benefit,
      benefit_status,
      last_presence_date,
      presence_status,
      id
    ]
  );

  return result.rows[0] || null;
};

export const deleteFamily = async (id: number) => {
  const result = await pool.query('DELETE FROM family WHERE id = $1', [id]);
  return result;
};