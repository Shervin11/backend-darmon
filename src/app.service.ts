import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { appointments as initialAppointments, wishlist as initialWishlist, users as initialUsers, category } from './data';

@Injectable()
export class AppService {
  private appointments = [...initialAppointments];
  private wishlist = [...initialWishlist];
  private users = [...initialUsers];

  // Categories
  getCategories() {
    return category;
  }

  // Users
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
    return this.users[index];
  }

  // Auth
  register(userData: any) {
    const existing = this.users.find((u) => u.email === userData.email);
    if (existing) throw new ConflictException('Email already exists');

    const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => Number(u.id) || 0)) + 1 : 1;
    const newUser = { id: newId, ...userData, role: userData.role || 'client' };
    this.users.push(newUser);
    return { token: newUser.id.toString(), user: newUser };
  }

  login(credentials: any) {
    const user = this.users.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { token: user.id.toString(), user };
  }

  authMe(token: string) {
    const id = parseInt(token.replace('Bearer ', '').trim(), 10);
    return this.getUserById(id);
  }

  // Wishlist
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
    return newList;
  }

  updateWishlist(id: string | number, updateData: any) {
    const index = this.wishlist.findIndex((w) => w.id == id);
    if (index === -1) throw new NotFoundException('Wishlist not found');
    this.wishlist[index] = { ...this.wishlist[index], ...updateData };
    return this.wishlist[index];
  }

  // Appointments
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
}
