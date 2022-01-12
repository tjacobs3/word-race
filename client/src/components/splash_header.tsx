import { Container, Alert } from "react-bootstrap"

type Props = {
  errors: string[]
}

export default function SplashHeader({ errors }: Props) {
  return (
    <Container>
      <div className="px-3 py-5 mx-auto text-center">
        <h1 className="display-4">
          <span className="mr-4">no signup.</span>
          <span className="mr-4">no ads.</span>
          <span className="mr-4">just words.</span>
        </h1>
      </div>
      {errors.length > 0 && (
        <div className="text-center">
          <Alert className="d-inline-block" variant="warning">
            {errors.map(error => <div key={error}>{error}</div>)}
          </Alert>
        </div>
      )}
    </Container>
  );
}
