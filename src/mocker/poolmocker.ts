import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ethers, BigNumber } from "ethers";
import { numberToStorage, priceToTickCulamtive, observationReadable } from "./utils";
import { sqrtPriceX96ToTokenPrices, getSqrtRatioAtTick } from "./utils";

const TickBaseMultiplier = 1.0001;
// https://jeancvllr.medium.com/solidity-tutorial-all-about-bytes-9d88fdb22676

export interface Observation {
  blockTimestamp: number;
  tickCumulative: BigNumber;
  secondsPerLiquidityCumulativeX128: BigNumber;
  initialized: boolean;
}

export interface Slot0 {
  tick: number;
  sqrtPriceX96: BigNumber;
  observationIndex: number;
  observationCardinality: number;
}

export class UniSwapPoolMocker {
  private provider;
  private poolAddress: string;
  private contract: ethers.Contract;
  private observations: Observation[];
  private isCleared: boolean;
  private slot0: Slot0 | undefined;

  constructor(rpcURL: string, poolAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcURL);
    this.poolAddress = poolAddress;
    this.contract = new ethers.Contract(this.poolAddress, IUniswapV3PoolABI, this.provider);
    this.observations = [];
    this.isCleared = false;
    this.slot0 = undefined;
  }

  getPoolContract(): ethers.Contract {
    return this.contract;
  }

  async OverrideSlot0Tick(n: number): Promise<string> {
    const st = (await this.provider.send("eth_getStorageAt", [this.poolAddress, "0x0"])) as string;
    if (n > 16777216 - 1) {
      throw new Error("number to big");
    }
    const hex = numberToStorage(BigNumber.from(n), 6);
    const newSt = st.slice(0, 20) + hex + st.slice(-40);
    await this.provider.send("hardhat_setStorageAt", [this.poolAddress, "0x0", newSt]);
    return newSt;
  }

  async OverrideObservationTick(n: BigNumber, index: number): Promise<string> {
    const slot = 8 + index;
    const add = `0x${slot.toString(16)}`;
    const st = (await this.provider.send("eth_getStorageAt", [this.poolAddress, add])) as string;
    const tickHex = numberToStorage(n, 14);
    const newSt = "0x" + st.slice(2, 44) + tickHex + st.slice(-8);
    await this.provider.send("hardhat_setStorageAt", [this.poolAddress, add, newSt]);
    return newSt;
  }

  async OverrideObservationTimestamp(ts: number, index: number): Promise<string> {
    const slot = 8 + index;
    const add = `0x${slot.toString(16)}`;
    const st = (await this.provider.send("eth_getStorageAt", [this.poolAddress, add])) as string;
    const tsHex = numberToStorage(BigNumber.from(ts), 8);
    const newSt = "0x" + st.slice(2, 58) + tsHex;
    await this.provider.send("hardhat_setStorageAt", [this.poolAddress, add, newSt]);
    return newSt;
  }

  async setObeservations() {
    const pool = this.getPoolContract();
    const slot0 = await pool.slot0();
    const obs: Observation[] = [];
    for (let i = 0; i < slot0.observationCardinality; i++) {
      const ob = (await pool.observations(i)) as Observation;
      obs.push(ob);
    }
    this.observations = obs;
  }

  async getCurrentBlockTS(): Promise<number> {
    const currentBlock = await this.provider.getBlock("latest");
    return currentBlock.timestamp;
  }

  async MockPrice(price: number, twapInterval: number, dec0: number, dec1: number): Promise<void> {
    if (twapInterval === 0) {
      const tickCul = priceToTickCulamtive(price, 1, dec0, dec1);
      await this.OverrideSlot0Tick(tickCul.toNumber());
      return;
    }
    await this.clearAllObservationTicks();
    const ts = await this.getCurrentBlockTS();
    const ob0Index = this.slot0?.observationIndex as number;
    const ob1Index = this.nearestObervation(ts - twapInterval);
    if (ob0Index !== ob1Index) {
      //different blocks:
      const tickCul = priceToTickCulamtive(price, twapInterval, dec0, dec1);
      await this.OverrideObservationTick(tickCul, ob0Index);
    } else {
      //same block - all that matters is the delta -> slot0.tick:
      const tickCul = priceToTickCulamtive(price, 1, dec0, dec1);
      await this.OverrideSlot0Tick(tickCul.toNumber());
    }
  }

  nearestObervation(currentTS: number): number {
    if (this.observations.length === 0) {
      throw new Error("observations not init");
    }
    let delta = currentTS;
    let index = 0;
    this.observations.forEach((ob, i) => {
      const nextDelta = Math.abs(ob.blockTimestamp - currentTS);
      if (nextDelta < delta) {
        delta = nextDelta;
        index = i;
      }
    });
    return index;
  }

  async Slot0(): Promise<Slot0> {
    if (this.slot0 !== undefined) {
      return this.slot0;
    }
    const pool = this.getPoolContract();
    const slot0 = await pool.slot0();
    this.slot0 = slot0;
    return slot0;
  }

  async clearAllObservationTicks(): Promise<void> {
    const slot0 = await this.Slot0();
    for (let i = 0; i < slot0.observationCardinality; i++) {
      await this.OverrideObservationTick(BigNumber.from(i), i);
    }
    this.isCleared = true;
    await this.setObeservations();
    await this.OverrideSlot0Tick(0);
  }

  async getLatestObsevationIndex(): Promise<number> {
    const slot = await this.Slot0();
    return slot.observationIndex as number;
  }

  async TwapTicks(twapInterval: number): Promise<Array<BigNumber>> {
    const pool = this.getPoolContract();
    const ovservations = await pool.observe([0, twapInterval]);
    const tick0 = ovservations.tickCumulatives[0] as BigNumber;
    const tick1 = ovservations.tickCumulatives[1] as BigNumber;
    return [tick0, tick1];
  }

  async tick(twapInterval: number): Promise<BigNumber> {
    if (twapInterval === 0) {
      const slot0 = await this.getPoolContract().slot0();
      return BigNumber.from(slot0.tick);
    }
    const ticks = await this.TwapTicks(twapInterval);
    // console.log("ticks", ticks[0].toString(), ticks[1].toString());
    let tick = ticks[0].sub(ticks[1]).div(twapInterval);
    return tick;
  }

  async prices(twapInterval: number, dec0: number, dec1: number): Promise<number[]> {
    const tick = await this.tick(twapInterval);
    let sqtPrice = getSqrtRatioAtTick(tick.toNumber());
    const prices = sqrtPriceX96ToTokenPrices(sqtPrice, dec0, dec1);
    return prices;
  }
}
