import { useQuiz } from "../contexts/QuizContext";

function FinishScreen() {
  const { points, maxPossiblePoints, highscore, dispatch } = useQuiz();

  const percentage = (points / maxPossiblePoints) * 100;

  let emoji;
  let message;
  if (percentage === 100) {
    emoji = "🥇";
    message = "Perfect! You're ready for your exams!";
  } else if (percentage >= 80 && percentage < 100) {
    emoji = "🎉";
    message = "Excellent! Keep up the good work!";
  } else if (percentage >= 50 && percentage < 80) {
    emoji = "🙃";
    message = "Good effort! Try reviewing the explanations and try again.";
  } else if (percentage > 0 && percentage < 50) {
    emoji = "🤨";
    message = "Need more practice. Review the concepts and try again.";
  } else if (percentage === 0) {
    emoji = "🤦‍♂️";
    message = "Time to study! Don't give up!";
  }

  return (
    <>
      <p className="result">
        <span>{emoji}</span> You scored <strong>{points}</strong> out of{" "}
        {maxPossiblePoints} ({Math.ceil(percentage)}%)
      </p>
      <p className="message">{message}</p>
      <p className="highscore">(Highscore: {highscore} points)</p>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "restart" })}
      >
        Try Again
      </button>
    </>
  );
}

export default FinishScreen;
