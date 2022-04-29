// Styles
import styles from "./ModalWindow.module.sass";

// Models
import { Nft } from "./../../models/Nft";

// Services
import nftService from "./../../services/nftService";

// Dependencies
import { useEffect, useState } from "react";
import axios from "axios";

// Stores
import devStore from "./../../store/devStore";
import NFUploader from "../NFUploader/NFUploader";
import { useSigningClient } from "../../context/cosmwasm";
import NFText from "../NFText/NFText";
import NFImage from "../NFImage/NFImage";
import ModelViewer from "../ModelViewer";
import NF3DPreview from "../NFImage/NF3DPreview";
import nftStore from "../../store/nftStore";

interface Properties {
  isOpen: boolean;
  close(): void;
  NFT: Nft;
}

const ModalWindow = (props: Properties) => {
  const { isOpen, close, NFT } = props;
  const [mode, setMode] = useState<string>("text");

  const [modalWindowIsOpen, setModalWindowIsOpen] = useState(isOpen);
  const [text, setText] = useState<string>();

  useEffect(() => {
    console.log("hello from modal. This is selected NFT:", NFT);
    setModalWindowIsOpen(isOpen);
    getText();

    if (
      NFT.type !== "text" &&
      NFT.type !== "img" &&
      NFT.type !== "3d" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error(`Received unknown NFT type: ${NFT.type}`);
    }
  }, [modalWindowIsOpen, nftStore.loadedNFT]);

  function closeModalWindow(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const targetClassName = (event.target as HTMLElement).className;

    const clickedToBackground = targetClassName === styles.background;
    const clickedToCloseButton = targetClassName === styles.close;

    if (clickedToBackground || clickedToCloseButton) {
      close();
    }
  }

  function getText(): void {
    if (
      process.env.NODE_ENV === "production" ||
      devStore.dataPlatform === "Blockchain"
    ) {
      axios.get(NFT.content).then((response) => setText(response.data));
    } else if (
      process.env.NODE_ENV === "development" &&
      devStore.dataPlatform === "Database"
    ) {
      setText(NFT.content);
    }
  }

  function calculateSizeForImage(): number {
    const portrait = "portrait";
    const landscape = "landscape";
    const orientation = innerWidth > innerHeight ? landscape : portrait;

    /**
     * All numbers are obtained from media queries of the "window" class,
     * so when adjusting media queries, you will need to write them here.
     */
    if (orientation === landscape) {
      return innerWidth < 780
        ? innerWidth * 0.55
        : innerWidth < 850
        ? innerWidth * 0.45
        : innerWidth > 850
        ? innerWidth * 0.35
        : 0;
    } else if (orientation === portrait) {
      return innerWidth * 0.8;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("An error occurred while calculating the image size.");
      }
      return 0;
    }
  }

  function handleModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setMode(event.target.value);
    console.log("Modal mode: ", mode);
  }

  return (
    <div
      className={styles.background}
      onClick={(event) => closeModalWindow(event)}
    >
      <input type="button" className={styles.close} />
      <div className={styles.window}>
        <div className={styles.interface}>
          <h1 className={styles.title}>{NFT.name || "title undefined"}</h1>

          <div className={styles.NFTComponent}>
            {NFT.type === "text" && text ? (
              <span>{text}</span>
            ) : NFT.type === "img" ? (
              <img
                src={NFT.content}
                alt="An error occurred while loading the image, please try reloading the page."
                onLoad={(event) =>
                  nftService.setImageLimits(event, calculateSizeForImage())
                }
              />
            ) : (
              NFT.type === "3d" && <ModelViewer NFT={NFT} />
            )}
            <address className={styles.owner}>{NFT.owner}</address>
          </div>

          {/* <div className={styles.create}>
            <input className={styles.createButton} type="button" value="+" />
          </div> */}
          <div className={styles.block}>
            {NFT.parent ? (
              <h2 className={styles.title}>This NFT based on #{NFT.parent}</h2>
            ) : (
              <p className={styles.header}>This Is root nft</p>
            )}
            {nftStore.loadedNFT[NFT.parent - 1]
              ? [nftStore.loadedNFT[NFT.parent - 1]]
                  .slice(0)
                  .reverse()
                  .map((NFT) => (
                    <>
                      {NFT.type === "text" ? (
                        <NFText NFT={NFT} />
                      ) : NFT.type === "img" ? (
                        <NFImage NFT={NFT} />
                      ) : NFT.type === "3d" ? (
                        <ModelViewer NFT={NFT} />
                      ) : null}
                    </>
                  ))
              : null}
          </div>
          <div className={styles.block}>
            <h2 className={styles.header}>Create new NFT based on this:</h2>
            <select
              name="modes"
              className="{styles.modes}"
              value={mode}
              onChange={(e) => {
                handleModeChange(e);
              }}
            >
              <option value="text">text</option>
              <option value="img">img</option>
              <option value="3d">3d</option>
            </select>
            <NFUploader modalMode={mode} parentId={NFT.id} />
          </div>
          <div className={styles.block}>
            <h2 className={styles.header}>
              {nftStore.tree[NFT.id]
                ? "NFTs based on this:"
                : "There is no nfts based on this one yet"}
            </h2>
            {/* TODO: queried sm contract data with childrens*/}
            <div>
              {nftStore.loadedNFT
                ? nftStore.loadedNFT
                    .slice(0)
                    .reverse()
                    .map((mNFT) =>
                      nftStore.tree[NFT.id] ? (
                        nftStore.tree[NFT.id].includes(mNFT.id) ? (
                          <>
                            {mNFT.type === "text" ? (
                              <NFText NFT={mNFT} />
                            ) : mNFT.type === "img" ? (
                              <NFImage NFT={mNFT} />
                            ) : mNFT.type === "3d" ? (
                              <NF3DPreview NFT={mNFT} />
                            ) : null}
                          </>
                        ) : null
                      ) : null
                    )
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;
