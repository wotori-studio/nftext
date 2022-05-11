import globalStyles from "./../../globalStyles/styles.module.sass";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import nftStore from "../../store/nftStore";

export interface Mode {
  name: string;
  action(): void;
}

interface Properties {
  modes: Array<Mode>;
}

const ModeToggle = observer((props: Properties) => {
  const { modes } = props;

  const [indexActiveButton, setIndexActiveButton] = useState(0);

  useEffect(() => {
    modes[indexActiveButton].action();
  }, []);

  useEffect(() => {
    if (modes.length === 2) {
      if (indexActiveButton === 2) setIndexActiveButton(1);
    }
  }, [nftStore.operatingMode]);

  function toggle(index: number) {
    setIndexActiveButton(index);
    modes[index].action();
  }

  function jsxModes(): JSX.Element[] {
    return modes.map((mode, index) => {
      let buttonMode =
        index === indexActiveButton
          ? globalStyles.customButtonActive
          : globalStyles.customButtonNotActive;
      return (
        <button
          key={index}
          className={buttonMode}
          onClick={() => toggle(index)}
        >
          {mode.name}
        </button>
      );
    });
  }

  return <>{jsxModes()}</>;
});

export default ModeToggle;
