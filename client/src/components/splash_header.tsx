import { Alert } from "react-bootstrap"

type Props = {
  errors: string[]
}

export default function SplashHeader({ errors }: Props) {
  return (
    <div>
      {errors.length > 0 && (
        <div className="text-center">
          <Alert className="d-inline-block" variant="info">
            {errors.map(error => <div key={error}>{error}</div>)}
          </Alert>
        </div>
      )}
    </div>
  );
}
