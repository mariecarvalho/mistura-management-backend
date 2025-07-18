export interface Family {
  id: string;
  representative_name: string;
  representative_birth_date: string;
  representative_gender: string;
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
  contact_note?: string;
}

export interface ChildInput {
  name: string;
  birth_date: string; // você pode usar Date, mas em geral o front manda string ISO
  gender?: string;
  relationship?: string;
  status?: string;
}
export interface ChildOutput {
  name: string;
  birth_date: string;
  gender: 'Masculino' | 'Feminino';
  relationship: string;
  status: 'Ativo' | 'Inativo';
  age?: number;
}

export type FamilyOutput = {
  id: string;
  representative_name: string;
  representative_birth_date: string;
  representative_gender: 'Masculino' | 'Feminino';
  people_count: number;
  children_count: number;
  current_benefit: string;
  benefit_status: string;
  last_presence_date: string;
  presence_status: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    postal_code: string;
  };
  contacts: {
    contact_type: string;
    contact_value: string;
    contact_note?: string;
  }[];
  children: {
    name: string;
    birth_date: string;
    gender: 'Masculino' | 'Feminino';
    relationship: string;
    status: 'Ativo' | 'Inativo';
    age?: number;
  }[];
  created_at?: string;
  updated_at?: string;

  // compatibilidade com UI
  street?: string;
  contact_value?: string;
  contact_note?: string;
};
