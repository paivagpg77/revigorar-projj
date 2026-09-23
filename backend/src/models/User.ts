import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, BeforeInsert, Index,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  full_name: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  password_hash: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  professional_license: string;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ length: 50, default: 'free' })
  plan: string;

  @Column({ type: 'timestamp', nullable: true })
  plan_expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @OneToMany('Patient', 'user')
  patients: any[];

  @OneToMany('Appointment', 'user')
  appointments: any[];

  @OneToMany('FinancialRecord', 'user')
  financial_records: any[];

  @OneToMany('StockItem', 'user')
  stock_items: any[];

  async setPassword(plain: string): Promise<void> {
    this.password_hash = await bcrypt.hash(plain, 12);
  }

  async checkPassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password_hash);
  }
}
