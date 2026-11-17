import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthUser } from './auth';
import { CurrentUser, Public } from './auth';
import { BookingService } from './booking.service';
import { ChatService } from './chat.service';
import { publicUrl, saveFile } from './files';
import { UsersService } from './users.service';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD =
  /^(image\/(png|jpe?g|webp|gif)|application\/pdf|audio\/(webm|ogg|mpeg|mp4|wav))/;
const upload = FileInterceptor('file', {
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

type Body = Record<string, any>;

@Controller()
export class AppController {
  constructor(
    private readonly users: UsersService,
    private readonly booking: BookingService,
    private readonly chat: ChatService,
  ) {}

  // ── Public ────────────────────────────────────
  @Public()
  @Get('category')
  getCategories() {
    return this.users.getCategories();
  }

  @Public()
  @Get('health')
  health() {
    return { ok: true };
  }

  @Public()
  @Get('holidays')
  getHolidays() {
    return this.users.getHolidays();
  }

  @Public()
  @Get('clinics')
  listClinics() {
    return this.users.listClinics();
  }

  @Public()
  @Get('clinics/:id')
  getClinic(@Param('id') id: string) {
    return this.users.getClinicPage(id);
  }

  @Public()
  @Get('doctors/:id/slots')
  getSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.booking.getSlots(id, date);
  }

  // ── Auth ──────────────────────────────────────
  @Public()
  @Post('register')
  register(@Body() body: Body) {
    return this.users.register(body);
  }

  @Public()
  @Post('auth')
  login(@Body() body: Body) {
    return this.users.login(body);
  }

  @Public()
  @Post('auth/reset/request')
  requestReset(@Body() body: Body) {
    return this.users.requestPasswordReset(body);
  }

  @Public()
  @Post('auth/reset/confirm')
  confirmReset(@Body() body: Body) {
    return this.users.confirmPasswordReset(body);
  }

  @Get('auth_me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.me(user);
  }

  // ── Current user ──────────────────────────────
  @Post('users/me/telegram')
  startTelegramLink(@CurrentUser() user: AuthUser) {
    return this.users.startTelegramLink(user);
  }

  @Delete('users/me/telegram')
  unlinkTelegram(@CurrentUser() user: AuthUser) {
    return this.users.unlinkTelegram(user);
  }

  @Post('users/me/diploma')
  @UseInterceptors(upload)
  uploadDiploma(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.users.uploadDiploma(user, file);
  }

  @Get('users/me/access-log')
  getAccessLog(@CurrentUser() user: AuthUser) {
    return this.chat.getAccessLog(user);
  }

  // ── Users ─────────────────────────────────────
  @Public()
  @Get('users')
  getUsers(@CurrentUser() user: AuthUser | null, @Query('role') role?: string) {
    return this.users.getUsers(user, role);
  }

  @Public()
  @Get('users/:id')
  getUser(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
    return this.users.getUser(user, id);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Body,
  ) {
    return this.users.updateUser(user, id, body);
  }

  // ── Reviews ───────────────────────────────────
  @Get('doctors/:id/reviewable')
  reviewable(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.reviewableVisits(user, id);
  }

  @Post('doctors/:id/comments')
  addReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Body,
  ) {
    return this.users.addReview(user, id, body);
  }

  @Patch('doctors/:id/comments/:commentId')
  updateReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() body: Body,
  ) {
    return this.users.updateReview(user, id, commentId, body);
  }

  @Delete('doctors/:id/comments/:commentId')
  deleteReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.users.deleteReview(user, id, commentId);
  }

  // ── Admin ─────────────────────────────────────
  @Post('admin/create-clinic')
  createClinic(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.users.createClinic(user, body);
  }

  @Get('admin/clinics')
  getClinics(@CurrentUser() user: AuthUser) {
    return this.users.getClinicsAdmin(user);
  }

  @Put('admin/holidays')
  setHolidays(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.users.setHolidays(user, body);
  }

  // ── Clinic ────────────────────────────────────
  @Post('clinic/create-doctor')
  createDoctor(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.users.createDoctor(user, body);
  }

  @Get('clinic/doctors')
  getClinicDoctors(@CurrentUser() user: AuthUser) {
    return this.users.getClinicDoctors(user);
  }

  @Get('clinic/registrars')
  getRegistrars(@CurrentUser() user: AuthUser) {
    return this.users.getRegistrars(user);
  }

  @Post('clinic/registrars')
  createRegistrar(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.users.createRegistrar(user, body);
  }

  @Delete('clinic/registrars/:id')
  deleteRegistrar(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.deleteRegistrar(user, id);
  }

  @Get('clinic/report')
  getReport(@CurrentUser() user: AuthUser, @Query() query: Body) {
    return this.booking.getReport(user, query);
  }

  @Get('clinic/report.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="darmon-report.csv"')
  getReportCsv(@CurrentUser() user: AuthUser, @Query() query: Body) {
    return this.booking.getReportCsv(user, query);
  }

  // ── Wishlist (current user) ───────────────────
  @Get('wishlist')
  getWishlist(@CurrentUser() user: AuthUser) {
    return this.users.getFavorites(user);
  }

  @Post('wishlist')
  addToWishlist(
    @CurrentUser() user: AuthUser,
    @Body('doctorId') doctorId: number,
  ) {
    return this.users.addFavorite(user, doctorId);
  }

  @Delete('wishlist/:doctorId')
  removeFromWishlist(
    @CurrentUser() user: AuthUser,
    @Param('doctorId') doctorId: string,
  ) {
    return this.users.removeFavorite(user, doctorId);
  }

  // ── Appointments ──────────────────────────────
  @Get('appointments')
  getAppointments(@CurrentUser() user: AuthUser, @Query() query: Body) {
    return this.booking.getAppointments(user, query);
  }

  @Post('appointments')
  createAppointment(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.booking.createAppointment(user, body);
  }

  @Patch('appointments/:id')
  updateAppointment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Body,
  ) {
    return this.booking.updateAppointment(user, id, body);
  }

  // ── Messages ──────────────────────────────────
  @Get('messages')
  getMessages(
    @CurrentUser() user: AuthUser,
    @Query('partnerId') partnerId: string,
  ) {
    return this.chat.getMessages(user, partnerId);
  }

  @Post('messages')
  sendMessage(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.chat.sendMessage(user, body);
  }

  @Post('messages/mark-read')
  markRead(
    @CurrentUser() user: AuthUser,
    @Body('partnerId') partnerId: number,
  ) {
    return this.chat.markRead(user, partnerId);
  }

  @Delete('messages')
  clearChat(
    @CurrentUser() user: AuthUser,
    @Query('partnerId') partnerId: string,
  ) {
    return this.chat.clearChat(user, partnerId);
  }

  @Patch('messages/:id')
  updateMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('text') text: string,
  ) {
    return this.chat.updateMessage(user, id, text);
  }

  @Delete('messages/:id')
  deleteMessage(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.chat.deleteMessage(user, id);
  }

  @Get('chat-partners')
  getChatPartners(@CurrentUser() user: AuthUser) {
    return this.chat.getChatPartners(user);
  }

  // ── Medical records ───────────────────────────
  @Get('medical-records')
  getMedicalRecords(
    @CurrentUser() user: AuthUser,
    @Query('clientId') clientId?: string,
  ) {
    return this.chat.getMedicalRecords(user, clientId);
  }

  @Post('medical-records')
  createMedicalRecord(@CurrentUser() user: AuthUser, @Body() body: Body) {
    return this.chat.createMedicalRecord(user, body);
  }

  @Patch('medical-records/:id')
  updateMedicalRecord(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Body,
  ) {
    return this.chat.updateMedicalRecord(user, id, body);
  }

  @Delete('medical-records/:id')
  deleteMedicalRecord(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.chat.deleteMedicalRecord(user, id);
  }

  // ── Uploads (stored on disk, served from /files) ──
  @Post('uploads')
  @UseInterceptors(upload)
  uploadFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    if (!ALLOWED_UPLOAD.test(file.mimetype))
      throw new BadRequestException('Unsupported file type');
    const path = saveFile(file.buffer, file.mimetype);
    return { url: publicUrl(path), path };
  }
}
