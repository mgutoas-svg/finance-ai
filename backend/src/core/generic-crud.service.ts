import { Injectable } from '@nestjs/common';

@Injectable()
export class GenericCrudService {
  async create(prismaModel: any, tenantId: string, data: any) {
    return prismaModel.create({ data: { ...data, tenantId } });
  }

  async findAll(prismaModel: any, tenantId: string) {
    return prismaModel.findMany({ where: { tenantId } });
  }

  async findOne(prismaModel: any, id: string) {
    return prismaModel.findUnique({ where: { id } });
  }

  async update(prismaModel: any, id: string, data: any) {
    return prismaModel.update({ where: { id }, data });
  }

  async delete(prismaModel: any, id: string) {
    return prismaModel.delete({ where: { id } });
  }
}
