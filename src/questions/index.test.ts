import Questions from "./index";
const QUESTION_TEST_SUITE = "QUESTION_TEST_SUITE ";

test(`${QUESTION_TEST_SUITE} - getConfigurablePriceFeedsQuestion`, () => {
  const configPFQuestions = Questions.getConfigurablePriceFeedsQuestion([]);
  expect(configPFQuestions.length).toBeGreaterThan(0);
  expect(configPFQuestions[0]).toMatchObject({
    type: "rawlist",
    name: Questions.QUESTION_NAMES.CONFIGURABLE_FEEDS,
    message: "Select price feed:",
    choices: [],
    default: [],
  });
});

test(`${QUESTION_TEST_SUITE} - getAllPriceFeedsQuestion`, () => {
  const PFQuestions = Questions.getAllPriceFeedsQuestion(["abc"]);
  expect(PFQuestions.length).toBeGreaterThan(0);
  expect(PFQuestions[0]).toMatchObject({
    type: "rawlist",
    name: Questions.QUESTION_NAMES.CONFIGURABLE_FEEDS,
    message: "All price feeds:",
    choices: ["abc"],
  });
});

test(`${QUESTION_TEST_SUITE} - getSelectInitialValueQuestion`, () => {
  const initValQuestions = Questions.getSelectInitialValueQuestion();
  expect(initValQuestions.length).toBeGreaterThan(0);
  expect(initValQuestions[0]).toMatchObject({
    type: "number",
    name: Questions.QUESTION_NAMES.MOCK_AGGREGATOR_BASE_VALUE,
    message: "Select intial value of mock",
    default: [0], //TODO - current value retrieved.
  });
});

test(`${QUESTION_TEST_SUITE} - getPriceChangeQuestion`, () => {
  const priceChangeQuestion = Questions.getPriceChangeQuestion();
  expect(priceChangeQuestion.length).toBeGreaterThan(0);
  expect(priceChangeQuestion[0]).toMatchObject({
    type: "number",
    name: Questions.QUESTION_NAMES.MOCK_AGGREGATOR_VALUE_CHANGE,
    message: "Select the change in price each tick",
    default: [0],
  });
});

test(`${QUESTION_TEST_SUITE} - getPriceChangeFrequency`, () => {
  const priceChangeFrequencyQuestion = Questions.getPriceChangeFrequency();
  expect(priceChangeFrequencyQuestion.length).toBeGreaterThan(0);
  expect(priceChangeFrequencyQuestion[0]).toMatchObject({
    type: "number",
    name: Questions.QUESTION_NAMES.MOCK_AGGREGATOR_CHANGE_PACE,
    message: "Select price update frequency - counted in mined blocks ",
    default: [0],
  });
});

test(`${QUESTION_TEST_SUITE} - getMockFunctionQuestion `, () => {
  const mockFNQuestion = Questions.getMockFunctionQuestion();
  expect(mockFNQuestion.length).toBeGreaterThan(0);
  expect(mockFNQuestion[0]).toMatchObject({
    type: "list",
    name: Questions.QUESTION_NAMES.MOCK_AGGREGATOR_SELECTION,
    message: "Select a function for the Mock Oracle",
    choices: ["Constant", "Incremental", "Volatile", "Original"],
    default: [],
  });
});
