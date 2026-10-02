import { StaffAuthService } from "./authService";
import { ProductCatalogService } from "./productService";
import { SaleService } from "./saleService";
import { StockService } from "./stockService";
import { TargetService } from "./targetService";
import { TransactionHistoryService } from "./transactionService";
import { ReturnService } from "./returnService";
import type { StaffProfile, SaleRequest } from "./types";

const authService = new StaffAuthService();
const productService = new ProductCatalogService(authService);
const stockService = new StockService(authService);
const targetService = new TargetService(authService);
const transactionService = new TransactionHistoryService(authService);
const returnService = new ReturnService(authService);
const saleService = new SaleService(authService, productService, stockService);

export const posService = {
  auth: authService,
  products: productService,
  stock: stockService,
  targets: targetService,
  transactions: transactionService,
  sales: saleService,
  returns: returnService,
};

export const loginStaff = authService.login.bind(authService);
export const logoutStaff = authService.logout.bind(authService);
export const fetchStaffProfile = authService.getProfile.bind(authService);
export const fetchBranchProducts = productService.getBranchProducts.bind(productService);
export const updateBranchProductPrice = productService.updatePrice.bind(productService);
export const fetchBranchStock = stockService.getBranchStock.bind(stockService);
export const fetchBranchTarget = targetService.getCurrentBranchTarget.bind(targetService);
export const fetchTransactions = transactionService.getTransactions.bind(transactionService);
export const createSale = saleService.createSale.bind(saleService);

export type { StaffProfile, SaleRequest } from "./types";
export { adaptProducts, adaptTransactions } from "./adapters";
