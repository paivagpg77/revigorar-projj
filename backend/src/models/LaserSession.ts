import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Patient } from './Patient';

@Entity('laser_sessions')
@Index(['patient_id'])
export class LaserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patient_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ length: 100 })
  laser_type: string; // low_level, high_intensity, led

  @Column({ type: 'numeric', precision: 6, scale: 1, nullable: true })
  wavelength_nm: number;

  @Column({ type: 'numeric', precision: 6, scale: 1, nullable: true })
  power_mw: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  energy_j: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  dose_j_cm2: number;

  @Column({ type: 'int', nullable: true })
  time_seconds: number;

  @Column({ type: 'int', nullable: true })
  points_applied: number;

  @Column({ length: 255, nullable: true })
  application_area: string;

  @Column({ length: 255, nullable: true })
  indication: string;

  @Column({ type: 'smallint', default: 1 })
  session_number: number;

  @Column({ type: 'smallint', nullable: true })
  total_sessions: number;

  @Column({ type: 'boolean', default: false })
  photosensitive_meds: boolean;

  @Column({ type: 'text', nullable: true })
  photosensitive_detail: string;

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
