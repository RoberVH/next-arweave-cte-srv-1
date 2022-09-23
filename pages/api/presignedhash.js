// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { serverBundlr,  printBalance, presignedHash ,serverInit } from "../../web3/arweave/bundlrsrv"



export default async function handler(req, res) {
  await serverInit()
  await printBalance()
  console.log('Server presignedHash',presignedHash)
  res.status(200).send( {presignedHash} )
}
