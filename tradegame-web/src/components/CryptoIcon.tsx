import Image from "next/image";

export default function CryptoIcon({ ticker, size = 32, ...props }: any) {
  return (
    <Image
      src={`https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${ticker.toLowerCase()}.svg`}
      alt={ticker}
      width={size}
      height={size}
      {...props}
    />
  );
}
