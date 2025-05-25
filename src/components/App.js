import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import SectionCompleteScreen from "./SectionCompleteScreen";
import Footer from "./Footer";
import Timer from "./Timer";
import { useQuiz } from "../contexts/QuizContext";

export default function App() {
  const { status, sectionCompleted } = useQuiz();

  // Only show the header on initial screens (loading, error, ready)
  const showHeader =
    status === "loading" || status === "error" || status === "ready";

  return (
    <div className="app">
      {showHeader && <Header />}

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen />}
        {status === "active" && !sectionCompleted && (
          <>
            <Progress />
            <Question />
            <Footer>
              <Timer />
              <NextButton />
            </Footer>
          </>
        )}
        {status === "active" && sectionCompleted && <SectionCompleteScreen />}
        {status === "finished" && <FinishScreen />}
      </Main>
    </div>
  );
}
