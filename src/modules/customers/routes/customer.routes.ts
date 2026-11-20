import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { validateParams } from "../../../middlewares/validate-params";
import { PhoneParamDto } from "../dtos/phone-param.dto";
import { asyncHandler } from "../../../middlewares/async-handler";
import {
  findCustomerByIdController,
  findCustomerByPhoneController,
  listCustomersController,
  registerCustomerController,
} from "../controllers/customers.controller";
import { validateDto } from "../../../middlewares/validate-dto";
import { RegisterCustomerDto } from "../dtos/register-customer.dto";
import { IdParamDto } from "../../../common/dtos/id-param.dto";
import { validateQuery } from "../../../middlewares/validate-query";
import { ListCustomersQueryDto } from "../dtos/list-customer-query.dto";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validateQuery(ListCustomersQueryDto),
  asyncHandler(listCustomersController),
);

router.get(
  "/phone/:phone",
  validateParams(PhoneParamDto),
  asyncHandler(findCustomerByPhoneController),
);

router.get(
  "/:id",
  validateParams(IdParamDto),
  asyncHandler(findCustomerByIdController),
);

router.post(
  "/",
  validateDto(RegisterCustomerDto),
  asyncHandler(registerCustomerController),
);
export default router;
