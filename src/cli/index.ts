import { UniSwapPoolMocker } from "../mocker";
import figlet from "figlet";
import clear from "clear";
import inquirer from "inquirer";
import Pools from "../config/config.json";
import Questions from "../questions";
import Utils from "../utils";

type Pool = {
  name: string;
  address: string;
  decimals: {
    token0: number;
    token1: number;
  };
};

const YOU_SELECTED = "You selected ";
const { targetKey, logBlue, logGreen, logYellow } = Utils;
const { QUESTION_NAMES } = Questions;
const { prompt } = inquirer;

export = {
  welcomeMessage: async function () {
    clear();
    logGreen("🎉 ✨ 🔥 Mocked Chainlink Oracles by: 🎉 ✨ 🔥");
    logBlue(figlet.textSync("Chaos Labs"));
  },
  getEthereumProxiesForNetwork: async function getEthereumProxiesForNetwork(): Promise<{
    priceFeeds: Array<any>;
    inquirerChoices: Array<string>;
  }> {
    const priceFeeds = await PriceFeeds.getEthereumProxiesForNetwork();
    const tokenPairsSliced = priceFeeds.map((pair: any) => `${pair.pair}`);
    const inquirerChoices = [
      ...tokenPairsSliced.slice(0, 4),
      QUESTION_NAMES.VIEW_FULL_LIST,
      QUESTION_NAMES.SEARCH_TOKEN_PAIR,
    ];
    return {
      priceFeeds,
      inquirerChoices,
    };
  },
  selectTokenPairPricesToMock: async function selectTokenPairPricesToMock(): Promise<{
    pairSelectionParsed: string;
    priceFeeds: Array<any>;
  }> {
    const { priceFeeds, inquirerChoices } = await this.getEthereumProxiesForNetwork();
    let pairSelection: any = await prompt(Questions.getConfigurablePriceFeedsQuestion(inquirerChoices));
    let pairSelectionParsed = pairSelection[QUESTION_NAMES.CONFIGURABLE_FEEDS];

    if (QUESTION_NAMES.VIEW_FULL_LIST === pairSelectionParsed) {
      pairSelection = await prompt<number>(Questions.getAllPriceFeedsQuestion(priceFeeds.map((pf) => pf.pair)));
      pairSelectionParsed = pairSelection[QUESTION_NAMES.CONFIGURABLE_FEEDS];
      return { pairSelectionParsed, priceFeeds };
    } else if (QUESTION_NAMES.SEARCH_TOKEN_PAIR === pairSelectionParsed) {
      let searchedTickerSelection = await prompt(Questions.getTokenPairSearchValue());
      let parsedQuery = searchedTickerSelection[QUESTION_NAMES.SEARCH_TOKEN_PAIR];
      const filteredFeeds = priceFeeds.filter((pf) => {
        return pf.pair.toLowerCase().includes(parsedQuery.toLowerCase());
      });
      return this.selectTokenPairFiltered(filteredFeeds);
    }

    logBlue(YOU_SELECTED + pairSelectionParsed);
    return { pairSelectionParsed, priceFeeds };
  },
  selectAllTokenPairs: async function selectAllTokenPairs(providedFeeds: Array<any>): Promise<{
    pairSelectionParsed: string;
    priceFeeds: Array<any>;
  }> {
    const parsedArr = providedFeeds.map((pf) => pf.pair);
    let pairSelection: any = await prompt(Questions.getConfigurablePriceFeedsQuestion(parsedArr));
    let pairSelectionParsed = pairSelection[QUESTION_NAMES.CONFIGURABLE_FEEDS];
    return {
      pairSelectionParsed,
      priceFeeds: providedFeeds,
    };
  },
  selectTokenPairFiltered: async function selectTokenPairFiltered(providedFeeds: Array<any>): Promise<{
    pairSelectionParsed: string;
    priceFeeds: Array<any>;
  }> {
    const parsedArr = providedFeeds.map((pf) => pf.pair);
    let pairSelection: any = await prompt(Questions.getConfigurablePriceFeedsQuestion(parsedArr));
    let pairSelectionParsed = pairSelection[QUESTION_NAMES.CONFIGURABLE_FEEDS];
    return {
      pairSelectionParsed,
      priceFeeds: providedFeeds,
    };
  },
  selectMockFunction: async function selectMockFunction(): Promise<any> {
    const mockFnSelection: any = await prompt(Questions.getMockFunctionQuestion());
    logBlue(YOU_SELECTED + mockFnSelection[QUESTION_NAMES.MOCK_AGGREGATOR_SELECTION]);
    return mockFnSelection[QUESTION_NAMES.MOCK_AGGREGATOR_SELECTION];
  },
  selectInitialValue: async function selectInitialValue(): Promise<any> {
    const initValue = await prompt(Questions.getSelectInitialValueQuestion());
    logBlue(YOU_SELECTED + initValue[QUESTION_NAMES.MOCK_AGGREGATOR_BASE_VALUE]);
    return initValue;
  },
  selectPriceChange: async function selectPriceChange(): Promise<any> {
    const valueChangeSelection = await prompt(Questions.getPriceChangeQuestion());
    logBlue(YOU_SELECTED + valueChangeSelection[QUESTION_NAMES.MOCK_AGGREGATOR_VALUE_CHANGE]);
    return valueChangeSelection;
  },
  selectBlockUpdateIntervalSize: async function selectBlockUpdateIntervalSize(): Promise<any> {
    const blockUpdate = await prompt(Questions.getPriceChangeFrequency());
    logBlue(YOU_SELECTED + blockUpdate[QUESTION_NAMES.MOCK_AGGREGATOR_CHANGE_PACE]);
    return blockUpdate;
  },
  mock: async function mock(pool: Pool, twapInteraval: number, price: number): Promise<void> {
    const rpcURL = "http://localhost:8545";
    const mocker = new UniSwapPoolMocker(rpcURL, pool.address);

    const originalPrices = await mocker.prices(twapInteraval, 18, 6);
    logBlue(`Original Prices ${originalPrices}`);

    await mocker.MockPrice(price, twapInteraval, pool.decimals.token0, pool.decimals.token1);

    logBlue(`Let's get to work 💼 😏 ...`);
    logYellow(figlet.textSync("Celebrate"));
    logBlue(`You are a shadowy super code 🔥 ✨ 😏 ...`);
  },
};
