import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError] = useState(null);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return chainId === SEPOLIA_CHAIN_ID;
  }, []);

  const refreshConnectionState = useCallback(
    async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setIsConnected(false);
        setIsCorrectNetwork(false);
        setAddress(null);
        return;
      }

      setAddress(accounts[0]);
      setIsConnected(true);
      setIsCorrectNetwork(await checkNetwork());
    },
    [checkNetwork],
  );

  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      console.error("Error switching to Sepolia:", switchError);
      setError("Please switch MetaMask to the Sepolia test network.");
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const onCorrectNetwork = await checkNetwork();
      if (!onCorrectNetwork) {
        const switched = await switchToSepolia();
        if (!switched) return;
      }

      await refreshConnectionState(accounts);
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      setError("Wallet connection was rejected or failed.");
    }
  }, [checkNetwork, refreshConnectionState, switchToSepolia]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      refreshConnectionState(accounts);
    };

    const handleChainChanged = async () => {
      setIsCorrectNetwork(await checkNetwork());
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork, refreshConnectionState]);

  const getSigner = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask not available");
    const provider = new BrowserProvider(window.ethereum);
    return provider.getSigner();
  }, []);

  const value = {
    address,
    isConnected,
    isCorrectNetwork,
    error,
    connect,
    getSigner,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}