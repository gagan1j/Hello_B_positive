import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Join from "./component/Join/Join";
import Chat from "./component/chat/chat";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Join />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
