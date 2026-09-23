import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('estomia_evaluations')
@Index(['patient_id'])
export class EstomiaEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 60 })
  stoma_type: string; // colostomy, ileostomy, urostomy

  @Column({ length: 60, nullable: true })
  location: string;

  @Column({ type: 'smallint', nullable: true })
  sacs_score: number; // SACS 2.0

  @Column({ length: 60, nullable: true })
  sacs_classification: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  stoma_diameter_mm: number;

  @Column({ length: 100, nullable: true })
  bag_type: string;

  @Column({ length: 100, nullable: true })
  bag_brand: string;

  @Column({ type: 'text', nullable: true })
  peristomal_skin: string;

  @Column({ type: 'boolean', default: false })
  has_complications: boolean;

  @Column({ type: 'text', nullable: true })
  complications_detail: string;

  @Column({ type: 'text', nullable: true })
  output_characteristics: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  recorded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
