import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/html'
import { configureChains, createClient } from '@wagmi/core'
import { arbitrum, mainnet, polygon } from '@wagmi/core/chains'

const chains = [arbitrum, mainnet, polygon]
const projectId = '6d9615c65ff477eef9a17f3fcb18d598'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
console.log(w3mConnectors({ projectId, version: 1, chains }))
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)
const web3modal = new Web3Modal({ projectId }, ethereumClient)

window.onmessage = (event) => {
  if (event.data === 'open_modal') {
    web3modal.openModal()
  }
}