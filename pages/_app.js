// WAGMI related imports
import { WagmiConfig, configureChains, createClient, chain } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

//WAGMI configuration 
// Dev Mumbai Network
const alchemyId = process.env.ALCHEMY_ID_DEV
// Prod Polygon Network
//const alchemyId = process.env.ALCHEMY_ID


/** Chains to use with wagmi  mumbai for DEV and polygon for PROD*/
// DEV: chain.polygonMumbai
//PROD: chain.polygon
const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai],
  [alchemyProvider({ alchemyId }), publicProvider()],
)
// Wagmi Client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
  ],
  provider,
  webSocketProvider,
})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  )
}

export default MyApp
