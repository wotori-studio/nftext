import NFImage from "../NFImage/NFImage";
import NFText from "../NFText/NFText";
import globalStyles from "../../globalStyles/styles.module.sass";
import { useSigningClient } from "../../context/cosmwasm";
import { calculateFee } from "@cosmjs/stargate";
import styles from "./styles.module.sass";
import { isMobile } from "react-device-detect";
import dappState from "../../store/dappState";

const CW20 = process.env.NEXT_PUBLIC_CW20 || "";
const MARKETPLACE = process.env.NEXT_PUBLIC_CW_MARKETPLACE || "";

const WrapBuy = (props: any) => {
  const NFT = props.NFT;
  const PRICE = props.price;
  const MARKET_ID = props.marketID;
  const { walletAddress, signingClient } = useSigningClient();

  const handleBuy = () => {
    if (walletAddress) {
      dappState.setState("Buy transaction");
      dappState.setOn();
      console.log("lets buy this:", NFT);
      const msg = `{"offering_id":"${MARKET_ID}"}`;
      const encodedMsg = Buffer.from(msg).toString("base64");

      if (!signingClient) return;

      signingClient
        ?.execute(
          walletAddress,
          CW20,
          {
            send: {
              contract: MARKETPLACE,
              amount: PRICE * 370370,
              msg: encodedMsg,
              additional_info: "1 Torii = 370370 wTorii.",
            },
          },
          calculateFee(600_000, "20uconst")
        )
        .then((res) => {
          console.log(res);
          dappState.setOff();
          alert("Successfully ordered!");
        })
        .catch((error) => {
          dappState.setOff();
          // alert(`Error! ${error.message}`);
          alert(
            `Error! Probably you don't have enough cw20 tokens. You can exchange Torii to CW20 in sliding window with arrow on the left side.`
          );
          console.log("Error signingClient?.execute(): ", error);
        });
    } else {
      alert("Install Keplr to be able to buy NFTs")
    }
  };

  return (
    <div>
      {NFT.type === "text" && <NFText NFT={NFT} />}
      {NFT.type === "img" && <NFImage NFT={NFT} />}
      {NFT.type === "3d" && <NFImage NFT={NFT} />}
      <div className={styles.center}>
        <div style={{ margin: "5px" }}>price: {PRICE / 370370} CW20*</div>
        <div>
          <button
            className={globalStyles.customButtonActive}
            onClick={() => {
              if (!isMobile) {
                handleBuy();
              } else {
                alert("Mobile devices currently not supported");
              }
            }}
          >
            buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default WrapBuy;
