import { useQuiz } from "../contexts/QuizContext";

function Progress() {
  const {
    index,
    numQuestions,
    points,
    maxPossiblePoints,
    answer,
    sections,
    currentSection,
    wrongAnswers,
    sectionScores,
  } = useQuiz();
  const wrongAnswersCount = wrongAnswers.length;
  const currentSectionName =
    sections[currentSection]?.name || "Current Section";

  return (
    <header className="progress">
      <div className="section-info">
        <h3>
          Section {currentSection + 1}/{sections.length}:{" "}
          <strong>{currentSectionName}</strong>
        </h3>

        <div className="section-status">
          {wrongAnswersCount > 0 ? (
            <span className="warning">
              {wrongAnswersCount} incorrect answer
              {wrongAnswersCount !== 1 ? "s" : ""}. You need all correct to
              proceed.
            </span>
          ) : (
            <span className="success">All answers correct so far!</span>
          )}
        </div>
      </div>

      <progress max={numQuestions} value={index + Number(answer !== null)} />

      <div className="progress-data">
        <p>
          Question <strong>{index + 1}</strong> / {numQuestions}
        </p>
        <p>
          <strong>{points}</strong> / {maxPossiblePoints} points
        </p>
      </div>
    </header>
  );
}

export default Progress;
