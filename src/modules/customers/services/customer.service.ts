import { pageSkip, toPage, type Page } from "../../../common/pagination";
import { escapeLike } from "../../../common/utils/escape";
import { AppDataSource } from "../../../config/data-source";
import { ConflictError, NotFoundError } from "../../../errors/http-errors";
import type { ListCustomersQueryDto } from "../dtos/list-customer-query.dto";
import type { RegisterCustomerDto } from "../dtos/register-customer.dto";
import { CustomerEntity } from "../entities/customer.entity";
import type { PublicCustomer } from "../types/customers.types";

function customers() {
  return AppDataSource.getRepository(CustomerEntity);
}

export function toPublicCustomer(customer: CustomerEntity): PublicCustomer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    createdAt: customer.createdAt,
  };
}

export async function findCustomerByPhone(
  phone: string,
): Promise<PublicCustomer> {
  const customer = await customers().findOneBy({ phone });
  if (!customer) throw new NotFoundError("Cliente no encontrado.");
  return toPublicCustomer(customer);
}

export async function registerCustomer(
  dto: RegisterCustomerDto,
): Promise<PublicCustomer> {
  const customerExisting = await customers().findOneBy({ phone: dto.phone });
  if (customerExisting) {
    throw new ConflictError(
      "Ya existe un cliente registrado con este número de teléfono.",
    );
  }
  const customer = await customers().save(
    customers().create({
      name: dto.name,
      phone: dto.phone,
    }),
  );
  return toPublicCustomer(customer);
}

export async function findCustomerById(id: string): Promise<PublicCustomer> {
  const customer = await customers().findOneBy({ id });
  if (!customer) {
    throw new NotFoundError("Cliente no encontrado.");
  }
  return toPublicCustomer(customer);
}

export async function listCustomers(
  query: ListCustomersQueryDto,
): Promise<Page<PublicCustomer>> {
  const { page, limit, search, sortBy, sortOrder } = query;

  const qb = customers().createQueryBuilder("customer");

  if (search) {
    const term = `%${escapeLike(search.trim())}%`;
    qb.andWhere(`(customer.name ILIKE :term OR customer.phone ILIKE :term)`, {
      term,
    });
  }
  qb.orderBy(`customer.${sortBy}`, sortOrder).addOrderBy("customer.id", "ASC");

  const [all, total] = await qb
    .skip(pageSkip(page, limit))
    .take(limit)
    .getManyAndCount();
  return toPage(all.map(toPublicCustomer), total, page, limit);
}
