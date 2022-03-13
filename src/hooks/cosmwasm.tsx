// this code taken from:
// https://github.com/Ninja-Chain/flea-app

import { useState } from "react";
import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { connectKeplr } from "../services/keplr";
import { ISigningCosmWasmClientContext } from "./../models/ISigningCosmWasmClientContext";

const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT as string;
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [client, setClient] = useState<CosmWasmClient | null>(null);
  const [signingClient, setSigningClient] = useState<SigningCosmWasmClient | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setLoading(true);

    try {
      connectKeplr();

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID);

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSigner(
        PUBLIC_CHAIN_ID
      );

      // make client
      setClient(await CosmWasmClient.connect(PUBLIC_RPC_ENDPOINT));
      setSigningClient(
        await SigningCosmWasmClient.connectWithSigner(
          PUBLIC_RPC_ENDPOINT,
          offlineSigner
        )
      );

      // get user address
      const [{ address }] = await offlineSigner.getAccounts();
      setWalletAddress(address);

      setLoading(false);
    } catch (error: any) {
      setError(error);
    }
  };

  const disconnect = () => {
    if (signingClient) {
      signingClient.disconnect();
    }
    setWalletAddress("");
    setSigningClient(null);
    setLoading(false);
  };

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
    client,
  };
};
