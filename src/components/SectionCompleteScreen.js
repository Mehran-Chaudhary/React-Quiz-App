import { useQuiz } from "../contexts/QuizContext";

function SectionCompleteScreen() {
  const {
    dispatch,
    currentSection,
    sections,
    points,
    maxPossiblePoints,
    sectionScores,
  } = useQuiz();

  // Handle edge cases where sections data might be incomplete
  if (!sections || sections.length === 0 || currentSection >= sections.length) {
    return (
      <div className="section-complete">
        <h2>Error Loading Sections</h2>
        <p>There was a problem loading the next section.</p>
        <button
          className="btn btn-ui"
          onClick={() => dispatch({ type: "restart" })}
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  // Get current section info
  const currentSectionName =
    sections[currentSection]?.name || "Current Section";

  // Check if this is the LAST section
  const isLastSection = currentSection >= sections.length - 1;
  console.log("[SectionCompleteScreen] Current section:", currentSection);
  console.log("[SectionCompleteScreen] Total sections:", sections.length);
  console.log("[SectionCompleteScreen] Is last section:", isLastSection);

  // Get next section info if not the last section
  const nextSectionName = !isLastSection
    ? sections[currentSection + 1]?.name || "Next Section"
    : "Final Results";

  // Show next section question count
  const nextSectionQuestions = !isLastSection
    ? sections[currentSection + 1]?.questions?.length || 0
    : 0;

  const percentage = (points / maxPossiblePoints) * 100;
  const completedSections = currentSection + 1;
  const totalSections = sections.length;

  return (
    <div className="section-complete">
      <h2>Section Completed! 🎉</h2>

      <div className="section-progress">
        <p>
          <strong>Progress:</strong> {completedSections}/{totalSections}{" "}
          sections
        </p>
        <div className="section-progress-bar">
          <div
            className="section-progress-fill"
            style={{ width: `${(completedSections / totalSections) * 100}%` }}
          ></div>
        </div>
      </div>

      <p>
        You've successfully completed <strong>{currentSectionName}</strong>!
      </p>

      <p className="result">
        You scored <strong>{points}</strong> out of {maxPossiblePoints} (
        {Math.ceil(percentage)}%)
      </p>

      <p>
        {isLastSection
          ? "You've completed all sections! View your final results."
          : `Ready to move on to ${nextSectionName}? (${nextSectionQuestions} questions)`}
      </p>

      <button
        className="btn btn-ui"
        onClick={() => {
          console.log(
            "[SectionCompleteScreen] Moving to next section, current section:",
            currentSection
          );
          // Always use continueSections - the reducer will handle if it's the last section
          dispatch({ type: "continueSections" });
        }}
      >
        {isLastSection ? "See Final Results" : "Continue to Next Section"}
      </button>
    </div>
  );
}

export default SectionCompleteScreen;
