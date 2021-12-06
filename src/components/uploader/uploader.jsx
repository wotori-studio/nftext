import { useEffect, useState } from "react";
import axios from "axios";
import { Container } from "@mui/material";
import ThreeScene from "../../3D/cube";

export default function Uploader(props) {
  const [mode, setMode] = useState("");
  useEffect(() => {
    // without useEffect causing Infinity loop
    // updating programm mode state
    setMode(props.mode);
  });

  const [mintReady, setMintReady] = useState(false);

  const [selectedFile, setSelectedFile] = useState("");
  const [isSelected, setSelected] = useState(false); // TODO: if selected make clickable upload button
  const [imgLink, setImgLink] = useState(null);
  const [consoleResponse, setConsoleResponse] = useState("");

  const changeHandler = (e) => {
    const file = e.target.files[0];
    console.log(file);
    setSelectedFile(file);
    setSelected(true);
    // TODO: check if file is in propper format. (.png/ .jpg for img and .gltf for 3D)
  };

  const handleSubmission = () => {
    const formData = new FormData();
    const apiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    formData.append("file", selectedFile);

    const metadata = JSON.stringify({
      name: selectedFile.name,
      keyvalues: {
        wallet_address: "archway1sfpyg3jnvqzf4ser62vpeqjdtvet3mfzp2v7za",
      },
    });
    formData.append("pinataMetadata", metadata);

    const apiKey = process.env.NEXT_PUBLIC_APP_PINATA_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_APP_PINATA_SECRET_API_KEY;

    axios
      .post(apiUrl, formData, {
        headers: {
          "Content-Type": `multipart/form-data; boundary= ${formData._boundary}`,
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
      })
      .then((res) => {
        console.log(res.data);
        let hash = res.data.IpfsHash;
        if (mode === "img") {
          setImgLink(`https://ipfs.io/ipfs/${hash}`);
          setMintReady(true);
        }
      });
  };

  const handleMint = () => {
    console.log("start minting...");
    axios.get("/api/bash").then((response) => {
      console.log(response);
    });
  };

  return (
    <>
      <style jsx>
        {`
          .flexy {
            display: flex;
          }
          .img {
            display: ${imgLink && mode === "img" ? true : "none"};
            max-width: 400px;
            max-heigh: 400px;
            border-style: solid;
            border-width: 1px;
            padding-top: 20px;
          }
          .div-img {
            padding-top: 13px;
          }
          .text-box {
            width: 372px;
            height: 121px;
          }
        `}
      </style>
      <div /*img and gltf*/>
        <div className="flexy">
          <div>
            {mode === "img" || mode == "gltf" ? (
              <div>
                <label className="custom_file_btn">
                  <div>select file</div>
                  <input
                    className="hide"
                    type="file"
                    onChange={changeHandler}
                  />
                </label>
                <button className="custom_btn" onClick={handleSubmission}>
                  upload
                </button>
              </div>
            ) : null}
          </div>

          {mode === "img" || mode == "gltf" ? (
            // display selected file name
            <div className="vertical_alignment">
              <div className="result">{selectedFile.name}</div>
            </div>
          ) : null}
        </div>

        {mode === "img" ? (
          // display img div
          <div className="div-img">
            <img className="img" src={imgLink ? imgLink : null}></img>
          </div>
        ) : null}
        {mode === "gltf" ? (
          // display 3D convas
          <Container sx={{ height: 500 }}>
            <ThreeScene />
          </Container>
        ) : null}
      </div>

      <div>
        {mode === "text" ? (
          <div>
            <textarea className="text-box">Imagine ...</textarea>
          </div>
        ) : null}
      </div>

      <div>
        {mode === "paint" ? <div>Paint interface should be here</div> : null}
      </div>

      {mintReady || mode === "text" || mode === "paint" ? (
        <button className="custom_btn" onClick={handleMint}>
          mint
        </button>
      ) : null}
    </>
  );
}
