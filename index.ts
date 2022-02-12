import cli from "./src/cli";

async function main() {
  await cli.welcomeMessage();
  const pool = await cli.selectPool();
  const price = await cli.selectPrice();
  const twapInterval = await cli.selectTwapInterval();
  console.log(pool, price, twapInterval);
  await cli.mock(pool, twapInterval, price);
}

main();
