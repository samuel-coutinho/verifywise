import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ProjectModel } from "./project.model";

/*

This is the new Assessment model(Schema) and will be replaced with the new one.
Please align other files with this

In fact nothing specific has changedn but we're only 
changing "projectId" to "project_id" for more consistancy

*/
export type Assessment = {
  id?: number;
  project_id: number;
};

@Table({
  tableName: "assessments"
})
export class AssessmentModel extends Model<Assessment> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id?: number;

  @ForeignKey(() => ProjectModel)
  @Column({
    type: DataType.INTEGER,
  })
  project_id!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_demo?: boolean;
}
