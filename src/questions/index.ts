import Utils from "../utils";
const QUESTION_PROMPT_NAMES = {
  CONFIGURABLE_FEEDS: "Configurable Price Feeds",
  MOCK_AGGREGATOR_SELECTION: "Mock Aggregator Selection",
  MOCK_AGGREGATOR_BASE_VALUE: "Mock Intial Value",
  SEARCH_TOKEN_PAIR: "Search by ticker",
  VIEW_FULL_LIST: "View full list",
  MOCK_AGGREGATOR_VALUE_CHANGE: "Mock Value Change",
  MOCK_AGGREGATOR_CHANGE_PACE: "Mock Change Pace",
};

const { targetKey } = Utils;

export = {
  QUESTION_NAMES: QUESTION_PROMPT_NAMES,
  getConfigurablePriceFeedsQuestion: function getConfigurablePriceFeedsQuestion(choices: Array<string>) {
    return [
      {
        type: "rawlist",
        name: QUESTION_PROMPT_NAMES.CONFIGURABLE_FEEDS,
        message: "Select price feed:",
        choices,
        default: [],
      },
    ];
  },
  getAllPriceFeedsQuestion: function getAllPriceFeedsQuestion(tokenPairsSliced: Array<string>) {
    return [
      {
        type: "rawlist",
        name: QUESTION_PROMPT_NAMES.CONFIGURABLE_FEEDS,
        message: "All price feeds:",
        choices: tokenPairsSliced,
      },
    ];
  },
  getSelectInitialValueQuestion: function getSelectInitialValueQuestion() {
    return [
      {
        type: "number",
        name: QUESTION_PROMPT_NAMES.MOCK_AGGREGATOR_BASE_VALUE,
        message: "Select intial value of mock",
        default: [0], //TODO - current value retrieved.
      },
    ];
  },
  getTokenPairSearchValue: function getTokenPairSearchValue() {
    return [
      {
        type: "string",
        name: QUESTION_PROMPT_NAMES.SEARCH_TOKEN_PAIR,
        message: "Type token ticker",
        default: "",
      },
    ];
  },
  getPriceChangeQuestion: function getPriceChangeQuestion() {
    return [
      {
        type: "number",
        name: QUESTION_PROMPT_NAMES.MOCK_AGGREGATOR_VALUE_CHANGE,
        message: "Select the change in price each tick",
        default: [0],
      },
    ];
  },
  getPriceChangeFrequency: function getPriceChangeFrequency() {
    return [
      {
        type: "number",
        name: QUESTION_PROMPT_NAMES.MOCK_AGGREGATOR_CHANGE_PACE,
        message: "Select price update frequency - counted in mined blocks ",
        default: [0],
      },
    ];
  },
  getMockFunctionQuestion: function getMockFunctionQuestion() {
    return [
      {
        type: "list",
        name: QUESTION_PROMPT_NAMES.MOCK_AGGREGATOR_SELECTION,
        message: "Select a function for the Mock Oracle",
        choices: ["Constant", "Incremental", "Volatile", "Original"],
        default: [],
      },
    ];
  },
  showAllPriceFeedsSelected: function showAllPriceFeedsSelected(pairSelectionParsed: string) {
    return targetKey(pairSelectionParsed) == "6";
  },
  showSearchPriceFeedsSelected: function showSearchPriceFeedsSelected(pairSelectionParsed: string) {
    return targetKey(pairSelectionParsed) == "7";
  },
};
