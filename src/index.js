import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";

import { getAccount, fetchSigner } from "@wagmi/core";
import { Web3Modal } from "@web3modal/html";
import { configureChains, createClient } from "@wagmi/core";
import { arbitrum } from "@wagmi/core/chains";

const chains = [arbitrum];
const projectId = "6d9615c65ff477eef9a17f3fcb18d598";

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);
const web3modal = new Web3Modal({ projectId }, ethereumClient);
web3modal.setDefaultChain(arbitrum);

//Subscribe to modal state to send messages to the parent window
web3modal.subscribeModal((state) => {
  if (state?.open === "false")
    window.parent.postMessage(
      { type: "modal_closed", payload: getAccount() },
      "*"
    );
});

window.onmessage = (event) => {
  console.log("Message Received: ", event.data);
  if (event.data.type === "open_modal") {
    web3modal.openModal();
  }
};

window.webmodal = web3modal;
