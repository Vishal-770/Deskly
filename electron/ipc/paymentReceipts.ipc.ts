import { ipcMain } from "electron";
import { getPaymentReceipts } from "../services/other/PaymentRecipts.service";

ipcMain.handle("paymentReceipts:fetch", () => getPaymentReceipts());
