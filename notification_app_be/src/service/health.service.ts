export type HealthStatus = {
  status: "ok";
  time: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    time: new Date().toISOString()
  };
}
