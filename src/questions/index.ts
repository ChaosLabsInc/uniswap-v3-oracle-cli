import Utils from "../utils";
const QUESTION_PROMPT_NAMES = {
  CONFIGURABLE_POOLS: "Configurable Price Feeds",
  MOCK_TWAP_INTERVAL_VALUE: "Mock TWAP interval value",
  MOCK_PRICE_VALUE: "Mock price value",
};

export = {
  QUESTION_NAMES: QUESTION_PROMPT_NAMES,
  getConfigurablePoolsQuestion: function getConfigurablePoolsQuestion(choices: Array<string>) {
    return [
      {
        type: "rawlist",
        name: QUESTION_PROMPT_NAMES.CONFIGURABLE_POOLS,
        message: "Select Uniswap pool:",
        choices,
        default: [],
      },
    ];
  },

  getPriceChangeQuestion: function getPriceChangeQuestion() {
    return [
      {
        type: "number",
        name: QUESTION_PROMPT_NAMES.MOCK_PRICE_VALUE,
        message: "Select the new price",
        default: [0],
      },
    ];
  },

  geTwapInterval: function geTwapInterval() {
    return [
      {
        type: "number",
        name: QUESTION_PROMPT_NAMES.MOCK_TWAP_INTERVAL_VALUE,
        message: "Select the TWAP interval you want to change",
        default: [0],
      },
    ];
  },
};
