import * as FamiliesModel from '../models/families';
import * as AddressModel from '../models/address';
import * as ContactModel from '../models/familyContact';
import * as ChildModel from '../models/child';
import pool from '../config/database';
import { PoolClient } from 'pg';
import { AddressInput, ChildInput, Family, FamilyInput } from '../types/family';
import { getAddressByFamilyId, updateAddress } from './address';
import { getContactById, updateContactById } from './contact';
import { getChildById, updateChild } from './child';
import { FamilyOutput, ChildOutput } from '../types/family';

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
            'name', ch.name,
            'birth_date', ch.birth_date,
            'gender', ch.gender,
            'relationship', ch.relationship
          )
        ) AS children

      FROM family f
      LEFT JOIN family_address a ON f.id = a.family_id
      LEFT JOIN family_contact c ON f.id = c.family_id
      LEFT JOIN child ch ON f.id = ch.family_id

      GROUP BY 
        f.id, a.street, a.number, a.complement, a.district, a.city, a.state, a.postal_code,
        c.contact_type, c.contact_value, c.contact_note
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
    await createFamilyChildrenIfNeeded(client, family.id, familyData);

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

const createFamilyChildrenIfNeeded = async (client: PoolClient, familyId: string, familyData: FamilyInput) => {
  if (familyData.children && Array.isArray(familyData.children)) {
    for (const child of familyData.children) {
      await ChildModel.createChild(client, familyId, child);
    }
  }
};

export const updateFamily = async (id: string, familyData: any) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Atualiza dados principais da família
    await FamiliesModel.updateFamily(client, id, familyData);

    // Atualiza ou cria endereço
    if (familyData.address) {
      await upsertAddressByFamilyId(client, id, familyData.address);
    }

    // Atualiza ou cria contatos
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

    // Atualiza ou cria crianças
    if (Array.isArray(familyData.children)) {
      for (const child of familyData.children) {
        if (child.id) {
          const existing = await getChildById(client, child.id);
          if (existing) {
            await updateChild(client, child.id, child);
            continue;
          }
        }

        await ChildModel.createChild(client, id, child);
      }
    }

    await client.query('COMMIT');

    // Retorna família atualizada (pode usar getFamilyById se quiser)
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

    const children: ChildOutput[] = (row.children ?? []).map((child: any) => ({
      name: child.name,
      birth_date: child.birth_date,
      gender: child.gender,
      relationship: child.relationship,
      status: child.status ?? 'Ativo',
      age: child.age ?? undefined,
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
      children,

      // compatibilidade com UI
      street: row.street,
      contact_value: contacts?.[0]?.contact_value ?? '',
      contact_note: contacts?.[0]?.contact_note ?? '',

      created_at: row.created_at ?? undefined,
      updated_at: row.updated_at ?? undefined,
    };
  });
}
