import { createContext, useContext, useReducer, useEffect } from "react";
// Import the three section files instead of the single questions file
import section1Data from "../data/section1.json";
import section2Data from "../data/section2.json";
import section3Data from "../data/section3.json";

const QuizContext = createContext();

const SECS_PER_QUESTION = 30;

const initialState = {
  sections: [],
  currentSection: 0,
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
  sectionScores: [],
  sectionCompleted: false,
  wrongAnswers: [],
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomizeOptions(question) {
  const options = [...question.options];
  const correctOption = options[question.correctOption];
  const shuffledOptions = shuffleArray(options);
  const newCorrectOption = shuffledOptions.indexOf(correctOption);
  return {
    ...question,
    options: shuffledOptions,
    correctOption: newCorrectOption,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived": {
      const sections = action.payload.sections || [];
      const firstSectionQuestions =
        sections[0] &&
        Array.isArray(sections[0].questions) &&
        sections[0].questions.length > 0
          ? sections[0].questions.map(randomizeOptions)
          : null;
      if (!firstSectionQuestions) {
        return {
          ...state,
          sections,
          questions: [],
          status: "error",
        };
      }
      return {
        ...state,
        sections,
        questions: firstSectionQuestions,
        status: "ready",
      };
    }
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "start":
      if (!state.questions || state.questions.length === 0) {
        return {
          ...state,
          status: "error",
        };
      }
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
        sectionCompleted: false,
        wrongAnswers: [],
      };
    case "newAnswer":
      const question = state.questions.at(state.index);
      if (!question) return state;
      const isCorrect = action.payload === question.correctOption;

      // Track wrong answers
      const newWrongAnswers = isCorrect
        ? state.wrongAnswers
        : [...state.wrongAnswers, state.index];

      return {
        ...state,
        answer: action.payload,
        points: isCorrect ? state.points + question.points : state.points,
        wrongAnswers: newWrongAnswers,
      };
    case "nextQuestion":
      if (state.index === state.questions.length - 1) {
        // End of section
        const sectionScore = state.points;
        const newSectionScores = [...state.sectionScores, sectionScore];

        // Check if all questions were answered correctly
        const allCorrect = state.wrongAnswers.length === 0;

        console.log("End of section reached!");
        console.log("Current section:", state.currentSection);
        console.log("Wrong answers:", state.wrongAnswers);
        console.log("All correct?", allCorrect);
        console.log("Section score:", sectionScore);
        console.log("Updated section scores:", newSectionScores);

        if (!allCorrect) {
          console.log("Not all correct, restarting section");
          // If not all correct, restart the section with randomized questions
          return {
            ...state,
            questions: state.questions.map(randomizeOptions),
            index: 0,
            answer: null,
            points: 0,
            wrongAnswers: [],
            secondsRemaining: state.questions.length * SECS_PER_QUESTION,
          };
        }

        // THIS IS THE CRITICAL PART - ALWAYS stay in "active" status with sectionCompleted=true,
        // NEVER go to "finished" directly (that's only for the final screen after all sections)
        console.log("Section completed, showing transition screen");
        return {
          ...state,
          status: "active",
          sectionCompleted: true,
          sectionScores: newSectionScores,
        };
      }
      return { ...state, index: state.index + 1, answer: null };
    case "continueSections":
      console.log("Continuing to next section");
      const nextSection = state.currentSection + 1;
      console.log("Total sections:", state.sections.length);
      console.log("Current section:", state.currentSection);
      console.log("Moving to section:", nextSection);

      // Fix: Check if we're trying to go beyond the available sections
      if (nextSection >= state.sections.length) {
        console.log("REACHED END OF ALL SECTIONS");
        return {
          ...state,
          status: "finished",
          highscore:
            state.points > state.highscore ? state.points : state.highscore,
        };
      }

      // Get next section questions
      const nextSectionData = state.sections[nextSection];
      console.log("Next section name:", nextSectionData?.name);
      console.log(
        "Next section questions count:",
        nextSectionData?.questions?.length
      );

      // Randomize next section questions
      const nextQuestions =
        nextSectionData &&
        Array.isArray(nextSectionData.questions) &&
        nextSectionData.questions.length > 0
          ? nextSectionData.questions.map(randomizeOptions)
          : [];

      console.log(
        "Processed question count for next section:",
        nextQuestions.length
      );

      if (nextQuestions.length === 0) {
        console.error("ERROR: No questions found for next section!");
        // If no questions, go to finished state rather than showing empty questions
        return {
          ...state,
          status: "finished",
          highscore:
            state.points > state.highscore ? state.points : state.highscore,
        };
      }

      // Move to next section, keep status as "active"
      return {
        ...state,
        status: "active",
        sectionCompleted: false,
        currentSection: nextSection,
        questions: nextQuestions,
        index: 0,
        answer: null,
        points: 0,
        wrongAnswers: [],
        secondsRemaining: nextQuestions.length * SECS_PER_QUESTION,
      };
    case "finish":
      // For consistency, always redirect to continueSections, which will handle
      // section transitions and finishing the quiz
      console.log("Finish action redirecting to continueSections");
      return reducer(state, { type: "continueSections" });
    case "restart":
      return {
        ...initialState,
        sections: state.sections,
        questions:
          state.sections[0] && Array.isArray(state.sections[0].questions)
            ? state.sections[0].questions.map(randomizeOptions)
            : [],
        status: "ready",
        highscore: state.highscore,
        currentSection: 0,
        sectionScores: [],
        sectionCompleted: false,
        wrongAnswers: [],
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Action unknown");
  }
}

