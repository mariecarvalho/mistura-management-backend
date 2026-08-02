import pool from '../config/database';
import { ActionInput, ActionOutput } from '../types/action';
import * as ActionModel from '../models/actions';

export const createAction = async (actionData: ActionInput): Promise<ActionOutput> => {
  const client = await pool.connect();
  try {
    const action = await ActionModel.createAction(client, actionData);
    return action;
  } finally {
    client.release();
  }
};

export const getActionById = async (id: string): Promise<ActionOutput | null> => {
  const client = await pool.connect();
  try {
    return await ActionModel.getActionById(client, id);
  } finally {
    client.release();
  }
};

export const getAllActions = async (): Promise<ActionOutput[]> => {
  const client = await pool.connect();
  try {
    return await ActionModel.getAllActions(client);
  } finally {
    client.release();
  }
};

export const updateAction = async (id: string, actionData: ActionInput): Promise<ActionOutput | null> => {
  const client = await pool.connect();
  try {
    return await ActionModel.updateAction(client, id, actionData);
  } finally {
    client.release();
  }
};

export const deleteAction = async (id: string): Promise<boolean | null> => {
  const client = await pool.connect();
  try {
    const rowCount = await ActionModel.deleteActionById(client, id);
    return rowCount ? rowCount > 0: null;
  } finally {
    client.release();
  }
};
