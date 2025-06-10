import { PoolClient } from 'pg';
import { ChildInput } from '../types/family';

export const createChild = async (client: PoolClient, familyId: number, child: ChildInput) => {
  await client.query(
    `INSERT INTO child
      (family_id, name, birth_date, relationship)
     VALUES ($1, $2, $3, $4)`,
    [
      familyId,
      child.name,
      child.birth_date,
      child.relationship
    ]
  );
};
