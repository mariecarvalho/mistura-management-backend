import { PoolClient } from 'pg';
import { AddressInput } from '../types/family';

export const getAddressByFamilyId = async (client: PoolClient, familyId: string) => {
  const result = await client.query(
    'SELECT * FROM family_address WHERE family_id = $1',
    [familyId]
  );
  return result.rows[0];
};

export const updateAddress = async (client: PoolClient, familyId: string, address: AddressInput) => {
  await client.query(
    `UPDATE family_address SET
      street = $1,
      number = $2,
      complement = $3,
      district = $4,
      city = $5,
      state = $6,
      postal_code = $7
     WHERE family_id = $8`,
    [
      address.street,
      address.number,
      address.complement,
      address.district,
      address.city,
      address.state,
      address.postal_code,
      familyId
    ]
  );
};
