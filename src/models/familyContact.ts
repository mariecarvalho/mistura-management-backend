import { PoolClient } from 'pg';
import { ContactInput } from '../types/family';

export const createContact = async (client: PoolClient, familyId: number, contact: ContactInput) => {
  await client.query(
    `INSERT INTO family_contact
      (family_id, contact_type, contact_value, note)
     VALUES ($1, $2, $3, $4)`,
    [
      familyId,
      contact.contact_type,
      contact.contact_value,
      contact.note
    ]
  );
};
