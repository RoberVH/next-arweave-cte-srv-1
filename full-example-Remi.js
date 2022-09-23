// Server code
// back-end nodejs
let serverBundlr;
let presignedHash;

async function serverInit() {
  const key = process.env.PRIVATE_KEY; // your private key
  serverBundlr = new Bundlr("https://devnet.bundlr.network", "matic", key);
  console.log(serverBundlr.address);

  presignedHash = Buffer.from(
    await serverBundlr.currencyConfig.sign(
      "sign this message to connect to Bundlr.Network"
    )
  ).toString("hex");
  console.log(presignedHash);
  console.log(
    utils.formatEther((await serverBundlr.getLoadedBalance()).toString())
  );
}

async function signDataOnServer(signatureData) {
  return await serverBundlr.currencyConfig.sign(signatureData);
}

app.get("/api/presignedHash", (req, res) => {
  res.send(presignedHash);
});

app.post("/api/signedData", async (req, res) => {
  console.log(req.body.signatureData);
  const signedData = Buffer.from(req.body.signatureData, "hex");
  // console.log(signedData);
  const finalData = Buffer.from(
    await signDataOnServer(req.body.signatureData)
  ).toString("hex");
  res.send(finalData);
});

/****************************************************************************** */
// front-end react
async function fetchSignedData(signatureData) {
    return axios
      .post("http://localhost:3008/api/signedData", {
        signatureData: Buffer.from(signatureData).toString("hex"),
      })
      .then((result) => {
        return Buffer.from(result.data, "hex");
      });
  }

  async function fetchPresignedHash() {
    return axios
      .get("http://localhost:3008/api/presignedHash")
      .then((result) => {
        console.log(result);
        return Buffer.from(result.data, "hex");
      });
  }

  async function uploadNoFees() {
    const presignedHash = await fetchPresignedHash();

    // mock provider
    const provider = {
      getSigner: () => {
        return {
          signMessage: () => {
            return presignedHash;
          },
        };
      },
    };
    const bundlr = new WebBundlr(
      "https://devnet.bundlr.network",
      "matic",
      provider
    );
    await bundlr.ready();
    console.log(bundlr.address);
    //tags
    const tags = [
      { name: "Type", value: "manifest" },
      { name: "Content-Type", value: "application/x.arweave-manifest+json" },
    ];
    // example data (manifest)
    const manifest = {
      manifest: "arweave/paths",
      version: "0.1.0",
      paths: {
        "basten.jpg": { id: "cu2RWNO8T6t2zZ6f9FTIY5S_GY5A19jWfGp-fKBEAxk" },
      },
    };
    const transaction = bundlr.createTransaction(JSON.stringify(manifest), {
      tags,
    });
    // get signature data
    const signatureData = Buffer.from(await transaction.getSignatureData());
    
    // get signed signature
    const signed = await fetchSignedData(signatureData);

    transaction.getRaw().set(signed, 2);

    // make sure isValid is true - don't worry about isSigned.
    console.log({
      isSigned: await transaction.isSigned(),
      isValid: await transaction.isValid(),
    });

    // upload as normal
    const res = await transaction.upload();
    setURI(res);
  }