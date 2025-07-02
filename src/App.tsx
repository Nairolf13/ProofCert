import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider';
import MultiversXProvider from './hooks/MultiversXProvider';
import AppRouter from './router';

function App() {
  return (
    <MultiversXProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-app-background flex">
            {/* Sidebar/Navbar */}
            <AppRouter />
          </div>
        </Router>
      </AuthProvider>
    </MultiversXProvider>
  );
}

export default App;
