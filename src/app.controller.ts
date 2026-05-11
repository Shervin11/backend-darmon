import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Headers, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ── Categories ────────────────────────────────────
  @Get('category')
  getCategories() {
    return this.appService.getCategories();
  }

  // ── Users ─────────────────────────────────────────
  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.appService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updateUser(id, updateData);
  }

  // ── Auth ──────────────────────────────────────────
  @Post('register')
  register(@Body() userData: any) {
    return this.appService.register(userData);
  }

  @Post('auth')
  login(@Body() credentials: any) {
    return this.appService.login(credentials);
  }

  @Get('auth_me')
  authMe(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    return this.appService.authMe(authHeader);
  }

  // ── Admin: Clinics ────────────────────────────────
  @Post('admin/create-clinic')
  createClinic(
    @Headers('authorization') authHeader: string,
    @Body() clinicData: any
  ) {
    if (!authHeader) throw new BadRequestException('Authorization required');
    return this.appService.createClinic(authHeader, clinicData);
  }

  @Get('admin/clinics')
  getClinics() {
    return this.appService.getClinics();
  }

  // ── Clinic: Doctors ───────────────────────────────
  @Post('clinic/create-doctor')
  createDoctor(
    @Headers('authorization') authHeader: string,
    @Body() doctorData: any
  ) {
    if (!authHeader) throw new BadRequestException('Authorization required');
    return this.appService.createDoctor(authHeader, doctorData);
  }

  @Get('clinic/doctors')
  getDoctorsByClinic(@Query('clinicId') clinicId: string) {
    return this.appService.getDoctorsByClinic(clinicId);
  }

  // ── Wishlist ──────────────────────────────────────
  @Get('wishlist')
  getWishlist(@Query('userId') userId?: string) {
    return this.appService.getWishlist(userId);
  }

  @Post('wishlist')
  createWishlist(@Body() data: any) {
    return this.appService.createWishlist(data);
  }

  @Patch('wishlist/:id')
  updateWishlist(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updateWishlist(id, updateData);
  }

  // ── Appointments ──────────────────────────────────
  @Get('appointments')
  getAppointments(
    @Query('clientId') clientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string
  ) {
    return this.appService.getAppointments(clientId, doctorId, date, status);
  }

  @Get('appointments/:id')
  getAppointmentById(@Param('id') id: string) {
    return this.appService.getAppointmentById(id);
  }

  @Post('appointments')
  createAppointment(@Body() data: any) {
    return this.appService.createAppointment(data);
  }

  @Patch('appointments/:id')
  updateAppointment(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updateAppointment(id, updateData);
  }

  // ── Messages (Chat) ──────────────────────────────
  @Get('messages')
  getMessages(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string
  ) {
    return this.appService.getMessages(userId1, userId2);
  }

  @Post('messages')
  sendMessage(@Body() data: any) {
    return this.appService.sendMessage(data);
  }

  @Patch('messages/:id')
  updateMessage(@Param('id') id: string, @Body() data: { text: string }) {
    return this.appService.updateMessage(id, data);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.appService.deleteMessage(id);
  }

  @Post('messages/mark-read')
  markRead(@Body() data: { userId: number; partnerId: number }) {
    return this.appService.markMessagesAsRead(data.userId, data.partnerId);
  }

  @Get('chat-partners')
  getChatPartners(@Query('userId') userId: string) {
    return this.appService.getChatPartners(userId);
  }

  @Get('medical-records')
  getMedicalRecords(
    @Query('clientId') clientId?: string,
    @Query('doctorId') doctorId?: string
  ) {
    return this.appService.getMedicalRecords(clientId, doctorId);
  }

  @Post('medical-records')
  createMedicalRecord(@Body() data: any) {
    return this.appService.createMedicalRecord(data);
  }

  @Patch('medical-records/:id')
  updateMedicalRecord(@Param('id') id: string, @Body() updateData: any) {
    return this.appService.updateMedicalRecord(id, updateData);
  }

  @Delete('medical-records/:id')
  deleteMedicalRecord(@Param('id') id: string) {
    return this.appService.deleteMedicalRecord(id);
  }

  // ── Uploads ───────────────────────────────────────
  @Post('uploads')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('File is required');
    const b64 = file.buffer.toString('base64');
    const mime = file.mimetype;
    return { url: `data:${mime};base64,${b64}` };
  }
}
