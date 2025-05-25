import { useQuiz } from "../contexts/QuizContext";

function NextButton() {
  const { dispatch, answer, index, numQuestions, currentSection, sections } =
    useQuiz();

  if (answer === null) return null;

  // Always use nextQuestion action for consistency
  return (
    <button
      className="btn btn-ui"
      onClick={() => dispatch({ type: "nextQuestion" })}
    >
      {index < numQuestions - 1
        ? "Next"
        : currentSection === sections.length - 1
        ? "Complete Quiz"
        : "Complete Section"}
    </button>
  );
}

export default NextButton;
