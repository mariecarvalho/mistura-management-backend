import { PoolClient } from 'pg';
import { ContactInput } from '../types/family';

export const getContactById = async (client: PoolClient, contactId: string) => {
  const result = await client.query(
    'SELECT * FROM family_contact WHERE id = $1',
    [contactId]
  );
  return result.rows[0];
};

export const updateContactById = async (
  client: PoolClient,
  contactId: string,
  contact: ContactInput
) => {
  await client.query(
    `UPDATE family_contact SET
      contact_type = $1,
      contact_value = $2,
      contact_note = $3
     WHERE id = $4`,
    [
      contact.contact_type,
      contact.contact_value,
      contact.contact_note,
      contactId
    ]
  );
};
