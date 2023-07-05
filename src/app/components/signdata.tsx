import { CIP30ProviderProxy } from "kuber-client";
import React, { useState } from "react";
import { getPublicKeyFromCoseKey, CoseSign1 } from "@stricahq/cip08";

const buffer_1 = require("buffer");
const cbors_1 = require("@stricahq/cbors");

interface SignDataProps {
  connectedWallet: CIP30ProviderProxy;
}

const SignData: React.FC<SignDataProps> = ({ connectedWallet }) => {
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    signMyData(inputValue);
  };
  async function signMyData(data: any) {
    try {
      const wallet = (await connectedWallet.enable()).instance;
      const usedAddress = await wallet.getUsedAddresses();
      console.log(usedAddress[0]);
      const rewardAddress = await wallet.getRewardAddresses();
      const hexData = data
        .split("")
        .map((c) => c.charCodeAt().toString(16))
        .join("");
      const signResponse = await wallet.signData(usedAddress[0], hexData);
      console.log("Signature Response: " + JSON.stringify(signResponse));
      decodeSignature(signResponse?.signature, signResponse?.key);
      setInputValue("");
      setTransactionSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function decodeSignature(sig: string, key: string) {
    const decoded = cbors_1.Decoder.decode(buffer_1.Buffer.from(sig, "hex"));
    const externalAad = buffer_1.Buffer.alloc(0);
    const protectedSerialized = decoded.value[0];
    const payload = decoded.value[2];
    const structure = ["Signature1", protectedSerialized, externalAad, payload];
    const createSigStructure = cbors_1.Encoder.encode(structure);
    const decodedSignature = decoded.value[3];
    const publicKeyBuffer = getPublicKeyFromCoseKey(key);
    console.log("payload: ", payload.toString("hex"));
    console.log("publicKey: ", publicKeyBuffer.toString("hex"));
    console.log("message: ", createSigStructure.toString("hex"));
    console.log("signature: ", decodedSignature.toString("hex"));
  }

  return (
    <div className="userAssets">
      <form onSubmit={handleFormSubmit} className="form-style">
        <input type="text" value={inputValue} onChange={handleInputChange} />
        {connectedWallet != null ? (
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            SIGN DATA
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
          >
            Please Connect Wallet First
          </button>
        )}
      </form>
      {transactionSubmitted && (
        <div className="text-white">{transactionSubmitted.toString()}</div>
      )}
    </div>
  );
};

export default SignData;
