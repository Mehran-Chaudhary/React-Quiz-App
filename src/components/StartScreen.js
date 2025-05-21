import { useQuiz } from "../contexts/QuizContext";

function StartScreen() {
  const { numQuestions, dispatch } = useQuiz();

  return (
    <div className="start">
      <h2>Welcome to Pathology Quiz!</h2>
      <h3>{numQuestions} questions to test your medical knowledge</h3>
      <p className="description">
        This quiz contains beginner-level pathology questions to help you
        practice for your exams. For incorrect answers, detailed explanations
        will be provided.
      </p>
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "start" })}
      >
        Start Quiz
      </button>
    </div>
  );
}

export default StartScreen;
