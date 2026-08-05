import { useWallet } from "../hooks/useWallet";

/**
 * Shared connect button used on both the application form and the
 * verification upload screen. Displays connection status and a
 * shortened wallet address once connected.
 */
export default function WalletConnectButton() {
  const { address, isConnected, isCorrectNetwork, error, connect } =
    useWallet();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div className="flex flex-col items-start gap-2">
      {!isConnected ? (
        <button
          onClick={connect}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Connect MetaMask
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-sm text-green-800">{shortAddress}</span>
          {!isCorrectNetwork && (
            <span className="text-xs text-red-600">(wrong network)</span>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
