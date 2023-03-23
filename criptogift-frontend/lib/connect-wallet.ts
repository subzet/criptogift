import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";

export async function connectWallet() {
  const providerOptions = {};

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

  const provider = await web3Modal.connect();
  const web3Provider = new Web3Provider(provider);

  return web3Provider;
}
