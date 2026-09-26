import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// ════════════════════════════════════════════
// USER
// ════════════════════════════════════════════
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 255 }) full_name: string;
  @Index({ unique: true }) @Column({ length: 255 }) email: string;
  @Column({ length: 255, select: false }) password_hash: string;
  @Column({ length: 20, nullable: true }) phone: string;
  @Column({ length: 100, nullable: true }) professional_license: string;
  @Column({ length: 100, nullable: true }) specialization: string;
  @Column({ length: 50, default: 'free' }) plan: string;
  @Column({ type: 'boolean', default: true }) is_active: boolean;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @Column({ type: 'timestamp', nullable: true }) last_login: Date;

  async setPassword(p: string) { this.password_hash = await bcrypt.hash(p, 12); }
  async checkPassword(p: string) { return bcrypt.compare(p, this.password_hash); }
}

// ════════════════════════════════════════════
// PATIENT
// ════════════════════════════════════════════
@Entity('patients') @Index(['user_id'])
export class Patient {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 255 }) name: string;
  @Column({ type: 'date', nullable: true }) birth_date: Date;
  @Column({ length: 20, nullable: true }) cpf: string;
  @Column({ length: 20, nullable: true }) phone: string;
  @Column({ length: 30, nullable: true }) gender: string;
  @Column({ length: 60, nullable: true }) type: string; // Ferida, Estomia
  @Column({ length: 30, default: 'Ativo' }) status: string;
  @Column({ type: 'boolean', default: true }) self_responsible: boolean;
  @Column({ length: 255, nullable: true }) responsible_name: string;
  @Column({ type: 'text', nullable: true }) comorbidities: string;
  @Column({ type: 'text', nullable: true }) medications: string;
  @Column({ type: 'text', nullable: true }) allergies: string;
  @Column({ type: 'date', nullable: true }) last_eval: Date;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
}

// ════════════════════════════════════════════
// WOUND ASSESSMENT
// ════════════════════════════════════════════
@Entity('wound_assessments') @Index(['patient_id'])
export class WoundAssessment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') patient_id: string;
  @Column('uuid') user_id: string;
  @Column({ type: 'jsonb', nullable: true }) identification: any;
  @Column({ type: 'jsonb', nullable: true }) characteristics: any;
  @Column({ type: 'jsonb', nullable: true }) care_plan: any;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// EVOLUTION / RECORD
// ════════════════════════════════════════════
@Entity('evolutions') @Index(['patient_id'])
export class Evolution {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') patient_id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 60 }) type: string; // Avaliação clínica, Evolução fotográfica, Prescrição
  @Column({ type: 'text' }) description: string;
  @Column({ length: 100, nullable: true }) professional: string;
  @Column({ type: 'boolean', default: false }) has_photo: boolean;
  @CreateDateColumn() created_at: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// APPOINTMENT (AGENDA)
// ════════════════════════════════════════════
@Entity('appointments') @Index(['user_id'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column('uuid') patient_id: string;
  @Column({ type: 'smallint' }) day_of_week: number; // 0=Seg..6=Dom
  @Column({ length: 10 }) time: string; // "09:00"
  @Column({ length: 60 }) type: string; // Ferida, Estomia
  @Column({ length: 30, default: 'Confirmado' }) status: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// PRESCRIPTION
// ════════════════════════════════════════════
@Entity('prescriptions') @Index(['user_id'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column('uuid') patient_id: string;
  @Column({ length: 60 }) category: string; // ENFERMAGEM, ESTOMIA, MEDICAMENTO, NUTRIÇÃO
  @Column({ type: 'text' }) description: string;
  @Column({ length: 30, default: 'active' }) status: string;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// STOCK
// ════════════════════════════════════════════
@Entity('stock_items') @Index(['user_id'])
export class StockItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 60, nullable: true }) category: string;
  @Column({ type: 'int', default: 0 }) quantity: number;
  @Column({ type: 'int', default: 0 }) min_quantity: number;
  @Column({ length: 20, nullable: true }) status_label: string; // Em estoque, Estoque baixo
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}

// ════════════════════════════════════════════
// PHOTO
// ════════════════════════════════════════════
@Entity('photos') @Index(['patient_id'])
export class Photo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') patient_id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 500 }) file_path: string;
  @Column({ type: 'int', nullable: true }) file_size: number;
  @CreateDateColumn() created_at: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// DOCUMENT
// ════════════════════════════════════════════
@Entity('documents') @Index(['patient_id'])
export class Document {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') patient_id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 255 }) name: string;
  @Column({ length: 20, nullable: true }) size: string;
  @Column({ length: 500, nullable: true }) file_path: string;
  @CreateDateColumn({ name: 'date' }) date: Date;
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'patient_id' }) patient: Patient;
}

// ════════════════════════════════════════════
// INSTITUTION (SETTINGS)
// ════════════════════════════════════════════
@Entity('institutions') @Index(['user_id'], { unique: true })
export class Institution {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 255, default: '' }) name: string;
  @Column({ length: 20, default: '' }) cnpj: string;
  @Column({ length: 255, default: '' }) email: string;
  @Column({ length: 20, default: '' }) phone: string;
  @Column({ type: 'text', default: '' }) address: string;
  @UpdateDateColumn() updated_at: Date;
}

// ════════════════════════════════════════════
// INTEGRATION SETTINGS
// ════════════════════════════════════════════
@Entity('integrations') @Index(['user_id'])
export class Integration {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 255 }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'boolean', default: false }) enabled: boolean;
}

// ════════════════════════════════════════════
// BACKUP SETTINGS
// ════════════════════════════════════════════
@Entity('backup_settings') @Index(['user_id'], { unique: true })
export class BackupSetting {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 30, default: 'Semanal' }) frequency: string;
  @Column({ type: 'timestamp', nullable: true }) last_backup: Date;
  @Column({ type: 'int', default: 0 }) total_backups: number;
}

// ════════════════════════════════════════════
// MONITORING MESSAGE
// ════════════════════════════════════════════
@Entity('monitoring_messages') @Index(['patient_id'])
export class MonitoringMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') patient_id: string;
  @Column('uuid') user_id: string;
  @Column({ length: 20 }) sender: string; // professional, patient
  @Column({ type: 'text' }) text: string;
  @CreateDateColumn() created_at: Date;
}
