import { useState, useEffect, useRef } from "react";
import ComfyJS from "comfy.js";

const events = [
  {
    problem: `River ahead, what do you do?`,
    problemType: "HEALTH/DISTANCE",
    solutions: [
      {
        text: `Ride through the water`,
        outcomes: [
          {
            responseText: `You rode through, but the waves knocked some food from your pouch.`,
            target: "food",
            action: ()=>{
              
            },
            operator: "-=",
            value: "20",
            min: 15,
            max: 25,
          },
        ],
      },
      {
        text: `Ford the Wagon`,
        responseText: `You broke a wagon wheel and needed to pay for repairs.`,
        target: "money",
        operator: "-=",
        value: "30",
      },
      {
        text: `You find a bridge`,
        responseText: `The bridge has a toll, but you get across safely.`,
        target: "money",
        operator: "-=",
        value: "10",
      },
      {
        text: `Pay the Ferry`,
        responseText: `You pay the ferry and safely arrive at your desination`,
        target: "money",
        operator: "-=",
        value: "20",
      },
    ],
  },
];

function App() {
  const eventInterval = 0.1; //minutes
  const votingDuration = 0.1; //minutes
  const finishTime = 3600;

  // {player: vote}
  const [votes, setVotes] = useState({});
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef();
  const [voteTotals, setVoteTotals] = useState([0, 0, 0, 0]);
  const [playerNames, setPlayerNames] = useState([]);
  const [npcNames, setNpcNames] = useState([]);
  const [promptActive, setPromptActive] = useState(true);
  const [gameStarted, setGameStarted] = useState(true);
  // const [food, setFood] = useState({});

  function addVote() {
    const voters = Object.keys(votes);
    // Prepare array of votes set to 0
    const votesArray = [0, 0, 0, 0];
    // Get everyone's votes and add 1 for each vote
    voters.forEach((voter) => (votesArray[votes[voter] - 1] += 1));

    setVoteTotals(votesArray);
  }

  useEffect(() => {
    ComfyJS.Init("TrostCodes");
    return () => {
      ComfyJS.Disconnect();
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((cur) => cur + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    ComfyJS.onCommand = (user, command, message, flags, extra) => {
      console.log({ user, command, message, flags, extra });
      if (
        promptActive &&
        command === "vote" &&
        ["1", "2", "3", "4"].includes(message)
      ) {
        console.log(`${user} voted ${message}`);
        votes[user] = Number(message);
        addVote();
        console.log(votes);
      }

      if (command === "name") {
        if (playerNames.includes(user) || npcNames.includes(user)) return;
        console.log({ playerNames, npcNames });
        if (playerNames.length < 4 && !playerNames.includes(user)) {
          setPlayerNames([...playerNames, user]);
        } else if (!npcNames.includes(user)) {
          setNpcNames([...npcNames, user]);
        }
      }
    };
    return () => {};
  }, [playerNames, votes, promptActive, npcNames]);

  return (
    <div>
      <div>Timer {timer}</div>
      <div style={{ border: "1px solid black", padding: "1rem" }}>
        <p>Party Members:</p>
        {playerNames.map((player) => (
          <span>{player}</span>
        ))}
        <p>NPCs:</p>
        {npcNames.map((npc) => (
          <span>{npc}</span>
        ))}
      </div>

      {promptActive && (
        <div>
          <h2>Time to Vote</h2>
          {voteTotals.map((voteTotal, index) => (
            <div>
              {events[0].solutions[index].text}
              <p>Votes: {voteTotal}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
