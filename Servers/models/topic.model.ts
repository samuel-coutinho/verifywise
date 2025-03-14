import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { AssessmentModel } from "./assessment.model";

/*

This is the new Topic model(Schema) and will be replaced with the new one.
Please align other files with this

*/
export type Topic = {
  id?: number; // auto generated by database
  title: string; // gets assigned from the structure
  order_no?: number; // gets assigned from the structure
  assessment_id: number; // when assessment is created, its id will be stored and assign here as FK
};

@Table({
  tableName: "topics"
})
export class TopicModel extends Model<Topic> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id?: number;

  @Column({
    type: DataType.STRING
  })
  title!: string;

  @Column({
    type: DataType.INTEGER
  })
  order_no?: number;

  @ForeignKey(() => AssessmentModel)
  @Column({
    type: DataType.INTEGER
  })
  assessment_id!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_demo?: boolean;
}
