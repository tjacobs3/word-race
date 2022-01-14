import { useEffect, useState } from "react";

type Props = {
  toTime: Date;
}

export default function Timer({ toTime }: Props) {
  const calculateTimeLeft: () => number = () => {
    const currentTime = new Date();
    const difference = toTime.getTime() - currentTime.getTime();
    return Math.max(Math.floor((difference / 1000)), -1);
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 250);
    return () => clearInterval(interval);
  }, [toTime]);

  return (
    <div>{timeLeft + 1}</div>
  );
}
