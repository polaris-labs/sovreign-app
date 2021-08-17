import { EPOCH_REWARDS, TOKEN_ADDRESSES } from "@/constants";
import type { ERC20 } from "@/contracts/types";
import { formatUnits } from "@ethersproject/units";
import useSWR from "swr";
import { useTokenContract } from "./useContract";
import useReignPrice from "./useReignPrice";
import useSovPrice from "./useSovPrice";
import useWeb3Store from "./useWeb3Store";

function getWrappingRewardsAPY(sovToken: ERC20) {
  return async (_: string, sovPrice: number, reignPrice: number) => {
    const totalSupply = await sovToken.totalSupply();

    const totalUSDValueSov = parseFloat(formatUnits(totalSupply)) * sovPrice;

    const totalRewards = EPOCH_REWARDS * 52;

    const totalUSDRewards = totalRewards * reignPrice;

    const apy = (totalUSDRewards / totalUSDValueSov) * 100;

    return apy;
  };
}

export default function useWrappingRewardsAPY() {
  const chainId = useWeb3Store((state) => state.chainId);

  const sovToken = useTokenContract(TOKEN_ADDRESSES.SOV[chainId]);

  const { data: sovPrice } = useSovPrice();
  const { data: reignPrice } = useReignPrice();

  const shouldFetch =
    !!sovToken &&
    typeof chainId === "number" &&
    typeof sovPrice === "number" &&
    typeof reignPrice === "number";

  return useSWR(
    shouldFetch ? ["WrappingRewardsAPY", sovPrice, reignPrice, chainId] : null,
    getWrappingRewardsAPY(sovToken)
  );
}
