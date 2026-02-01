import Store from "electron-store";

interface UserSettings {
  messType: string;
  laundryBlock: string;
}

class SettingsService {
  private store: any;

  constructor() {
    this.store = new Store<UserSettings>({
      name: "user-settings",
      defaults: {
        messType: "Veg-mens",
        laundryBlock: "d2",
      },
    });
  }

  // Mess settings
  getMessType(): string {
    return this.store.get("messType");
  }

  setMessType(messType: string): void {
    this.store.set("messType", messType);
  }

  // Laundry settings
  getLaundryBlock(): string {
    return this.store.get("laundryBlock");
  }

  setLaundryBlock(block: string): void {
    this.store.set("laundryBlock", block);
  }

  // Get all settings
  getAllSettings(): UserSettings {
    return this.store.store;
  }

  // Clear all settings
  clearAllSettings(): void {
    this.store.clear();
  }
}

export const settingsService = new SettingsService();
export type { UserSettings };
