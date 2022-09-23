// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { serverInit } from "../../web3/arweave/bundlrsrv"



export default async function handler(req, res) {
  console.log('En signdataarweave')
  console.log('req',req.body)
  
//const signedData =  signDataOnServer(signatureData) 
  
  
  res.status(200).json({ msg:'ok' })
}