import { UniSwapPoolMocker } from "@chaos-labs/uniswap-v3-pool-mocker";
import figlet from "figlet";
import clear from "clear";
import inquirer from "inquirer";
import Questions from "../questions";
import Utils from "../utils";
import { Pool } from "../config/types";

const Pools: Array<Pool> = require("../config/config.json");
const rpcURL = "http://localhost:8545";

const YOU_SELECTED = "You selected ";
const { logBlue, logGreen, logYellow } = Utils;
const { QUESTION_NAMES } = Questions;
const { prompt } = inquirer;

export = {
  welcomeMessage: async function () {
    clear();
    logGreen("🎉 ✨ 🔥 Mocked Uniswap V3 Oracles by: 🎉 ✨ 🔥");
    logBlue(figlet.textSync("Chaos Labs"));
  },
  getPools: async function getPools(): Promise<{
    pools: Array<Pool>;
    inquirerChoices: Array<string>;
  }> {
    const tokenPairsSliced = Pools.map((pool: Pool) => pool.name);
    const inquirerChoices = [...tokenPairsSliced];
    return {
      pools: Pools,
      inquirerChoices,
    };
  },
  selectPool: async function selectTokenPairPrselectPoolicesToMock(): Promise<Pool> {
    const { pools, inquirerChoices } = await this.getPools();
    let poolSelection: any = await prompt(Questions.getConfigurablePoolsQuestion(inquirerChoices));
    let poolNameSelection = poolSelection[QUESTION_NAMES.CONFIGURABLE_POOLS];
    logBlue(YOU_SELECTED + poolNameSelection);
    const pool = pools.find((p) => p.name === poolNameSelection);
    if (pool === undefined) {
      throw new Error("pool selection invalid");
    }
    return pool;
  },
  selectPrice: async function selectPriceChange(): Promise<number> {
    const valueChangeSelection = await prompt(Questions.getPriceChangeQuestion());
    const val =
      valueChangeSelection[QUESTION_NAMES.MOCK_PRICE_VALUE].length > 0
        ? valueChangeSelection[QUESTION_NAMES.MOCK_PRICE_VALUE][0]
        : valueChangeSelection[QUESTION_NAMES.MOCK_PRICE_VALUE];
    logBlue(YOU_SELECTED + val);
    return val;
  },
  selectTwapInterval: async function selectBlockUpdateIntervalSize(): Promise<number> {
    const interval = await prompt(Questions.geTwapInterval());
    const val =
      interval[QUESTION_NAMES.MOCK_TWAP_INTERVAL_VALUE].length > 0
        ? interval[QUESTION_NAMES.MOCK_TWAP_INTERVAL_VALUE][0]
        : interval[QUESTION_NAMES.MOCK_TWAP_INTERVAL_VALUE];
    logBlue(YOU_SELECTED + val);
    return val;
  },
  mock: async function mock(pool: Pool, twapInteraval: number, price: number): Promise<void> {
    try {
      const mocker = new UniSwapPoolMocker(rpcURL, pool.address);

      const originalPrices = await mocker.Prices(twapInteraval, pool.decimals.token0, pool.decimals.token1);
      logBlue(`Original Prices ${originalPrices}`);

      await mocker.MockPrice(price, twapInteraval, pool.decimals.token0, pool.decimals.token1);

      const mockedPrices = await mocker.Prices(twapInteraval, pool.decimals.token0, pool.decimals.token1);
      logBlue(`New Prices ${mockedPrices}`);

      logBlue(`Let's get to work 💼 😏 ...`);
      logYellow(figlet.textSync("Celebrate"));
      logBlue(`You are a shadowy super code 🔥 ✨ 😏 ...`);
    } catch (err) {
      logYellow(`${err}`);
    }
  },
};
