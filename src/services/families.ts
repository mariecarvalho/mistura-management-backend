import * as FamiliesModel from '../models/families';
import * as AddressModel from '../models/address';
import * as ContactModel from '../models/familyContact';
import * as ChildModel from '../models/child';
import pool from '../config/database';
import { PoolClient } from 'pg';
import { FamilyInput } from '../types/family';

export const getAllFamilies = async () => {
  return FamiliesModel.getAllFamilies();
};

export const getFamilyById = async (id: number) => {
  return FamiliesModel.getFamilyById(id);
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

const createFamilyAddressIfNeeded = async (client: PoolClient, familyId: number, familyData: FamilyInput) => {
  if (familyData.address) {
    await AddressModel.createAddress(client, familyId, familyData.address);
  }
};

const createFamilyContactsIfNeeded = async (client: PoolClient, familyId: number, familyData: FamilyInput) => {
  if (familyData.contacts && Array.isArray(familyData.contacts)) {
    for (const contact of familyData.contacts) {
      await ContactModel.createContact(client, familyId, contact);
    }
  }
};

const createFamilyChildrenIfNeeded = async (client: PoolClient, familyId: number, familyData: FamilyInput) => {
  if (familyData.children && Array.isArray(familyData.children)) {
    for (const child of familyData.children) {
      await ChildModel.createChild(client, familyId, child);
    }
  }
};

export const updateFamily = async (id: number, familyData: any) => {
  return FamiliesModel.updateFamily(id, familyData);
};

export const deleteFamily = async (id: number) => {
  return FamiliesModel.deleteFamily(id);
};