function QuizProvider({ children }) {
  const [
    {
      sections,
      currentSection,
      questions,
      status,
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
      sectionScores,
      sectionCompleted,
      wrongAnswers,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  useEffect(function () {
    try {
      console.log("Loading sections data from separate files...");

      // Combine the three section files into one sections array
      const formattedData = {
        sections: [section1Data, section2Data, section3Data],
      };

      // Validate the combined data
      if (
        !formattedData.sections ||
        !Array.isArray(formattedData.sections) ||
        formattedData.sections.length === 0
      ) {
        console.error(
          "ERROR: Invalid data structure after combining section files"
        );
        dispatch({ type: "dataFailed" });
        return;
      }

      // Full validation of sections
      console.log("=== SECTION VALIDATION ===");
      console.log(`Total sections: ${formattedData.sections.length}`);
      let totalQuestions = 0;

      formattedData.sections.forEach((section, index) => {
        const questionCount = section.questions?.length || 0;
        console.log(
          `Section ${index + 1}: ${section.name} - ${questionCount} questions`
        );
        totalQuestions += questionCount;

        // Check for malformed questions
        if (questionCount > 0) {
          const firstQuestion = section.questions[0];
          const lastQuestion = section.questions[questionCount - 1];
          console.log(
            `First question: "${firstQuestion?.question?.substring(0, 30)}..."`
          );
          console.log(
            `Last question: "${lastQuestion?.question?.substring(0, 30)}..."`
          );
        }
      });

      console.log(`Total questions across all sections: ${totalQuestions}`);
      console.log("=== END VALIDATION ===");

      dispatch({ type: "dataReceived", payload: formattedData });
    } catch (error) {
      console.error("Error in useEffect:", error);
      dispatch({ type: "dataFailed" });
    }
  }, []);

  return (
    <QuizContext.Provider
      value={{
        sections,
        currentSection,
        questions,
        status,
        index,
        answer,
        points,
        highscore,
        secondsRemaining,
        numQuestions,
        maxPossiblePoints,
        sectionScores,
        wrongAnswers,
        sectionCompleted,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("QuizContext was used outside of the QuizProvider");
  return context;
}

export { QuizProvider, useQuiz };
