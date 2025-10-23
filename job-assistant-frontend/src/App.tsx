import Chat from "./pages/Chat";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
