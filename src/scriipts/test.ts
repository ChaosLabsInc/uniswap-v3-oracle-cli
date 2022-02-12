import { UniSwapPoolMocker } from "../mocker/poolmocker";
import { observationReadable } from "../mocker/utils";

const main = async () => {
  const poolAddress = "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36";
  const rpcURL = "http://localhost:8545";
  const mocker = new UniSwapPoolMocker(rpcURL, poolAddress);

  //test:
  const twapInterval = 420;

  let res = await mocker.prices(twapInterval, 18, 6);
  console.log(res);

  await mocker.MockPrice(69, twapInterval, 18, 6);

  res = await mocker.prices(twapInterval, 18, 6);
  console.log("prices", res);
};

main().catch((e) => {
  console.error(e);
});
