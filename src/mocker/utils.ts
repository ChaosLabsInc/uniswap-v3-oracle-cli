import { BigNumber } from "ethers";
import { TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import _BN from "bn.js";
import bn from "bignumber.js";
import BN = _BN.BN;

export function getSqrtRatioAtTick(tick: number): BigNumber {
  const Jsbi = TickMath.getSqrtRatioAtTick(tick);
  return BigNumber.from(Jsbi.toString());
}

export function getTickAtSqrtRatio(sqrt: BigNumber): BigNumber {
  const tick = TickMath.getTickAtSqrtRatio(JSBI.BigInt(sqrt.toString()));
  return BigNumber.from(tick);
}

/*
Based on - sqrtRatioX96 ** 2 / 2 ** 192 = price
**
Note that BigNumber doesn't support decimals, so divding early gets a 0 result, in case of impersise result increate the tempMultiplier:
Be careful, setting the multiplier too low loses precision, setting too high can overflow result.
*/
export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigNumber, dec0: number, dec1: number): number[] {
  const denom = BigNumber.from(2).pow(192);
  const base = sqrtPriceX96.pow(2);
  const decPercision = 10 ** dec0 / 10 ** dec1;
  const multiplierDigits = maxSafeMultiplierDigits(base, denom);
  const tempMultiplier = 10 ** multiplierDigits;
  const bigNumberTempMultiplier = BigNumber.from(tempMultiplier);
  let bnPrice1 = base.mul(bigNumberTempMultiplier).div(denom);
  let price1 = (bnPrice1.toNumber() / tempMultiplier) * decPercision;
  let price0 = price1 === 0 ? 0 : 1 / price1;
  return [price0, price1];
}

/*
  Reverse the price into the culamtive required to be set in observation

Math:
----------
Tick = Tick0 - tick1 / interval
Sqrt = sqrtFromTick(Tick)
Price = sqrt ^ 2 / 2^192 * decPercision
==>
Price -> div decPer -> * 2^192  -> root -> tickFromSqrt -> * interval
*/
export function priceToTickCulamtive(price: number, intevral: number, dec0: number, dec1: number): BigNumber {
  const denom = BigNumber.from(2).pow(192);
  // we need fractionMultiplier because BigNumbers don't support fractions.
  const fractionMultiplier = price < 1 && price !== 0 ? 1 / price : 1;
  const bnPrice = BigNumber.from(price * fractionMultiplier);
  const decPercision = 10 ** dec0 / 10 ** dec1;
  const sqrt = BNsqrt(bnPrice.mul(denom).div(fractionMultiplier).div(decPercision));
  const tickFromSqrt = getTickAtSqrtRatio(sqrt);
  return tickFromSqrt.mul(intevral);
}

// finds the biggest multiplier that will not cause the BigNumber to overflow which turning back into number
// we need this multiplier to keep BigNumber percision when dividing by the given denom.
function maxSafeMultiplierDigits(bn: BigNumber, denom: BigNumber): number {
  let times = 1;
  while (
    bn
      .mul(10 ** times)
      .div(denom)
      .isZero()
  ) {
    times++;
    //safety breaker:
    if (times >= 14) {
      break;
    }
  }
  const max = BigNumber.from(Number.MAX_SAFE_INTEGER - 1);
  while (
    bn
      .mul(10 ** (times + 1))
      .div(denom)
      .lt(max)
  ) {
    times++;
    //safety breaker:
    if (times >= 15) {
      break;
    }
  }
  return times;
}

function BNsqrt(value: BigNumber): BigNumber {
  return BigNumber.from(new bn(value.toString()).sqrt().toFixed().split(".")[0]);
}

export function numberToStorage(n: BigNumber, pad: number): string {
  const bn = toBN(n);
  const result = bn.toTwos(pad * 4).toString(16, pad) as string;
  if (result.length > pad) {
    throw new Error("overflow - number exceeded storage slots");
  }
  return result;
}

function toBN(value: BigNumber): any {
  const hex = BigNumber.from(value).toHexString();
  if (hex[0] === "-") {
    return new BN("-" + hex.substring(3), 16);
  }
  return new BN(hex.substring(2), 16);
}

export const observationReadable = (observation: any) => {
  const tick = (observation.tickCumulative as BigNumber).toString();
  const splcx128 = (observation.secondsPerLiquidityCumulativeX128 as BigNumber).toString();
  return {
    init: observation.initialized,
    blockTimestamp: observation.blockTimestamp,
    tick: tick,
    splcx128: splcx128,
  };
};

export const observeReadable = (observation: any) => {
  const tick = (observation.tickCumulatives as BigNumber).toString();
  const splcx128 = (observation.secondsPerLiquidityCumulativeX128s as BigNumber).toString();
  return {
    tick: tick,
    splcx128: splcx128,
  };
};
