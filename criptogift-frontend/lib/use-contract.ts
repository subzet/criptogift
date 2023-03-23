import { useMemo } from "react";
import { ethers } from "ethers";
import Crowfund from "../../artifacts/contracts/Crowfund.sol/Crowfund.json";

const useContract = (provider: ethers.JsonRpcProvider | null) => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("No contract address found.");
  }

  const contract = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(contractAddress, Crowfund.abi, provider);
  }, [provider, contractAddress]);

  return contract;
};

export default useContract;
