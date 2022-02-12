import { UniSwapPoolMocker } from "../mocker/poolmocker";

const main = async () => {
  const poolAddress = "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36";
  const rpcURL = "http://localhost:8545";
  const mocker = new UniSwapPoolMocker(rpcURL, poolAddress);

  //test:
  const twapInterval = 100;
  const res = await mocker.prices(twapInterval, 18, 6);
  console.log(res);
};

main().catch((e) => {
  console.error(e);
});
