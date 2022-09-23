/**
 * Bundlr Client utilities. This module has server bundlr methods that call Bundlr Api to upload files
 * to arweave from web browser
*/

async function clientSide() {
    // public key is stored/provided to the client. 
    // this should be done in a HTTP request, or the key can be hardcoded.
    const presignedHash = await serverInit()
    // mock provider
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
    console.log(bundlr.address)
    //tags
    const tags = [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }];
    // example data (manifest)
    const manifest = { "manifest": "arweave/paths", "version": "0.1.0", "paths": { "basten.jpg": { "id": "cu2RWNO8T6t2zZ6f9FTIY5S_GY5A19jWfGp-fKBEAxk" } } }
    const transaction = bundlr.createTransaction(JSON.stringify(manifest), { tags });
    // get signature data
    const signatureData = Buffer.from(await transaction.getSignatureData())

    // get signed signature
    const signed = await signDataOnServer(signatureData)

    // write signed signature to transaction
    transaction.getRaw().set(signed, 2)

    // make sure isValid is true - don't worry about isSigned.
    console.log({ isSigned: await transaction.isSigned(), isValid: await transaction.isValid() })
    // upload as normal
    const res = await transaction.upload()
    console.log(res)
}
clientSide()