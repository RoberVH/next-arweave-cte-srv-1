import styles from '../styles/Home.module.css'
import { useAccount, useProvider } from 'wagmi'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/router";
import WebBundlr from "@bundlr-network/client/build/web"
import { utils } from 'ethers'
import BigNumber from 'bignumber.js'
 
const styleButton = {fontFamily:'Menlo', fontSize:'1.3rem', borderRadius:'5px', 
        backgroundColor:'orange', margin: '15px 10px', padding: '5px'}

export default function Home() {
  const [conectado, setConectado] = useState(false);
  const [file, setFile] = useState();
  const [funds, setFunds] = useState();
  const [balance, setBalance] = useState();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const provider = useProvider();
  const myWebBundlr = useRef();

  useEffect(() => {
    setConectado(isConnected);
    if (isConnected) {
      myWebBundlr.current = new WebBundlr(
        'https://devnet.bundlr.network',
        'matic',
        provider
      );
    }
  }, [isConnected, provider]);

  useEffect(() => {
    const getBal = async () => {
      if (isConnected) {
      const bal = await myWebBundlr.current.getLoadedBalance();
      setBalance(utils.formatEther(bal.toString()))
    }
    };
    getBal();
  }, [isConnected]);

  const handleConnectWallet = ()=> {
    router.push('connectwallet')
  }

  
const handleinitBundrl = async() => {
  console.log('client presignedhash')
  const result = await fetch('/api/presignedhash',{method: 'GET'})
  const data = await result.json()
  const presignedHash = Buffer.from(data.presignedHash,'hex')
  console.log('Client presignedHash:', presignedHash)
  const provider = {
    getSigner: () => {
        return {
            signMessage: () => {
                return presignedHash
            }
        }
    }
  }
  const bundlr = new WebBundlr("https://devnet.bundlr.network", "matic", provider);
  await bundlr.ready()
  console.log('bundlr ready:', bundlr.address)

  const tags = [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }];
  const manifest = { "manifest": "arweave/paths", "version": "0.1.0", "paths": { "basten.jpg": { "id": "cu2RWNO8T6t2zZ6f9FTIY5S_GY5A19jWfGp-fKBEAxk" } } }
  const transaction = bundlr.createTransaction(JSON.stringify(manifest), { tags });
  // get signature data
  const signatureData = Buffer.from(await transaction.getSignatureData())
  console.log('signatureData',signatureData)
    // get signed signature
    const signed = await fetch('/api/signdataarweave', {method:'POST',
    headers: {
      'Content-Type': 'application/json'},
    body: JSON.stringify({signaturedata:signatureData}) })
    //const signed = await signDataOnServer(signatureData)

    // write signed signature to transaction
    transaction.getRaw().set(signed, 2)

    // make sure isValid is true - don't worry about isSigned.
    console.log({ isSigned: await transaction.isSigned(), isValid: await transaction.isValid() })
    // upload as normal
    const res = await transaction.upload()
    console.log(res)
}

  const uploadFileServer = ()=> {
  }

  const uploadFileDirectly = async () => {
    // upload file directly from client to arweave through Bundlr

    const price = await myWebBundlr.current.getPrice(file.size);
    console.log('File size:', file.size);
    const precio = utils.formatEther(price.toString());
    console.log('FIle price:', precio);
  };

  function parseInput(input) {
    console.log('Im going to convert');
    const conv = new BigNumber(input).multipliedBy(
      myWebBundlr.current.currencyConfig.base[1]
    );
    console.log('converted:', conv);
    if (conv.isLessThan(1)) {
      console.log('error: value too small');
      return;
    } else {
      return conv;
    }
  }

  const handleFundAccount = async () => {
    if (!funds) {
      alert('Need a valid fund!');
      return;
    }
    //console.log('cta:',await myWebBundlr.current.getBundlerAddress())
    const amountParsed = parseInput(funds);
    console.log('integer funds', amountParsed);
    let response = await myWebBundlr.current.fund(amountParsed);
    console.log('Wallet funded: ', response);
    setBalance();
  };

  // const uploadFileDirectly= async () => {
  //   // upload file directly from client to arweave through Bundlr
    
  //   const price = await myWebBundlr.current.getPrice(file.size);
  //   console.log('File size:', file.size)
  //   console.log('precio crudo', price)

  //   const precio = utils.formatEther(price.toString())
  //   console.log('File price:', precio)
  //   console.log('Precio convertido Webbundlr', await myWebBundlr.current.utils.unitConverter(price))
  //   // check if user has funded enough its account
   
  //   console.log('User balance: ', balance)
  //   if (balance < precio) {
  //     alert(`Error: not enough funds (you have ${balance}, and need at least ${precio}`)
  //   } else {
  //     console.log('funded enough!')
  //   }
  // }


  return (
    <div className={styles.container}>
      <div style={{display:'flex', flexDirection:'column'}}>
      { !conectado ?
      <div>
        <button className={styles.button} onClick={handleConnectWallet} >Connect Wallet</button>
      </div>
        :
        <div >
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <label style={{borderRadius:'5px', margin:'10px 10px', padding:'10px 10px', 
            backgroundColor:'orange',fontFamily:'Liberation Mono', fontSize:'1.3em'}}>Account: &nbsp;{address}
            </label>
            <label style={{borderRadius:'5px', margin:'10px 10px', padding:'10px 10px', 
            backgroundColor:'gold',fontFamily:'Liberation Mono', fontSize:'1.3em'}}>
              Bundlr Balance: {balance}
              </label>
            <button style={styleButton} onClick={handleinitBundrl}>Initialize Bundrl</button>
          </div>
            <div style={{display:'flex' , flexDirection: 'column', alignItems:'center', justifyContent:'start-end' }}>
                <div style={{display:'flex' , flexDirection: 'column', border:'1px solid', padding:'15px 15px'}}>
                  <input style={{
                    margin:'20px', 
                    outline:'solid 1px green',
                    width:'30rem',
                    fontSize:'1.3rem',
                    background:'#6c92bd',
                    color:'white'
                  }} 
                    type='file' 
                    onChange={(e)=>setFile(e.target.files[0])}
                    />
                  <div style={{display:'flex', flexDirection:'row'}}>
                    {console.log('file',file)}
                    <button className={styles.button} onClick={uploadFileServer} >Upload via Server</button>
                    <button className={styles.button} onClick={uploadFileDirectly} >Upload Directly</button>
                  </div>
                  <div style={{display:'flex', justifyContent:'center', margin:'25px'}}>
                    <input type='number' value={funds} 
                      style={{fontSize:'1.3em', height:'1.9em', width:'5em', marginTop:'0.5em', 
                          marginLeft:'2em',marginRight:'2em'}}
                      onChange={(e)=>setFunds(e.currentTarget.value)}>
                      </input>
                    <button className={styles.button} 
                        onClick={handleFundAccount}>
                          Fund account
                      </button>
                  </div>
                  </div>
            </div>
        </div>
       }
      </div>
    </div>
  )
}
