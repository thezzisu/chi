import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { IJobInfo, JobState } from '../action/index.js'

@Entity()
export class ActionTask {
  @PrimaryGeneratedColumn() ord!: number
  @Column({ unique: true }) id!: string
  @Column() pluginId!: string
  @Column() actionId!: string
  @Column() state!: JobState
  @Column({ type: 'simple-json' }) jobs!: IJobInfo[]
  @Column() created!: number
  @Column() finished!: number
}
