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
