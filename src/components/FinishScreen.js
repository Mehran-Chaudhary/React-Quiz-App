import { useQuiz } from "../contexts/QuizContext";

export default function FinishScreen() {
  const {
    points,
    maxPossiblePoints,
    highscore,
    dispatch,
    sections,
    sectionScores,
  } = useQuiz();

  const percentage = (points / maxPossiblePoints) * 100;

  let emoji;
  if (percentage === 100) emoji = "🥇";
  if (percentage >= 80 && percentage < 100) emoji = "🎉";
  if (percentage >= 50 && percentage < 80) emoji = "🙃";
  if (percentage >= 0 && percentage < 50) emoji = "🤨";
  if (percentage === 0) emoji = "🤦‍♂️";

  return (
    <>
      <p className="result">
        <span>{emoji}</span> You scored <strong>{points}</strong> out of{" "}
        {maxPossiblePoints} ({Math.ceil(percentage)}%)
      </p>

      <div className="section-scores">
        <h3>Section Scores:</h3>
        {sections.map((section, index) => (
          <div key={index} className="section-score">
            <p>
              {section.name}: {sectionScores[index]} points
            </p>
          </div>
        ))}
      </div>

      <p className="highscore">(Highscore: {highscore} points)</p>

      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "restart" })}
      >
        Restart quiz
      </button>
    </>
  );
}
