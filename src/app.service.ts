import { Injectable, NotFoundException, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { appointments as initialAppointments, wishlist as initialWishlist, users as initialUsers, category, messages as initialMessages } from './data';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

const JWT_SECRET = 'darmon-secret-key-2026';

@Injectable()
export class AppService {
  private appointments = [...initialAppointments];
  private wishlist = [...initialWishlist];
  private users = [...initialUsers];
  private messages = [...initialMessages];
  private medicalRecords: any[] = [];

  private DB_PATH = path.join(process.cwd(), 'db.json');

  constructor() {
    this.loadData();
  }

  private loadData() {
    if (fs.existsSync(this.DB_PATH)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.DB_PATH, 'utf8'));
        if (data.appointments) this.appointments = data.appointments;
        if (data.wishlist) this.wishlist = data.wishlist;
        if (data.users) this.users = data.users;
        if (data.messages) this.messages = data.messages;
        if (data.medicalRecords) this.medicalRecords = data.medicalRecords;
      } catch (e) {
        console.error('Error loading DB:', e);
      }
    }
  }

  private saveData() {
    const data = {
      appointments: this.appointments,
      wishlist: this.wishlist,
      users: this.users,
      messages: this.messages,
      medicalRecords: this.medicalRecords,
    };
    try {
      fs.writeFileSync(this.DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving DB:', e);
    }
  }

  // ── JWT Helpers ────────────────────────────────
  private generateToken(user: any): string {
    return jwt.sign(
      { id: user.id, role: user.role, clinicId: user.clinicId || null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  private verifyToken(token: string): any {
    try {
      const clean = token.replace('Bearer ', '').trim();
      return jwt.verify(clean, JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ── Categories ─────────────────────────────────
  getCategories() {
    return category;
  }

  // ── Users ──────────────────────────────────────
  getUsers() {
    return this.users;
  }

  getUserById(id: string | number) {
    const user = this.users.find((u) => u.id == id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateUser(id: string | number, updateData: any) {
    const index = this.users.findIndex((u) => u.id == id);
    if (index === -1) throw new NotFoundException('User not found');
    this.users[index] = { ...this.users[index], ...updateData };
    this.saveData();
    return this.users[index];
  }

  // ── Auth ───────────────────────────────────────
  register(userData: any) {
    const existing = this.users.find((u) => u.email === userData.email);
    if (existing) throw new ConflictException('Email already exists');

    const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => Number(u.id) || 0)) + 1 : 1;
    const newUser = { id: newId, ...userData, role: userData.role || 'client' } as any;
    this.users.push(newUser);
    const token = this.generateToken(newUser);
    return { token, user: newUser };
  }

  login(credentials: any) {
    const user = this.users.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const token = this.generateToken(user);
    return { token, user, role: user.role };
  }

  authMe(authHeader: string) {
    const decoded = this.verifyToken(authHeader);
    return this.getUserById(decoded.id);
  }

  // ── Admin: Create Clinic ──────────────────────
  createClinic(authHeader: string, clinicData: any) {
    const decoded = this.verifyToken(authHeader);
    if (decoded.role !== 'admin') throw new ForbiddenException('Admin only');

    const existing = this.users.find((u) => u.email === clinicData.email);
    if (existing) throw new ConflictException('Email already exists');

    const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => Number(u.id) || 0)) + 1 : 1;
    const newClinic = {
      id: newId,
      fullName: clinicData.clinicName,
      clinicName: clinicData.clinicName,
      email: clinicData.email,
      password: clinicData.password,
      role: 'clinic',
      phone: clinicData.phone || '',
      city: clinicData.city || '',
      address: clinicData.address || '',
      image: '',
    } as any;
    this.users.push(newClinic);
    return newClinic;
  }

  // ── Clinic: Create Doctor ─────────────────────
  createDoctor(authHeader: string, doctorData: any) {
    const decoded = this.verifyToken(authHeader);
    if (decoded.role !== 'clinic') throw new ForbiddenException('Clinic only');

    const existing = this.users.find((u) => u.email === doctorData.email);
    if (existing) throw new ConflictException('Email already exists');

    const clinic = this.getUserById(decoded.id);
    const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => Number(u.id) || 0)) + 1 : 1;
    const newDoctor = {
      id: newId,
      fullName: doctorData.fullName,
      email: doctorData.email,
      password: doctorData.password,
      role: 'doctor',
      specialty: doctorData.specialty || '',
      experience: doctorData.experience || 0,
      recommendation: 0,
      rating: 0,
      price: doctorData.price || { current: 0, old: null, currency: 'см' },
      city: (clinic as any).city || '',
      clinic: (clinic as any).clinicName || '',
      clinicId: decoded.id,
      image: '',
      bio: doctorData.bio || '',
      workingSchedule: [],
      comments: [],
      phone: doctorData.phone || '',
      diploma: '',
      diplomaVerified: false,
    } as any;
    this.users.push(newDoctor);
    this.saveData();
    return newDoctor;
  }

  // ── Get clinics (for admin) ───────────────────
  getClinics() {
    return this.users.filter((u) => u.role === 'clinic');
  }

  // ── Get doctors by clinic ─────────────────────
  getDoctorsByClinic(clinicId: string | number) {
    return this.users.filter((u: any) => u.role === 'doctor' && u.clinicId == clinicId);
  }

  // ── Wishlist ───────────────────────────────────
  getWishlist(userId?: string | number) {
    if (userId) {
      return this.wishlist.filter((w) => w.userId == userId);
    }
    return this.wishlist;
  }

  createWishlist(data: any) {
    const newId = this.wishlist.length > 0 ? Math.max(...this.wishlist.map((w) => Number(w.id) || 0)) + 1 : 1;
    const newList = { id: newId, ...data };
    this.wishlist.push(newList);
    this.saveData();
    return newList;
  }

  updateWishlist(id: string | number, updateData: any) {
    const index = this.wishlist.findIndex((w) => w.id == id);
    if (index === -1) throw new NotFoundException('Wishlist not found');
    this.wishlist[index] = { ...this.wishlist[index], ...updateData };
    return this.wishlist[index];
  }

  // ── Appointments ───────────────────────────────
  getAppointments(
    clientId?: string | number,
    doctorId?: string | number,
    date?: string,
    status?: string
  ) {
    let result = this.appointments;
    if (clientId) result = result.filter((a) => a.clientId == clientId);
    if (doctorId) result = result.filter((a) => a.doctorId == doctorId);
    if (date) result = result.filter((a) => a.date == date);
    if (status) result = result.filter((a) => a.status == status);
    return result;
  }

  createAppointment(data: any) {
    const newId =
      this.appointments.length > 0
        ? Math.max(...this.appointments.map((a) => Number(a.id) || 0)) + 1
        : 1;
    const newAppointment = { id: newId, ...data };
    this.appointments.push(newAppointment);
    this.saveData();
    return newAppointment;
  }

  updateAppointment(id: string | number, updateData: any) {
    const index = this.appointments.findIndex((a) => a.id == id);
    if (index === -1) throw new NotFoundException('Appointment not found');
    this.appointments[index] = { ...this.appointments[index], ...updateData };
    return this.appointments[index];
  }

  getAppointmentById(id: string | number) {
    const ap = this.appointments.find((a) => a.id == id);
    if (!ap) throw new NotFoundException('Appointment not found');
    return ap;
  }

  // ── Messages (Chat) ───────────────────────────
  getMessages(userId1: string | number, userId2: string | number) {
    return this.messages.filter(
      (m) =>
        (m.senderId == userId1 && m.receiverId == userId2) ||
        (m.senderId == userId2 && m.receiverId == userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(data: { senderId: number; receiverId: number; text: string; audioUrl?: string }) {
    const newId = this.messages.length > 0
      ? Math.max(...this.messages.map((m) => Number(m.id) || 0)) + 1
      : 1;
    const message: any = {
      id: newId,
      senderId: Number(data.senderId),
      receiverId: Number(data.receiverId),
      text: data.text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    if (data.audioUrl) {
      message.audioUrl = data.audioUrl;
    }
    this.messages.push(message);
    this.saveData();
    return message;
  }

  updateMessage(id: number | string, data: { text: string }) {
    const index = this.messages.findIndex((m) => m.id == id);
    if (index === -1) throw new NotFoundException('Message not found');
    this.messages[index].text = data.text;
    this.messages[index].isEdited = true;
    this.saveData();
    return this.messages[index];
  }

  deleteMessage(id: number | string) {
    const index = this.messages.findIndex((m) => m.id == id);
    if (index === -1) throw new NotFoundException('Message not found');
    const deleted = this.messages.splice(index, 1);
    this.saveData();
    return deleted[0];
  }

  markMessagesAsRead(userId: string | number, partnerId: string | number) {
    this.messages.forEach((m) => {
      if (m.senderId == partnerId && m.receiverId == userId) {
        m.isRead = true;
      }
    });
    this.saveData();
    return { success: true };
  }
  
  clearChat(userId1: string | number, userId2: string | number) {
    this.messages = this.messages.filter(
      (m) =>
        !(
          (m.senderId == userId1 && m.receiverId == userId2) ||
          (m.senderId == userId2 && m.receiverId == userId1)
        )
    );
    this.saveData();
    return { success: true };
  }

  // Get chat partners for a user
  getChatPartners(userId: string | number) {
    const partnerIds = new Set<number>();
    this.messages.forEach((m) => {
      if (m.senderId == userId) partnerIds.add(m.receiverId);
      if (m.receiverId == userId) partnerIds.add(m.senderId);
    });
    // Also add partners from appointments
    this.appointments.forEach((a: any) => {
      if (a.clientId == userId) partnerIds.add(a.doctorId);
      if (a.doctorId == userId) partnerIds.add(a.clientId);
    });
    return Array.from(partnerIds).map((id) => {
      try {
        const user = this.getUserById(id);
        const unreadCount = this.messages.filter(
          (m) => m.senderId == id && m.receiverId == userId && !m.isRead
        ).length;

        return { 
          id: user.id, 
          fullName: user.fullName, 
          image: user.image, 
          role: user.role, 
          specialty: (user as any).specialty,
          unreadCount 
        };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
  // ── Medical Records (Medical Card) ────────────
  getMedicalRecords(clientId?: string | number, doctorId?: string | number) {
    let result = this.medicalRecords;
    if (clientId) result = result.filter((r) => r.clientId == clientId);
    if (doctorId) result = result.filter((r) => r.doctorId == doctorId);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createMedicalRecord(data: any) {
    const newId = this.medicalRecords.length > 0
      ? Math.max(...this.medicalRecords.map((r) => Number(r.id) || 0)) + 1
      : 1;
    const record = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.medicalRecords.push(record);
    this.saveData();
    return record;
  }

  updateMedicalRecord(id: string | number, updateData: any) {
    const index = this.medicalRecords.findIndex((r) => r.id == id);
    if (index === -1) throw new NotFoundException('Medical record not found');
    this.medicalRecords[index] = { 
      ...this.medicalRecords[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.medicalRecords[index];
  }

  deleteMedicalRecord(id: string | number) {
    const index = this.medicalRecords.findIndex((r) => r.id == id);
    if (index === -1) throw new NotFoundException('Medical record not found');
    const deleted = this.medicalRecords.splice(index, 1);
    this.saveData();
    return deleted[0];
  }
}
