export type AppConfig = {
  port: number;
};

export function getAppConfig(): AppConfig {
  const rawPort = process.env.PORT ?? "3001";
  const parsed = Number(rawPort);
  const port = Number.isFinite(parsed) ? parsed : 3001;

  return { port };
}
