export class DataDefault {
    conversionFactorFromRtToKw: number;
    conversionFactorWaterFlowRate:number;
    conversionFactorForChiller: number;
    conversionFactorAirVolume: number;
    waterHeatCapacity: number;
    conversionFactorForCTCapacity: number;

    inputPower: number;
    waterFlowRate: number;
    airVolume: number;
    enteringChilledWaterTemp: number;
    leavingChilledWaterTemp: number;
    enteringCondenserWaterTemp: number;
    leavingCondenserWaterTemp: number;
    headProportionalFactor: number;
    maxFlowRateRatio: number;
    minFlowRateRatio: number;
    outdoorWetBulbTemp: number;
    maxAirVolume: number;
    minAirVolume: number;
    ratedFreq: number;
    flowRateCDWP: number
    flowRateCHWP: number
}