import { PoolClient } from 'pg';
import { MemberInput } from '../types/family';
import { deleteMemberById, getMembersById } from '../models/member';
import pool from '../config/database';

export const getMemberById = async (client: PoolClient, memberId: string) => {
  const result = await client.query('SELECT * FROM member WHERE id = $1', [memberId]);
  return result.rows[0];
};

export const updateMember = async (
  client: PoolClient,
  memberId: string,
  member: MemberInput
) => {
  await client.query(
    `UPDATE member SET
      name = $1,
      birth_date = $2,
      gender = $3,
      relationship = $4
     WHERE id = $5`,
    [
      member.name,
      member.birth_date || null,
      member.gender,
      member.relationship,
      memberId,
    ]
  );
};

export const createMember = async (
  client: PoolClient,
  member: MemberInput & { family_id: string }
) => {
  await client.query(
    `INSERT INTO member (
      name,
      birth_date,
      gender,
      relationship,
      family_id
    ) VALUES ($1, $2, $3, $4, $5)`,
    [
      member.name,
      member.birth_date || null,
      member.gender,
      member.relationship,
      member.family_id,
    ]
  );
};

export const deleteMember = async (id: string): Promise<boolean | null> => {
  const client = await pool.connect();
  try {
    const existing = await getMembersById(client, id);
    if (existing.length === 0) return false;
    const result = await deleteMemberById(client, id);
    return result ? result > 0 : null;
  } finally {
    client.release();
  }
};
