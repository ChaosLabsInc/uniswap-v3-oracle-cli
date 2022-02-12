import { UniSwapPoolMocker } from "../mocker/poolmocker";
import { observationReadable, observeReadable } from "../mocker/utils";

const main = async () => {
  const poolAddress = "0x60594a405d53811d3bc4766596efd80fd545a270";
  const rpcURL = "http://localhost:8545";
  const mocker = new UniSwapPoolMocker(rpcURL, poolAddress);
  const pool = mocker.getPoolContract();

  //test:
  let slot0 = await pool.slot0();
  console.log("slot0", slot0);
  await mocker.OverrideSlot0Tick(0);
  slot0 = await pool.slot0();
  console.log("slot0 after override", slot0);
};

main().catch((e) => {
  console.error(e);
});
