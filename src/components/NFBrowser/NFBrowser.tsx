import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import { NFT } from "./../../models/NFT";
import NFTService from "./../../services/nftService";

import { useSigningClient } from "./../../context/cosmwasm";
import NFText from "./../NFText/NFText";
import NFImage from "./../NFImage/NFImage";

import DevStore from "./../../store/devStore";

import styles from "./NFBrowser.module.sass";

interface Properties {
  mode: string;
}

const NFBrowser = observer((props: Properties) => {
  const { mode } = props;

  const { walletAddress, signingClient, connectWallet } = useSigningClient();
  const [manyNFT, setManyNFT] = useState<NFT[]>([]);

  useEffect(() => {
    if (DevStore.dataPlatform === "Blockchain") {
      setManyNFT(NFTService.getNFTFromBlockchain(walletAddress, signingClient, connectWallet));
    }
    else if (DevStore.dataPlatform === "Database") {
      setManyNFT(NFTService.getNFTFromDatabase());
    }
  }, [signingClient, walletAddress, alert]);

  return (
    <div className={styles.nftBrowser}>
      {manyNFT.slice(0).reverse().map( NFT => (
        <>
          {(NFT.type === "text" && mode === "text") &&
            <NFText NFT={NFT} />
          }
          
          {(NFT.type === "img" && mode === "img") &&
            <NFImage NFT={NFT} />
          }
        </>
      ))}
    </div>
  );
});

export default NFBrowser;
