import { PoolClient } from 'pg';
import { ActionInput, ActionOutput } from '../types/action';

export const createAction = async (client: PoolClient, action: ActionInput): Promise<ActionOutput> => {
  const query = `
    INSERT INTO action 
      (title, description, date, type, status, volunteer_count, families_served, dish_of_the_day, action_cost)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    action.title,
    action.description,
    action.date,
    action.type,
    action.status,
    action.volunteer_count,
    action.families_served,
    action.dishOfTheDay,
    action.actionCost,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};

export const getActionById = async (client: PoolClient, id: string): Promise<ActionOutput | null> => {
  const result = await client.query('SELECT * FROM action WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getAllActions = async (client: PoolClient): Promise<ActionOutput[]> => {
  const result = await client.query('SELECT * FROM action ORDER BY date DESC');
  return result.rows;
};

export const updateAction = async (client: PoolClient, id: string, action: ActionInput): Promise<ActionOutput | null> => {
  const query = `
    UPDATE action SET
      title = $1,
      description = $2,
      date = $3,
      type = $4,
      status = $5,
      volunteer_count = $6,
      families_served = $7,
      dish_of_the_day = $8,
      action_cost = $9
    WHERE id = $10
    RETURNING *;
  `;

  const values = [
    action.title,
    action.description,
    action.date,
    action.type,
    action.status,
    action.volunteer_count,
    action.families_served,
    action.dishOfTheDay,
    action.actionCost,
    id,
  ];

  const result = await client.query(query, values);
  return result.rows[0] || null;
};

export const deleteActionById = async (client: PoolClient, id: string): Promise<number | null> => {
  const result = await client.query('DELETE FROM action WHERE id = $1', [id]);
  return result.rowCount;
};
