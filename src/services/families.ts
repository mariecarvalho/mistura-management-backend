import * as FamiliesModel from '../models/families';
import * as AddressModel from '../models/address';
import * as ContactModel from '../models/familyContact';
import * as MemberModel from '../models/member';
import pool from '../config/database';
import { PoolClient } from 'pg';
import { AddressInput, FamilyInput } from '../types/family';
import { getAddressByFamilyId, updateAddress } from './address';
import { getContactById, updateContactById } from './contact';
import { createMember, updateMember } from './member';
import { FamilyOutput, MemberOutput } from '../types/family';

export const getFamilyById = async (id: string) => {
  return FamiliesModel.getFamilyById(id);
};

export const getAllFamilies = async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        f.id AS id,
        f.representative_name,
        f.representative_birth_date,
        f.representative_gender,
        f.people_count,
        f.children_count,
        f.current_benefit,
        f.benefit_status,
        f.last_presence_date,
        f.presence_status,
        f.has_elderly,
        f.is_single_mother,

        a.street,
        a.number,
        a.complement,
        a.district,
        a.city,
        a.state,
        a.postal_code,

        c.contact_type,
        c.contact_value,
        c.contact_note,

        json_agg(
          json_build_object(
            'id', ch.id,
            'name', ch.name,
            'birth_date', ch.birth_date,
            'gender', ch.gender,
            'relationship', ch.relationship,
            'is_minor', ch.is_minor
          )
        ) AS members

      FROM family f
      LEFT JOIN family_address a ON f.id = a.family_id
      LEFT JOIN family_contact c ON f.id = c.family_id
      LEFT JOIN member ch ON f.id = ch.family_id

      GROUP BY
        f.id, f.has_elderly, f.is_single_mother, a.street, a.number, a.complement, a.district, a.city, a.state, a.postal_code,
        c.contact_type, c.contact_value, c.contact_note
      ORDER BY f.representative_name ASC
    `;

    const result = await client.query(query);

    return mapRowToFamily(result.rows);
  } finally {
    client.release();
  }
};

export const createFamily = async (familyData: any) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const family = await createFamilyRecord(client, familyData);

    await createFamilyAddressIfNeeded(client, family.id, familyData);
    await createFamilyContactsIfNeeded(client, family.id, familyData);
    await createFamilyMembersIfNeeded(client, family.id, familyData);

    await client.query('COMMIT');

    return family;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


const createFamilyRecord = async (client: PoolClient, familyData: FamilyInput) => {
  return FamiliesModel.createFamily(client, familyData);
};

const createFamilyAddressIfNeeded = async (client: PoolClient, familyId: string, familyData: FamilyInput) => {
  if (familyData.address) {
    await AddressModel.createAddress(client, familyId, familyData.address);
  }
};

const createFamilyContactsIfNeeded = async (client: PoolClient, familyId: string, familyData: FamilyInput) => {
  if (familyData.contacts && Array.isArray(familyData.contacts)) {
    for (const contact of familyData.contacts) {
      await ContactModel.createContact(client, familyId, contact);
    }
  }
};

const createFamilyMembersIfNeeded = async (client: PoolClient, familyId: string, familyData: FamilyInput) => {
  if (familyData.children && Array.isArray(familyData.children)) {
    for (const member of familyData.children) {
      await MemberModel.createMember(client, familyId, member);
    }
  }
};

export const updateFamily = async (id: string, familyData: any) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await FamiliesModel.updateFamily(client, id, familyData);

    if (familyData.address) {
      await upsertAddressByFamilyId(client, id, familyData.address);
    }

    if (Array.isArray(familyData.contacts)) {
      for (const contact of familyData.contacts) {
        if (contact.id) {
          const existing = await getContactById(client, contact.id);
          if (existing) {
            await updateContactById(client, contact.id, contact);
            continue;
          }
        }

        await ContactModel.createContact(client, id, contact);
      }
    }

    if (Array.isArray(familyData.children)) {
      const existingMembers = await MemberModel.getMembersByFamilyId(client, id);
      for (const memberData of familyData.children) {
        const exists = existingMembers.find((m: any) => m.id == memberData.id);
        if (exists) {
          await updateMember(client, memberData.id, memberData);
        } else {
          await createMember(client, { ...memberData, family_id: id });
        }
      }
    }

    await client.query('COMMIT');

    return await FamiliesModel.getFamilyById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const upsertAddressByFamilyId = async (
  client: PoolClient,
  familyId: string,
  address: AddressInput
) => {
  const existing = await getAddressByFamilyId(client, familyId);

  if (existing) {
    await updateAddress(client, familyId, address);
  } else {
    await AddressModel.createAddress(client, familyId, address);
  }
};


export const deleteFamily = async (id: string) => {
  return FamiliesModel.deleteFamily(id);
};


export function mapRowToFamily(rows: any[]): FamilyOutput[] {
  return rows.map((row) => {
    const contacts = row.contacts?.filter(
      (c: any) => c.contact_type && c.contact_value
    ) ?? [];

    const calcAge = (bd: string | null): number | undefined => {
      if (!bd || bd === '1900-01-01') return undefined;
      const birth = new Date(bd);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const members: MemberOutput[] = ((row.members ?? []) as any[])
      .filter((m: any) => m && m.name)
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        birth_date: m.birth_date,
        gender: m.gender,
        relationship: m.relationship,
        is_minor: m.is_minor ?? false,
        age: calcAge(m.birth_date),
      }));

    return {
      id: row.id,
      representative_name: row.representative_name,
      representative_birth_date: row.representative_birth_date,
      representative_gender: row.representative_gender,
      people_count: row.people_count,
      children_count: row.children_count,
      current_benefit: row.current_benefit,
      benefit_status: row.benefit_status,
      last_presence_date: row.last_presence_date,
      presence_status: row.presence_status,

      address: {
        street: row.street,
        number: row.number,
        complement: row.complement,
        district: row.district,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
      },

      contacts,
      members,
      has_elderly:      row.has_elderly      ?? false,
      is_single_mother: row.is_single_mother ?? false,

      street: row.street,
      contact_value: contacts?.[0]?.contact_value ?? '',
      contact_note: contacts?.[0]?.contact_note ?? '',

      created_at: row.created_at ?? undefined,
      updated_at: row.updated_at ?? undefined,
    };
  });
}
