import type { Request, Response } from "express";
import {
  findCustomerById,
  findCustomerByPhone,
  listCustomers,
  registerCustomer,
} from "../services/customer.service";
import type { PhoneParamDto } from "../dtos/phone-param.dto";
import type { RegisterCustomerDto } from "../dtos/register-customer.dto";
import type { IdParamDto } from "../../../common/dtos/id-param.dto";
import type { ListCustomersQueryDto } from "../dtos/list-customer-query.dto";

export const findCustomerByPhoneController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as unknown as PhoneParamDto;
  res.json(await findCustomerByPhone(params.phone));
};

export const registerCustomerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const values = req.body as unknown as RegisterCustomerDto;
  res.json(await registerCustomer(values));
};

export const findCustomerByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as unknown as IdParamDto;
  res.json(await findCustomerById(params.id));
};

export const listCustomersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as ListCustomersQueryDto;
  res.json(await listCustomers(query));
};
