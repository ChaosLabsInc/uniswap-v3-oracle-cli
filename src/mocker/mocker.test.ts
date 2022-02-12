import { UniSwapPoolMocker } from "./index";
import { Pool } from "../config/types";
import { BigNumber } from "ethers";

const Pools: Array<Pool> = require("../config/config.json");
const rpcURL = "http://localhost:8545";

jest.setTimeout(60 * 1000);

test(`mocker`, async () => {
  const pool = Pools[0];
  const mocker = new UniSwapPoolMocker(rpcURL, pool.address);
  const poolContract = mocker.getPoolContract();

  try {
    await poolContract.observations([0]);
  } catch (e) {
    throw new Error("Cannot connect to local fork on 8545. This test requires a lock fork running.");
  }

  //slot0 tick:
  await mocker.OverrideSlot0Tick(1);
  const slot0 = await mocker.Slot0();
  expect(slot0.tick).toEqual(1);

  //observation tick:
  await mocker.OverrideObservationTick(BigNumber.from(2), 0);
  let observation0 = await poolContract.observations([0]);
  const tick0 = (observation0.tickCumulative as BigNumber).toString();
  expect(tick0).toEqual("2");

  //observation timestamp:
  await mocker.OverrideObservationTimestamp(3, 0);
  observation0 = await poolContract.observations([0]);
  expect(observation0.blockTimestamp).toEqual(3);

  //mock price:
  const twapInterval = 100;
  const price = 4;
  await mocker.MockPrice(price, twapInterval, pool.decimals.token0, pool.decimals.token1);
  const prices = await mocker.prices(twapInterval, pool.decimals.token0, pool.decimals.token1);
  expect(prices[1]).toBeGreaterThan(price - 0.1);
  expect(prices[1]).toBeLessThan(price + 0.1);
  expect(prices[0]).toBeGreaterThan(1 / (price + 0.1));
  expect(prices[0]).toBeLessThan(1 / (price - 0.1));
});

test(`mocker 2`, async () => {
  const pool = Pools[1];
  const mocker = new UniSwapPoolMocker(rpcURL, pool.address);
  const poolContract = mocker.getPoolContract();

  try {
    await poolContract.observations([0]);
  } catch (e) {
    throw new Error("Cannot connect to local fork on 8545. This test requires a lock fork running.");
  }

  //mock price:
  const twapInterval = 200;
  const price = 1055;
  await mocker.MockPrice(price, twapInterval, pool.decimals.token0, pool.decimals.token1);
  const prices = await mocker.prices(twapInterval, pool.decimals.token0, pool.decimals.token1);
  expect(prices[1]).toBeGreaterThan(price - 0.1);
  expect(prices[1]).toBeLessThan(price + 0.1);
  expect(prices[0]).toBeGreaterThan(1 / (price + 0.1));
  expect(prices[0]).toBeLessThan(1 / (price - 0.1));
});
