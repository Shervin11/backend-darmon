"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const data_1 = require("./data");
let AppService = class AppService {
    appointments = [...data_1.appointments];
    wishlist = [...data_1.wishlist];
    users = [...data_1.users];
    getCategories() {
        return data_1.category;
    }
    getUsers() {
        return this.users;
    }
    getUserById(id) {
        const user = this.users.find((u) => u.id == id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    updateUser(id, updateData) {
        const index = this.users.findIndex((u) => u.id == id);
        if (index === -1)
            throw new common_1.NotFoundException('User not found');
        this.users[index] = { ...this.users[index], ...updateData };
        return this.users[index];
    }
    register(userData) {
        const existing = this.users.find((u) => u.email === userData.email);
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => Number(u.id) || 0)) + 1 : 1;
        const newUser = { id: newId, ...userData, role: userData.role || 'client' };
        this.users.push(newUser);
        return { token: newUser.id.toString(), user: newUser };
    }
    login(credentials) {
        const user = this.users.find((u) => u.email === credentials.email && u.password === credentials.password);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return { token: user.id.toString(), user };
    }
    authMe(token) {
        const id = parseInt(token.replace('Bearer ', '').trim(), 10);
        return this.getUserById(id);
    }
    getWishlist(userId) {
        if (userId) {
            return this.wishlist.filter((w) => w.userId == userId);
        }
        return this.wishlist;
    }
    createWishlist(data) {
        const newId = this.wishlist.length > 0 ? Math.max(...this.wishlist.map((w) => Number(w.id) || 0)) + 1 : 1;
        const newList = { id: newId, ...data };
        this.wishlist.push(newList);
        return newList;
    }
    updateWishlist(id, updateData) {
        const index = this.wishlist.findIndex((w) => w.id == id);
        if (index === -1)
            throw new common_1.NotFoundException('Wishlist not found');
        this.wishlist[index] = { ...this.wishlist[index], ...updateData };
        return this.wishlist[index];
    }
    getAppointments(clientId, doctorId, date, status) {
        let result = this.appointments;
        if (clientId)
            result = result.filter((a) => a.clientId == clientId);
        if (doctorId)
            result = result.filter((a) => a.doctorId == doctorId);
        if (date)
            result = result.filter((a) => a.date == date);
        if (status)
            result = result.filter((a) => a.status == status);
        return result;
    }
    createAppointment(data) {
        const newId = this.appointments.length > 0
            ? Math.max(...this.appointments.map((a) => Number(a.id) || 0)) + 1
            : 1;
        const newAppointment = { id: newId, ...data };
        this.appointments.push(newAppointment);
        return newAppointment;
    }
    updateAppointment(id, updateData) {
        const index = this.appointments.findIndex((a) => a.id == id);
        if (index === -1)
            throw new common_1.NotFoundException('Appointment not found');
        this.appointments[index] = { ...this.appointments[index], ...updateData };
        return this.appointments[index];
    }
    getAppointmentById(id) {
        const ap = this.appointments.find((a) => a.id == id);
        if (!ap)
            throw new common_1.NotFoundException('Appointment not found');
        return ap;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map