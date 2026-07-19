// Global Warming Potential values by IPCC Assessment Report version
// All values are 100-year GWP (GWP100)

export type GWPVersion = "AR4" | "AR5" | "AR6";

export const GWP_VALUES: Record<GWPVersion, { CO2: number; CH4: number; N2O: number; HFCs?: Record<string, number> }> = {
  AR4: {
    CO2: 1,
    CH4: 25,
    N2O: 298,
    HFCs: {
      HFC23: 14800,
      HFC32: 675,
      HFC125: 3500,
      HFC134a: 1430,
      HFC143a: 4470,
      HFC152a: 124,
      HFC227ea: 3220,
      HFC236fa: 9810,
      HFC245fa: 1030,
      R410A: 2088,
      R22: 1810,
    },
  },
  AR5: {
    CO2: 1,
    CH4: 28,
    N2O: 265,
    HFCs: {
      HFC23: 12400,
      HFC32: 677,
      HFC125: 3170,
      HFC134a: 1300,
      HFC143a: 4800,
      HFC152a: 138,
      HFC227ea: 3350,
      HFC236fa: 8060,
      HFC245fa: 858,
      R410A: 2088,
      R22: 1760,
      SF6: 23500,
    },
  },
  AR6: {
    CO2: 1,
    CH4: 27.9,
    N2O: 273,
    HFCs: {
      HFC23: 14600,
      HFC32: 771,
      HFC125: 3740,
      HFC134a: 1530,
      HFC143a: 5810,
      HFC152a: 164,
      HFC227ea: 3600,
      HFC236fa: 8690,
      HFC245fa: 962,
      R410A: 2256,
      R22: 1960,
      SF6: 25200,
    },
  },
};

export function getCO2e(
  co2Kg: number,
  ch4Kg: number,
  n2oKg: number,
  gwpVersion: GWPVersion = "AR5"
): number {
  const gwp = GWP_VALUES[gwpVersion];
  return co2Kg * gwp.CO2 + ch4Kg * gwp.CH4 + n2oKg * gwp.N2O;
}

export function getGWP(gas: "CO2" | "CH4" | "N2O", version: GWPVersion = "AR5"): number {
  return GWP_VALUES[version][gas];
}
