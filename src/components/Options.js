import { useQuiz } from "../contexts/QuizContext";

function Options({ question }) {
  const { dispatch, answer } = useQuiz();

  const hasAnswered = answer !== null;
  const isWrongAnswer = hasAnswered && answer !== question.correctOption;

  return (
    <div className="options-container">
      <div className="options">
        {question.options.map((option, index) => (
          <button
            className={`btn btn-option ${index === answer ? "answer" : ""} ${
              hasAnswered
                ? index === question.correctOption
                  ? "correct"
                  : "wrong"
                : ""
            }`}
            key={option}
            disabled={hasAnswered}
            onClick={() => dispatch({ type: "newAnswer", payload: index })}
          >
            {option}
          </button>
        ))}
      </div>

      {isWrongAnswer && (
        <div className="explanation">
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export default Options;
