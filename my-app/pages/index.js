import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Web3Modal from "web3modal"
import { ethers, providers } from "ethers";
import { useEffect, useState, useRef } from "react";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Ref to Web3Modal
  const web3ModalRef = useRef();
  // ENS
  const [ens, setENS] = useState("");
  // Keep track of currently connected wallet address
  const [walletAddress, setWalletAddress] = useState("");

  // If current walletAddress has an ENS, set the ENS, otherwise display the address
  const setENSOrAddress = async (walletAddress, web3Provider) => {
    // ENS related to current address
    var _ens = await web3Provider.lookupAddress(walletAddress);
    if (_ens) {
      setENS(_ens);
    } else {
      setWalletAddress(walletAddress);
    }
  };

  /* The Provider is used to read data on blockchain.
    The Signer is a type of Provider user to write transactions.
    Metamask exposes a Signer API to allow your website to
    request signatures from the user using Signer functions.
   */

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect Metamask through wbe3modal
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.web3Provider(provider);

    // If user is not connected on the right network, alert
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }

  const signer = web3Provider.getSigner();
  // get address of the signer
  const walletAddress = await signer.getAddress();
  // determine whether it has an ens
  await setENSOrAddress(walletAddress, web3Provider);
  return needSigner ? signer : web3Provider;
  };

  const connectWallet = async () => {
    try {
      // Get the provider (= metamask)
      await getProviderOrSigner(false);
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // renderButton: Returns a button based on the state of the dapp
  const renderButton = () => {
    if (walletConnected) { // only display that wallet is connected
      <div>Wallet connected</div>
    } else {
      return (  // display connectWallet button
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
      );
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS_Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome {ens ? ens : walletAddress}!
          </h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            Get ready for cute battles !
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./patapon.png" />
        </div>
      </div>
    </div>
  );
}
