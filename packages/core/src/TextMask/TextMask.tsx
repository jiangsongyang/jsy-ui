// import { useState } from "react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import "./style.less";

type Config = {
  format: `SSSS`;
  placeholder: string;
};

export type TextMaskProps = {
  value?: string;
  onChange?: (v: string) => void;
  config?: Config[];
  placeholder?: string;
  textPosition?: "left" | "right" | "center";
};

const DEFAULT_CONFIG: Config[] = [
  {
    format: `SSSS`,
    placeholder: "请输入",
  },
  {
    format: `SSSS`,
    placeholder: "请输入",
  },
  {
    format: `SSSS`,
    placeholder: "请输入",
  },
  {
    format: `SSSS`,
    placeholder: "请输入",
  },
];

const DEFAULT_PLACEHOLDER = "-";

export const TextMask = (props: TextMaskProps) => {
  const {
    config = DEFAULT_CONFIG,
    placeholder = DEFAULT_PLACEHOLDER,
    textPosition,
    value: propsValue = "",
    onChange: propsOnchange,
  } = props;
  const [value, setValue] = useState(propsValue);

  const onChange = (value: string) => {
    setValue(value);
    propsOnchange?.(value);
  };

  const convertStringToExpectValue = (v: string) => {
    let format = "";
    config.forEach((c) => (format += c.format + placeholder));
    format = format.slice(0, -1);
    const queue = format.split("");

    let res = "";
    for (let i = 0; i < v.length; i++) {
      const t = queue.pop();
      if (t === placeholder) {
        res += t;
        queue.pop();
      }
      res += v[i] || "";
    }
    return res;
  };

  const listenPasteEvent = (e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    let pastedData = clipboardData?.getData("text");
    if (!pastedData) {
      return;
    }
    const expectLength = config.reduce(
      (res, item) => (res += item.format.length),
      0
    );

    if (pastedData.length > expectLength) {
      pastedData = pastedData.trim().slice(0, expectLength);
    }
    const currentValue = convertStringToExpectValue(pastedData);

    onChange(currentValue);

    setTimeout(() => {
      if (currentValue.length !== expectLength) {
        const index = currentValue.split(placeholder).length - 1;
        const el = getEl(index);
        el.focus();
      }
    }, 10);
  };

  useEffect(() => {
    document.addEventListener("paste", listenPasteEvent);
    return () => {
      document.removeEventListener("paste", listenPasteEvent);
    };
  }, []);

  const computeCurrentValue = (index: number) => {
    return value.split("-").slice(index, index + 1) || "";
  };

  const updateAreaValue = (v: string, index: number) => {
    const splitValue = value.split("-");
    splitValue[index] = v;
    onChange(splitValue.join(placeholder));
  };

  const getEl = (index: number) =>
    document.querySelector(`#jsy-text-mask-${index}`) as HTMLInputElement;

  const renderWithConfig = () => {
    const len = config.length;

    const el = config.map((c, index) => {
      const value = computeCurrentValue(index);

      const onInput = (
        e: FormEvent<HTMLInputElement>,
        c: Config,
        index: number
      ) => {
        const v = (e.target as any).value;

        const { format } = c;

        const supportInputLength = format.length;
        const currentValue = (e.target as any).value;
        if (currentValue.length <= supportInputLength) {
          updateAreaValue(v, index);

          if (currentValue.length === supportInputLength) {
            if (index === len - 1) {
              const currentEl = getEl(index);
              currentEl.blur();
              return;
            }
            const nextEl = getEl(index + 1);
            nextEl.focus();
          }
          if (currentValue.length === 0) {
            if (index === 0) {
              const currentEl = getEl(index);
              currentEl.blur();
              return;
            }
            const prevEl = getEl(index - 1);
            prevEl.focus();
            return;
          }
        } else {
          if (index === len - 1) {
            const currentEl = getEl(index);
            currentEl.blur();
            return;
          }
          const nextEl = getEl(index + 1);
          nextEl.focus();
        }
      };

      return (
        <div className="item-container" key={index}>
          <input
            id={`jsy-text-mask-${index}`}
            style={{ textAlign: textPosition || "center" }}
            type="text"
            value={value}
            onInput={(e) => onInput(e, c, index)}
            data-text-mask-index={index}
          />
          {index === len - 1 ? null : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
      );
    });
    return el;
  };

  return <div className="jsy-text-mask-container">{renderWithConfig()}</div>;
};
