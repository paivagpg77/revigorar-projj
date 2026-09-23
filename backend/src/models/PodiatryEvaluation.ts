import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('podiatry_evaluations')
@Index(['patient_id'])
export class PodiatryEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 10 })
  foot: string; // left, right, both

  @Column({ type: 'jsonb', nullable: true })
  conditions: string[]; // onychocryptosis, onychomycosis, callus, fissure, etc

  @Column({ type: 'text', nullable: true })
  nail_assessment: string;

  @Column({ type: 'text', nullable: true })
  skin_assessment: string;

  @Column({ type: 'boolean', default: false })
  has_diabetes: boolean;

  @Column({ type: 'boolean', default: false })
  loss_of_sensitivity: boolean;

  @Column({ type: 'boolean', default: false })
  vascular_changes: boolean;

  @Column({ type: 'text', nullable: true })
  procedure_performed: string;

  @Column({ type: 'text', nullable: true })
  products_used: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  recorded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
