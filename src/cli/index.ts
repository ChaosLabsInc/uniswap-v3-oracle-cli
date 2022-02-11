import deployer from "../deploy/deploy";
import figlet from "figlet";
import clear from "clear";
import inquirer from "inquirer";
import PriceFeeds from "../chainlink-data-feeds";
import Questions from "../questions";
import Utils from "../utils";

type PriceFeed = {
  pair: string; // '1INCH / ETH'
  proxy: string; // 0xwgmi
};

function contactName(name: string) {
  return "Aggregator" + name;
}

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
  deploy: async function deploy(
    pairSelectionParsed: string,
    priceFeeds: Array<PriceFeed>,
    mockFunction: any,
    initValue: any,
    valueChangeSelection: any,
    tickSelection: any
  ): Promise<void> {
    const selectedPriceFeed = priceFeeds.find((pf: PriceFeed) => pf.pair === pairSelectionParsed);
    if (selectedPriceFeed === undefined) {
      throw new Error("Could not find price feed...");
    }
    const { proxy } = selectedPriceFeed;
    let name = contactName(mockFunction);
    logGreen(
      `Configuring pair proxy ${pairSelectionParsed.substring(
        Number(targetKey(pairSelectionParsed))
      )} at address ${proxy}`
    );
    await deployer.fetchValue(proxy);
    console.log(
      name,
      proxy,
      initValue[QUESTION_NAMES.MOCK_AGGREGATOR_BASE_VALUE],
      valueChangeSelection[QUESTION_NAMES.MOCK_AGGREGATOR_VALUE_CHANGE],
      tickSelection[QUESTION_NAMES.MOCK_AGGREGATOR_CHANGE_PACE]
    );
    await deployer.MockContract(
      name,
      proxy,
      // @ts-ignore
      initValue[QUESTION_NAMES.MOCK_AGGREGATOR_BASE_VALUE],
      // @ts-ignore
      valueChangeSelection[QUESTION_NAMES.MOCK_AGGREGATOR_VALUE_CHANGE],
      // @ts-ignore
      tickSelection[QUESTION_NAMES.MOCK_AGGREGATOR_CHANGE_PACE]
    );
    await deployer.fetchValue(proxy);

    logBlue(`Let's get to work 💼 😏 ...`);
    logYellow(figlet.textSync("Celebrate"));
    logBlue(`You are a shadowy super code 🔥 ✨ 😏 ...`);
  },
};
