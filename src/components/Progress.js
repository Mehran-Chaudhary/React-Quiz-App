import { useQuiz } from "../contexts/QuizContext";

export default function Progress() {
  const {
    index,
    numQuestions,
    points,
    maxPossiblePoints,
    answer,
    currentSection,
    sections,
    wrongAnswers,
  } = useQuiz();

  const remainingQuestions = numQuestions - (index + 1);
  const wrongAnswersCount = wrongAnswers.length;

  return (
    <header className="progress">
      <div className="section-info">
        <p>
          Section {currentSection + 1} of {sections.length}:{" "}
          {sections[currentSection]
            ? sections[currentSection].name
            : "Loading..."}
        </p>
        <p className="section-status">
          {wrongAnswersCount > 0 ? (
            <span className="warning">
              {wrongAnswersCount} incorrect answer
              {wrongAnswersCount !== 1 ? "s" : ""}. You need all correct to
              proceed.
            </span>
          ) : (
            <span className="success">All answers correct so far!</span>
          )}
        </p>
      </div>
      <progress max={numQuestions} value={index + Number(answer !== null)} />

      <p>
        Question <strong>{index + 1}</strong> / {numQuestions}
        {remainingQuestions > 0 && ` (${remainingQuestions} remaining)`}
      </p>

      <p>
        <strong>{points}</strong> / {maxPossiblePoints} points
      </p>
    </header>
  );
}
