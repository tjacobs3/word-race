import { useEffect, useState } from "react"
import axios, { AxiosError } from 'axios';
import { useHistory, useParams } from "react-router-dom";

import SplashHeader from "./splash_header";

export default function JoinGame() {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [errors, setErrors] = useState<string[]>([]);

  const joinGame = () => {
    axios.post(`${process.env.REACT_APP_API_ROOT || ''}/join_room`, { roomCode: id }, { withCredentials: true })
      .then((response) => history.push(`/game/${response.data.roomCode}`))
      .catch((error: Error | AxiosError)=> {
        if (axios.isAxiosError(error))  {
          setErrors(error.response?.data?.errors || []);
        }
      });
  }

  useEffect(() => {
    setTimeout(joinGame, 2000);
  }, []);

  return (
    <div className="splash">
      <div className="px-4 text-center">
        <h1 className="display-4 fw-bold">Wordversary.</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-5">Race against your friends to solve word puzzles!</p>
          <div className="mb-5">

            <SplashHeader errors={errors} />
            <div>
              <h1 className="mt-0 mb-3 text-center">Joining {id}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
