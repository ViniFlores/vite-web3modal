import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";

import { getAccount, fetchSigner } from "@wagmi/core";
import { Web3Modal } from "@web3modal/html";
import { configureChains, createClient } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";

const chains = [mainnet];
const projectId = "6d9615c65ff477eef9a17f3fcb18d598";

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);
const web3modal = new Web3Modal({ projectId }, ethereumClient);
web3modal.setDefaultChain(mainnet);

//Subscribe to modal state to send messages to the parent window
web3modal.subscribeModal(async (state) => {
  if (state?.open === false) {
    const account = getAccount();
    window.parent.postMessage(
      {
        type: "modal_closed",
        payload: account.address
          ? { address: account.address, type: account.connector.name }
          : null,
      },
      "*"
    );
  }
});

window.onmessage = async (event) => {
  if (event.data.type === "open_modal") {
    web3modal.openModal();
  } else if (event.data.type === "sign_typed_data") {
    const { domain, types, message } = event.data.payload;
    delete types.EIP712Domain;
    const signer = await fetchSigner();
    signer._signTypedData(domain, types, message).then((signature) => {
      window.parent.postMessage(
        {
          type: "sign_typed_data_response",
          payload: signature,
        },
        "*"
      );
    });
  } else if (event.data.type === "sign_message") {
    const message = event.data.payload;
    const signer = await fetchSigner();
    signer.signMessage(message).then((signature) => {
      window.parent.postMessage(
        {
          type: "sign_message_response",
          payload: signature,
        },
        "*"
      );
    });
  } else if (event.data.type === "getAccount") {
    const account = getAccount();
    window.parent.postMessage(
      {
        type: "getAccount_response",
        payload: account.address
          ? { address: account.address, type: account.connector.name }
          : null,
      },
      "*"
    );
  }
};
