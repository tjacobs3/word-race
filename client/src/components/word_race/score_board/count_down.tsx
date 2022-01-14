import Timer from "./timer";

type Props = {
  nextWordAt?: string;
}

export default function CountDown({ nextWordAt }: Props) {
  let nextWordAtDate;

  try {
    if (nextWordAt) nextWordAtDate = new Date(nextWordAt);
  } catch (error) {

  }

  return (
    <div className="countdown my-2">
      <div>Next Word In:</div>
      <div className="time-left">
        {nextWordAtDate && (
          <Timer toTime={nextWordAtDate} />
        )}
        {!nextWordAtDate && (
          <div>--</div>
        )}
      </div>

    </div>
  );
}
