import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { IJobInfo, ITaskInfo, JobState } from '@chijs/core'

@Entity()
export class ActionTask implements ITaskInfo {
  @PrimaryGeneratedColumn() ord!: number
  @Column({ unique: true }) id!: string
  @Column() serviceId!: string
  @Column() actionId!: string
  @Column() state!: JobState
  @Column({ type: 'simple-json' }) jobs!: IJobInfo[]
  @Column() created!: number
  @Column() finished!: number
}
