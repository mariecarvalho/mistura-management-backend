import { PoolClient } from 'pg';
import { MemberInput } from '../types/family';

export const createMember = async (client: PoolClient, familyId: string, member: MemberInput) => {
  await client.query(
    `INSERT INTO member
      (family_id, name, birth_date, gender, relationship)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      familyId,
      member.name,
      member.birth_date || null,
      member.gender,
      member.relationship,
    ]
  );
};

export const getMembersByFamilyId = async (client: PoolClient, familyId: string) => {
  const res = await client.query('SELECT * FROM member WHERE family_id = $1', [familyId]);
  return res.rows;
};

export const getMembersById = async (client: PoolClient, id: string) => {
  const res = await client.query('SELECT * FROM member WHERE id = $1', [id]);
  return res.rows;
};

export const deleteMemberById = async (client: PoolClient, id: string): Promise<number | null> => {
  const result = await client.query('DELETE FROM member WHERE id = $1', [id]);
  return result.rowCount;
};
