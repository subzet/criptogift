import { useState, useEffect } from "react";
import { ethers } from "ethers";
import useContract from "../lib/use-contract";
import { connectWallet } from "../lib/connect-wallet";

const IndexPage = () => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const contract = useContract(provider);

  const [deadline, setDeadline] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const connectToWallet = async () => {
    const connectedProvider = await connectWallet();
    const signer = await connectedProvider.getSigner();
    const connectedAccount = await signer.getAddress();
    setProvider(connectedProvider);
    setAccount(connectedAccount);
  };

  const createBirthdayVault = async () => {
    if (!contract || !account) return;

    const signer = await provider!.getSigner();
    const contractWithSigner = contract.connect(signer) as any;
    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
    await contractWithSigner.createProject(deadlineTimestamp, receiver);
    alert("Birthday vault created!");
  };

  const deposit = async () => {
    if (!contract || !account) return;

    const signer = await provider!.getSigner();
    const contractWithSigner = contract.connect(signer) as any;
    const value = ethers.parseEther(amount);
    await contractWithSigner.contribute(receiver, { value });
    alert("Deposited successfully!");
  };

  return (
    <div>
      <h1>Birthday Vault</h1>
      {!account ? (
        <button onClick={connectToWallet}>Connect Wallet</button>
      ) : (
        <>
          <h2>Create Birthday Vault</h2>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Deadline"
          />
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Receiver"
          />
          <button onClick={createBirthdayVault}>Create</button>

          <h2>Deposit Ether</h2>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (ETH)"
          />
          <button onClick={deposit}>Deposit</button>
        </>
      )}
    </div>
  );
};

export default IndexPage;
