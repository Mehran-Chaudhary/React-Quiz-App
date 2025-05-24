import { createContext, useContext, useReducer, useEffect } from "react";
import questionsData from "../data/questions.json";

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

        if (!allCorrect) {
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

        if (state.currentSection === state.sections.length - 1) {
          // Last section completed
          return {
            ...state,
            status: "finished",
            highscore:
              state.points > state.highscore ? state.points : state.highscore,
            sectionScores: newSectionScores,
          };
        } else {
          // Move to next section
          const nextSection = state.currentSection + 1;
          const nextQuestions =
            state.sections[nextSection] &&
            Array.isArray(state.sections[nextSection].questions)
              ? state.sections[nextSection].questions.map(randomizeOptions)
              : [];
          return {
            ...state,
            currentSection: nextSection,
            questions: nextQuestions,
            index: 0,
            answer: null,
            points: 0,
            wrongAnswers: [],
            secondsRemaining: nextQuestions.length * SECS_PER_QUESTION,
            sectionScores: newSectionScores,
          };
        }
      }
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return {
        ...initialState,
        sections: state.sections,
        questions:
          state.sections[0] && Array.isArray(state.sections[0].questions)
            ? state.sections[0].questions.map(randomizeOptions)
            : [],
        status: "ready",
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
      console.log("Loaded questionsData:", questionsData);

      // More detailed debugging
      if (!questionsData) {
        console.error("questionsData is undefined or null");
        dispatch({ type: "dataFailed" });
        return;
      }

      console.log("questionsData type:", typeof questionsData);
      console.log("Has sections?", Boolean(questionsData.sections));

      // Convert flat structure to sections structure if needed
      let formattedData = questionsData;

      // If data has questions array but no sections array, convert it
      if (questionsData.questions && !questionsData.sections) {
        console.log("Converting flat questions array to sections format");
        formattedData = {
          sections: [
            {
              name: "General Section",
              questions: questionsData.questions,
            },
          ],
        };
        console.log("Converted data:", formattedData);
      }

      // Now check if the (possibly converted) data has valid sections
      if (
        !formattedData.sections ||
        !Array.isArray(formattedData.sections) ||
        formattedData.sections.length === 0
      ) {
        console.error("Invalid data structure after conversion");
        dispatch({ type: "dataFailed" });
        return;
      }

      // Log the first section for verification
      console.log("First section after processing:", formattedData.sections[0]);

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
