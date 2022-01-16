import { useEffect, useState } from "react";

type Props = {
  toTime: Date;
}

const calculateTimeLeft = (toTime: Date) => {
  const currentTime = new Date();
  const difference = toTime.getTime() - currentTime.getTime();
  return Math.max(Math.floor((difference / 1000)), -1);
};

export default function Timer({ toTime }: Props) {


  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(toTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(toTime));
    }, 250);
    return () => clearInterval(interval);
  }, [toTime]);

  return (
    <span>{timeLeft + 1}</span>
  );
}
