import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import abi from '../utils/abi.json'


export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintAmount, setMintAmount] = useState(0);
  const [mining, mined] = useState(false);
  const baseOpenseaUri = "https://opensea.io";
  const [openSeaUri, setOpenSeaUri] = useState('');
  const [mintedTokens, setMintedTokens] = useState([]);
  const [lastTransactionHash, setLastTransactionHash] = useState('');
  const contractAddress = "0x8bc9c8B29D257302C36631bdf71fbc1733b75e88";
  const contractABI = abi;

  const checkIfWalletIsConnected = async () => {
    try {
      
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const mint = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

       

         let waveTxn = await wavePortalContract.mint(currentAccount,mintAmount,{ gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);
        mined(true)
        
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setLastTransactionHash(waveTxn.hash);
        
        mined(false)
        

        waveTxn = await wavePortalContract.walletOfOwner(currentAccount,{ gasLimit: 300000 });
        
       setMintedTokens(waveTxn)


      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    
    checkIfWalletIsConnected()
  }, [currentAccount]);
  return (
    <div className="container">
      <Head>
        <title>MINT!</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script>
      </Head>

      <main>
        <Header title="Mint A Sacred Psychonaut" />
        {!currentAccount && <p className="description">
          <button onClick={connectWallet}>Connect Wallet</button>
        </p>}
        
        {!mining && currentAccount && <div class="input-group mb-3">
  <input type="number" class="form-control" placeholder="Amount" aria-label="Amount" aria-describedby="basic-addon1" onChange={(e)=>setMintAmount(e.target.value)} />
  <button class="input-group-text btn btn-primary" id="basic-addon1" onClick={mint}>Mint {mintAmount}</button>
</div>}
        
        {mining && <div class="title">Mining...</div>}
        {lastTransactionHash && <div class="title">{lastTransactionHash}</div>}
      </main>

      <Footer />
    </div>
  )
}
