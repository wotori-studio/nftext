import NF3DPreview from "../NFImage/NF3DPreview";
import NFImage from "../NFImage/NFImage";
import NFText from "../NFText/NFText";
import globalStyles from "../../globalStyles/styles.module.sass";
import { useState } from "react";
import { useSigningClient } from "../../context/cosmwasm";
import { calculateFee } from "@cosmjs/stargate";

const CW20 = process.env.NEXT_PUBLIC_CW20 || "";
const CW721 = process.env.NEXT_PUBLIC_CW721 || "";
const MARKETPLACE = process.env.NEXT_PUBLIC_CW_MARKETPLACE || "";

const WrapBuy = (props: any) => {
  const NFT = props.NFT;
  const PRICE = props.price;
  const { walletAddress, signingClient } = useSigningClient();
  const [price, setPrice] = useState(0);

  const handleBuy = () => {
    console.log("lets sell this:", NFT);
    const msg = `{"list_price":{"address":"${CW20}","amount":"${price}"}}`;
    const encodedMsg = Buffer.from(msg).toString("base64");
    if (!signingClient) return;

    signingClient
      ?.execute(
        walletAddress,
        CW721,
        {
          send_nft: {
            contract: MARKETPLACE,
            token_id: String(NFT.id + 1),
            msg: encodedMsg,
          },
        },
        calculateFee(300_000, "20uconst")
      )
      .then((res) => {
        console.log(res);
        alert("Success");
      })
      .catch((error) => {
        alert(`Error! ${error.message}`);
        console.log("Error: ", error);
      });
  };

  const handleChange = (event: any) => {
    setPrice(event.target.value);
  };
  return (
    <div>
      {NFT.type === "text" && <NFText NFT={NFT} />}
      {NFT.type === "img" && <NFImage NFT={NFT} />}
      {NFT.type === "3d" && <NF3DPreview NFT={NFT} />}
      <div>price:{PRICE}</div>
      <div>
        <button className={globalStyles.customButtonActive} onClick={handleBuy}>
          buy
        </button>
      </div>
    </div>
  );
};

export default WrapBuy;
