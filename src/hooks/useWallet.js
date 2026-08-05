import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

// Sepolia testnet chain ID (decimal 11155111 = hex 0xaa36a7)
const SEPOLIA_CHAIN_ID = "0xaa36a7";

/**
 * Custom hook that manages MetaMask connection state.
 * Any component (ApplicationForm, VerificationUpload, etc.) can call
 * this hook to get the current wallet address, connection status,
 * and whether the user is on the correct network (Sepolia).
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError] = useState(null);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return chainId === SEPOLIA_CHAIN_ID;
  }, []);

  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // Error code 4902 means the chain hasn't been added to MetaMask yet
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

      setAddress(accounts[0]);
      setIsConnected(true);
      setIsCorrectNetwork(true);
    } catch (err) {
      setError("Wallet connection was rejected or failed.");
    }
  }, [checkNetwork, switchToSepolia]);

  // React to the user switching accounts or networks inside MetaMask
  // without reloading the page — keeps our state accurate at all times.
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress(null);
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = async () => {
      const onCorrectNetwork = await checkNetwork();
      setIsCorrectNetwork(onCorrectNetwork);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork]);

  // Helper for other components (PaymentButton) to get a signer for
  // sending transactions, without duplicating provider setup logic.
  const getSigner = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask not available");
    const provider = new BrowserProvider(window.ethereum);
    return provider.getSigner();
  }, []);

  return { address, isConnected, isCorrectNetwork, error, connect, getSigner };
}
