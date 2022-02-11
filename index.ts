import cli from "./src/cli";

async function main() {
  await cli.welcomeMessage();
  const { pairSelectionParsed, priceFeeds } = await cli.selectTokenPairPricesToMock();
  const mockFunction = await cli.selectMockFunction();
  const initialValue = await cli.selectInitialValue();
  const priceChange = await cli.selectPriceChange();
  const blockUpdateInterval = await cli.selectBlockUpdateIntervalSize();
  await cli.deploy(pairSelectionParsed, priceFeeds, mockFunction, initialValue, priceChange, blockUpdateInterval);
}

main();
