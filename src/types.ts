export interface UserSettings {
  id: string;
  userId: string;
  deliveryAllQueuedWebhooksOnConnection: boolean;
  showWebhookResponseInConsole?: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  apiKey: string;
  user: {
    id: string;
    email: string;
    settings?: UserSettings;
  };
  authenticatedAt: string;
}
