import Head from 'next/head'
import { Contract, providers, utils } from 'ethers';
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ADDRESS, abi } from '@/constants';
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001){
      window.alert("change network to mumbai");
      throw new Error("change network to mumbai");
    }

    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds();
      console.log("tokenIds", _tokenIds);
      setTokenIdsMinted(_tokenIds.toString())
    } catch (error) {
      console.error(error)
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.mint({
        value: utils.parseEther("0.001"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("successfully minted a LW3Punk!")
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      getTokenIdsMinted();

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000)
    }
  }, [walletConnected]);

  const renderButton = () => {
    if(!walletConnected){
      return (
        <button onClick={connectWallet} className={styles.button}>
          connect your wallet.
        </button>
      )
    }
    if(loading){
      return <button className={styles.button}>Loading...</button>
    }
    return (
      <button className={styles.button} onClick={publicMint}>
        public mint! 🚀
      </button>
    )
  }

  return (
    <>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-Dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div>
          <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            It&#39;s an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 have been minted.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src='./LW3Punks/1.png' />
        </div>
      </main>

      <footer className={styles.footer}>Made with &#10084; by LW3Punks.</footer>
    </>
  )
}
