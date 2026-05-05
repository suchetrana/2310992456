import fs from "fs";
import path from "path";

export type PersonalConfig = {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
  token: string;
  apiBaseUrl: string;
};

function resolveConfigPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "personal.config.json"),
    path.resolve(process.cwd(), "..", "personal.config.json")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("personal.config.json not found");
}

export function loadPersonalConfig(): PersonalConfig {
  const configPath = resolveConfigPath();
  const raw = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(raw) as PersonalConfig;

  const override = (value: string | undefined, fallback: string) => {
    return value && value.trim().length > 0 ? value : fallback;
  };

  return {
    email: override(process.env.PERSONAL_EMAIL, config.email),
    name: override(process.env.PERSONAL_NAME, config.name),
    mobileNo: override(process.env.PERSONAL_MOBILE, config.mobileNo),
    githubUsername: override(process.env.GITHUB_USERNAME, config.githubUsername),
    rollNo: override(process.env.ROLL_NO, config.rollNo),
    accessCode: override(process.env.ACCESS_CODE, config.accessCode),
    clientID: override(process.env.CLIENT_ID, config.clientID),
    clientSecret: override(process.env.CLIENT_SECRET, config.clientSecret),
    token: override(process.env.ACCESS_TOKEN, config.token),
    apiBaseUrl: override(process.env.API_BASE_URL, config.apiBaseUrl)
  };
}
