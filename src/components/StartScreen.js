import { useQuiz } from "../contexts/QuizContext";

export default function StartScreen() {
  const { numQuestions, dispatch, sections } = useQuiz();

  console.log("StartScreen rendered with sections:", sections);
  console.log("Number of sections:", sections.length);
  console.log(
    "Section names:",
    sections.map((s) => s.name)
  );

  return (
    <div className="start">
      <h2>Welcome to the Medical Quiz!</h2>
      <h3>{numQuestions} questions to test your knowledge</h3>

      <div className="sections-info">
        <h4>Sections:</h4>
        {sections && sections.length > 0 ? (
          sections.map((section, index) => (
            <div key={index} className="section">
              <p>
                <strong>Section {index + 1}:</strong> {section.name} (
                {section.questions.length} questions)
              </p>
            </div>
          ))
        ) : (
          <p>No sections found. Please check your data.</p>
        )}
      </div>

      <p className="instructions">
        <strong>Quiz Rules:</strong>
        <ul>
          <li>Each section contains multiple-choice questions.</li>
          <li>
            You must answer <strong>all questions correctly</strong> in a
            section to advance to the next section.
          </li>
          <li>
            If you answer any question incorrectly, you'll need to restart the
            current section.
          </li>
          <li>Questions will be randomized each time you attempt a section.</li>
          <li>Complete all sections to finish the quiz.</li>
        </ul>
      </p>

      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "start" })}
      >
        Let's start
      </button>
    </div>
  );
}
