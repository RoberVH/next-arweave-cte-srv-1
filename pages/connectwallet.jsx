/*
  Page /connectWallet - Presents connection buttons from WAGMI library showing options to connect a wallet
                    handle showing connecting error or set 
 */
import { useState, useEffect } from 'react'
import { useConnect, useAccount } from "wagmi";
import { useRouter } from "next/router";



export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  return mounted;
};


function ConnectWallet() {
  const isMounted = useIsMounted()
  const router = useRouter()
  const { connector: activeConnector, isConnected } = useAccount()
  const {  connect, connectors, error,  isLoading, pendingConnector } =  useConnect()

  const buttonstyle="bg-orange-500 font-black text-md uppercase text-white w-[200px] rounded-xl my-4 py-2 px-4 hover:bg-stone-400 "


  useEffect(() => {
    if (error && error.message) {
      console.log('error conexion', error.message)
    }
  }, [error]);


  useEffect ( ()=> {
    //console.log('ConnectWallet isConnected',isConnected)
    if (isConnected)  {
          router.push('/')
        }
  }, [isConnected, router])

  // This component is a cut and pastefrom another app I have, just let the tailwind classes there
  return (
    <div className="container flex justify-center backgroundColor:'orange' ">
      <div id="connect-panel" className="container bg-stone-100  px-4   rounded-xl shadow-xl 
          flex flex-col m-4 w-2/4 min-h-[350px] justify-center items-center 
          overflow-y-auto">
        <div className="grid grid-cols-2 divide-x-4 divide-stone-300">
          <div className=" mr-4  p-4 rounded-xl overflow-hidden shrink-0 ">
              <p className="pb-4 border-b-2 border-orange-400">Connect</p>
              <p className=" text-stone-700 pt-4">Connect Wallet</p>
          </div>
          <div className="pl-12 flex flex-col">
            {connectors.map((connector) => (
              <button className={buttonstyle}
              
              disabled={isMounted ? !connector.ready : false}
              key={connector.id}
              // onClick={() => connect({connector})}
              onClick={() => connect({connector})}
              >
                {isMounted ? connector.name : connector.id === 'Injected' ? connector.id : connector.name}
                {isMounted ? !connector.ready && ' (unsupported)' : ''}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  '(connecting)'}
              </button>
            ))}
            </div>
          </div>
      </div>
    </div>
  )
}


export default ConnectWallet