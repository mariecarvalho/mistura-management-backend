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
  has_elderly: boolean;
  is_single_mother: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyInput {
  representative_name: string;
  representative_birth_date?: string;
  representative_gender?: string;
  people_count: number;
  children_count: number;
  current_benefit?: string | null;
  benefit_status?: string | null;
  last_presence_date?: string | null;
  presence_status?: string | null;
  is_single_mother?: boolean;
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

export interface MemberInput {
  name: string;
  birth_date?: string | null;
  gender?: string;
  relationship?: string;
  status?: string;
}
// alias para compatibilidade retroativa
export type ChildInput = MemberInput;

export interface MemberOutput {
  id: string;
  name: string;
  birth_date: string;
  gender: 'Masculino' | 'Feminino';
  relationship: string;
  is_minor: boolean;
  age?: number;
}
// alias para compatibilidade retroativa
export type ChildOutput = MemberOutput;

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
  members: MemberOutput[];
  created_at?: string;
  updated_at?: string;

  // compatibilidade com UI
  street?: string;
  contact_value?: string;
  contact_note?: string;
};
