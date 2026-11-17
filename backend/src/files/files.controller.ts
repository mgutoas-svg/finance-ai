import { Controller, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../tenants/tenant.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class FilesController {
  constructor(private files: FilesService) {}

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.files.uploadPDF(req.tenantId, file, accountId);
  }

  @Post('upload-ofx')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOFX(
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.files.uploadOFX(req.tenantId, file, accountId);
  }
}
