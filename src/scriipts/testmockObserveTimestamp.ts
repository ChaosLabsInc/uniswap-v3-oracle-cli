import { BigNumber } from "ethers";
import { UniSwapPoolMocker } from "../mocker/poolmocker";
import { observationReadable, observeReadable } from "../mocker/utils";

const main = async () => {
  const poolAddress = "0x60594a405d53811d3bc4766596efd80fd545a270";
  const rpcURL = "http://localhost:8545";
  const mocker = new UniSwapPoolMocker(rpcURL, poolAddress);
  const pool = mocker.getPoolContract();

  //test:
  const toMock = 100;
  console.log("mock ts to ", toMock);
  let observation0 = await pool.observations([0]);
  console.log("observation 0", observationReadable(observation0));
  await mocker.OverrideObservationTimestamp(toMock, 0);
  observation0 = await pool.observations([0]);
  console.log("observation 0 after override", observationReadable(observation0));
};

main().catch((e) => {
  console.error(e);
});
