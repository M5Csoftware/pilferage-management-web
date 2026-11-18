export interface SystemSettings {
  hubName: string;
  terminalCode: string;
  defaultTolerancePercentage: number;
  autoFlagThresholdKg: number;
  scaleComPort: string;
  scaleBaudRate: number;
  soundAlerts: boolean;
  requireSupervisorOverrideOnTheft: boolean;
  currencySymbol: string;
  estCostPerKg: number; // for calculating financial impact of stolen goods
}

export const DEFAULT_SETTINGS: SystemSettings = {
  hubName: "Central Cargo Air Terminal Hub - Gateway 4",
  terminalCode: "HUB-DEL-04",
  defaultTolerancePercentage: 1.0,
  autoFlagThresholdKg: 0.5,
  scaleComPort: "COM3 - Mettler Toledo Scale (Auto-Detect)",
  scaleBaudRate: 9600,
  soundAlerts: true,
  requireSupervisorOverrideOnTheft: true,
  currencySymbol: "$",
  estCostPerKg: 120, // $120 estimated value per kg of electronics/high-value freight
};
