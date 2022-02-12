export type Pool = {
  name: string;
  address: string;
  decimals: {
    token0: number;
    token1: number;
  };
};
