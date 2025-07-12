import { PoolClient } from 'pg';
import { ChildInput } from '../types/family';

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
