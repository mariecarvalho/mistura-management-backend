export interface Family {
  id: number;
  representative_name: string;
  people_count: number;
  children_count: number;
  current_benefit: string | null;
  benefit_status: string | null;
  last_presence_date: string | null;
  presence_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyInput {
  representative_name: string;
  people_count: number;
  children_count: number;
  current_benefit?: string | null;
  benefit_status?: string | null;
  last_presence_date?: string | null;
  presence_status?: string | null;
  address?: AddressInput;
  contacts?: ContactInput[];
  children?: ChildInput[];
}

export interface AddressInput {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface ContactInput {
  contact_type: string;
  contact_value: string;
  note?: string;
}

export interface ChildInput {
  name: string;
  birth_date: string; // você pode usar Date, mas em geral o front manda string ISO
  relationship?: string;
}
