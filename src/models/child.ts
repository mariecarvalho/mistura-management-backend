import { PoolClient } from 'pg';
import { ChildInput } from '../types/family';

export const createChild = async (client: PoolClient, familyId: string, child: ChildInput) => {
  await client.query(
    `INSERT INTO child
      (family_id, name, birth_date, gender, relationship)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      familyId,
      child.name,
      child.birth_date,
      child.gender,
      child.relationship
    ]
  );
};

export const getChildrenByFamilyId = async (client: PoolClient, familyId: string) => {
  const res = await client.query('SELECT * FROM child WHERE family_id = $1', [familyId]);
  return res.rows;
};

export const getChildrenById = async (client: PoolClient, id: string) => {
  const res = await client.query('SELECT * FROM child WHERE id = $1', [id]);
  return res.rows;
};

export const deleteChildById = async (client: PoolClient, id: string): Promise<number | null> => {
  const result = await client.query(
    'DELETE FROM child WHERE id = $1',
    [id]
  );
  return result.rowCount;
};