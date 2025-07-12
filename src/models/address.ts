import { PoolClient } from 'pg';
import { AddressInput } from '../types/family';

export const createAddress = async (client: PoolClient, familyId: string, address: AddressInput) => {
  await client.query(
    `INSERT INTO family_address
      (family_id, street, number, complement, district, city, state, postal_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      familyId,
      address.street,
      address.number,
      address.complement,
      address.district,
      address.city,
      address.state,
      address.postal_code
    ]
  );
};
