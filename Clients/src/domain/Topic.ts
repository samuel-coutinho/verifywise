export type Topic = {
  id?: number; // auto generated by database
  title: string; // gets assigned from the structure
  order_no?: number; // gets assigned from the structure
  assessment_id: number; // when assessment is created, its id will be stored and assign here as FK
};
