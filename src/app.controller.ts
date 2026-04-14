import { Controller, Get, Post, Patch, Param, Body, Query, Headers, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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
