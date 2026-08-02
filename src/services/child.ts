import { PoolClient } from 'pg';
import { ChildInput } from '../types/family';
import { deleteChildById, getChildrenById } from '../models/child';
import pool from '../config/database';

export const getChildById = async (client: PoolClient, childId: string) => {
  const result = await client.query(
    'SELECT * FROM child WHERE id = $1',
    [childId]
  );
  return result.rows[0];
};

export const updateChild = async (
  client: PoolClient,
  childId: string,
  child: ChildInput
) => {
  await client.query(
    `UPDATE child SET
      name = $1,
      birth_date = $2,
      gender = $3,
      relationship = $4
     WHERE id = $5`,
    [
      child.name,
      child.birth_date,
      child.gender,
      child.relationship,
      childId
    ]
  );
};

export const createChild = async (
  client: PoolClient,
  child: ChildInput & { family_id: string }
) => {
  await client.query(
    `INSERT INTO child (
      name,
      birth_date,
      gender,
      relationship,
      family_id
    ) VALUES ($1, $2, $3, $4, $5)`,
    [
      child.name,
      child.birth_date,
      child.gender,
      child.relationship,
      child.family_id
    ]
  );
};

export const deleteChild = async (id: string): Promise<boolean | null> => {
  const client = await pool.connect();

  try {
    const existing = await getChildrenById(client, id);

    if (existing.length === 0) {
      return false;
    }

    const result = await deleteChildById(client, id);
    return result ? result > 0: null;

  } finally {
    client.release();
  }
};