import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ye.medicalcouncil.financial",
  appName: "مِيزان",
  webDir: "dist",
  loggingBehavior: "none",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#ffffff",
  },
};

export default config;
